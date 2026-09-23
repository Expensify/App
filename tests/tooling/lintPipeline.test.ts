import {describe, expect, it} from 'bun:test';

import fs from 'node:fs';
import path from 'node:path';

import type {ESLintJSONResult} from '../../scripts/lint/eslint/ESLintLinter';
import type {OxlintConfig, OxlintDiagnostic} from '../../scripts/lint/oxlint/OxlintLinter';
import type {LintMessage, LinterResult} from '../../scripts/lint/types';

import {oxlintCodeToESLintRuleID} from '../../config/oxlint/ruleNames.mjs';
import {normalizeESLintResults, parseESLintStdout} from '../../scripts/lint/eslint/ESLintLinter';
import JSONFormatter from '../../scripts/lint/formatters/JSONFormatter';
import StylishFormatter from '../../scripts/lint/formatters/StylishFormatter';
import Linter from '../../scripts/lint/Linter';
import Pipeline from '../../scripts/lint/LintPipeline';
import {
    defaultShardCount,
    deriveLegConfigs,
    isTransientFailure,
    jsPluginName,
    loadOxlintConfig,
    mergeShardResults,
    normalizeOxlintDiagnostics,
    parseOxlintStdout,
    producedNoJSON,
    resolveShardCount,
    shardFiles,
} from '../../scripts/lint/oxlint/OxlintLinter';
import {filterReactCompilerMessages, shouldPersistCompilerCache} from '../../scripts/lint/processors/ReactCompilerFilter';
import Seatbelt, {SEATBELT_TSV_BY_LINTER, parseSeatbeltTSV, resolveSeatbeltOptions} from '../../scripts/lint/processors/Seatbelt';
import {NO_DEPRECATED_RULE_ID, stratifyMessages} from '../../scripts/lint/processors/StratifyNoDeprecated';
import {LINT_SEVERITY} from '../../scripts/lint/types';

function makeMessage(overrides: Partial<LintMessage> = {}): LintMessage {
    return {
        filePath: '/tmp/src/file.ts',
        ruleID: 'no-console',
        severity: LINT_SEVERITY.ERROR,
        message: 'x',
        line: 1,
        column: 1,
        ...overrides,
    };
}

class StubLinter extends Linter {
    readonly name = 'stub';

    constructor(private readonly result: LinterResult) {
        super();
    }

    run(): Promise<LinterResult> {
        return Promise.resolve(this.result);
    }
}

describe('resolveSeatbeltOptions', () => {
    const root = '/repo';

    it('defaults readOnly on when CI is unset', () => {
        const options = resolveSeatbeltOptions(root, {});
        expect(options.readOnly).toBe(true);
        expect(options.frozen).toBe(false);
        expect(options.disable).toBe(false);
    });

    it('defaults readOnly off in CI', () => {
        expect(resolveSeatbeltOptions(root, {CI: 'true'}).readOnly).toBe(false);
    });

    it('lets SEATBELT_INCREASE force writes even locally', () => {
        const options = resolveSeatbeltOptions(root, {
            SEATBELT_INCREASE: 'no-console',
        });
        expect(options.readOnly).toBe(false);
        expect(options.allowIncreaseRules).toEqual(new Set(['no-console']));
    });

    it('lets SEATBELT_INCREASE override SEATBELT_READ_ONLY', () => {
        const options = resolveSeatbeltOptions(root, {
            SEATBELT_INCREASE: 'no-console',
            SEATBELT_READ_ONLY: '1',
        });
        expect(options.readOnly).toBe(false);
        expect(options.allowIncreaseRules).toEqual(new Set(['no-console']));
    });

    it('defaults to the ESLint baseline and takes a per-linter override', () => {
        expect(resolveSeatbeltOptions(root, {}).seatbeltFile).toBe(`${root}/${SEATBELT_TSV_BY_LINTER.eslint}`);
        expect(resolveSeatbeltOptions(root, {}, SEATBELT_TSV_BY_LINTER.oxlint).seatbeltFile).toBe(`${root}/${SEATBELT_TSV_BY_LINTER.oxlint}`);
        expect(SEATBELT_TSV_BY_LINTER.eslint).not.toBe(SEATBELT_TSV_BY_LINTER.oxlint);
    });

    it('parses SEATBELT_INCREASE=ALL', () => {
        expect(resolveSeatbeltOptions(root, {SEATBELT_INCREASE: 'ALL'}).allowIncreaseRules).toBe('all');
    });

    it('treats 0/false/no as false for boolean env vars', () => {
        expect(resolveSeatbeltOptions(root, {SEATBELT_DISABLE: '0'}).disable).toBe(false);
        expect(resolveSeatbeltOptions(root, {SEATBELT_DISABLE: 'false'}).disable).toBe(false);
        expect(resolveSeatbeltOptions(root, {SEATBELT_FROZEN: '1'}).frozen).toBe(true);
    });
});

describe('extractJSONArray via runESLint stdout', () => {
    it('normalizes results even when babel logs wrap the JSON array', () => {
        const wrapped = `babel.config.js\n  - running in: undefined\n${JSON.stringify([
            {
                filePath: '/repo/src/a.ts',
                messages: [
                    {
                        ruleId: 'no-console',
                        severity: 2,
                        message: 'nope',
                        line: 3,
                        column: 4,
                    },
                ],
            },
        ])}\n`;
        const start = wrapped.indexOf('[');
        const end = wrapped.lastIndexOf(']');
        const parsed: unknown = JSON.parse(wrapped.slice(start, end + 1));
        if (!Array.isArray(parsed)) {
            throw new Error('expected JSON array');
        }
        const [first] = normalizeESLintResults(
            parsed.filter((value): value is ESLintJSONResult => {
                return typeof value === 'object' && value !== null && 'filePath' in value && 'messages' in value;
            }),
        );
        expect(first?.messages.at(0)?.ruleID).toBe('no-console');
    });
});

describe('normalizeESLintResults', () => {
    it('copies ESLint JSON into the linter-agnostic message shape', () => {
        const [result] = normalizeESLintResults([
            {
                filePath: '/repo/src/a.ts',
                messages: [
                    {
                        ruleId: 'no-console',
                        severity: 2,
                        message: 'nope',
                        line: 3,
                        column: 4,
                    },
                ],
            },
        ]);
        expect(result.filePath).toBe('/repo/src/a.ts');
        expect(result.messages).toEqual([
            {
                filePath: '/repo/src/a.ts',
                ruleID: 'no-console',
                severity: LINT_SEVERITY.ERROR,
                message: 'nope',
                line: 3,
                column: 4,
                endLine: undefined,
                endColumn: undefined,
                suggestions: undefined,
                fix: undefined,
            },
        ]);
    });
});

describe('filterReactCompilerMessages', () => {
    it('skips the compiler for files with no suppressible message', async () => {
        let called = 0;
        const messages = [makeMessage({ruleID: 'no-console'})];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => {
            called++;
            return true;
        });
        expect(called).toBe(0);
        expect(result).toEqual(messages);
    });

    it('drops suppressible messages when both compilers memoize the file', async () => {
        const messages = [
            makeMessage({ruleID: 'react/jsx-no-constructed-context-values'}),
            makeMessage({
                ruleID: 'react-hooks/exhaustive-deps',
                message: 'React Hook useCallback() Hook is missing a dependency',
            }),
            makeMessage({ruleID: 'no-console'}),
        ];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => true);
        expect(result.map((message) => message.ruleID)).toEqual(['no-console']);
    });

    it('keeps suppressible messages when either compiler skips memoization', async () => {
        const messages = [makeMessage({ruleID: 'react/jsx-no-constructed-context-values'})];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => false);
        expect(result).toEqual(messages);
    });

    it('does not suppress genuine exhaustive-deps missing-deps warnings', async () => {
        const messages = [
            makeMessage({
                ruleID: 'react-hooks/exhaustive-deps',
                message: 'React Hook useEffect has a missing dependency: "foo"',
            }),
        ];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => true);
        expect(result).toEqual(messages);
    });

    it('keeps suppressible messages when a compiler check throws', async () => {
        const messages = [makeMessage({ruleID: 'react/jsx-no-constructed-context-values'})];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => {
            throw new Error('compiler boom');
        });
        expect(result).toEqual(messages);
    });

    it('keeps suppressible messages when the source file cannot be read', async () => {
        const messages = [
            makeMessage({
                filePath: '/tmp/does-not-exist.tsx',
                ruleID: 'react/jsx-no-constructed-context-values',
            }),
        ];
        const result = await filterReactCompilerMessages(messages, '/tmp');
        expect(result).toEqual(messages);
    });

    it('does not persist fallback compiler failures to cache', () => {
        expect(
            shouldPersistCompilerCache({
                filename: 'a.tsx',
                bothMemoized: false,
                cacheable: false,
            }),
        ).toBe(false);
        expect(
            shouldPersistCompilerCache({
                filename: 'a.tsx',
                bothMemoized: false,
                cacheable: true,
            }),
        ).toBe(true);
        expect(
            shouldPersistCompilerCache({
                filename: 'a.tsx',
                bothMemoized: true,
                cacheable: true,
            }),
        ).toBe(true);
        expect(shouldPersistCompilerCache(undefined)).toBe(false);
    });
});

describe('stratifyMessages', () => {
    it('rewrites no-deprecated using the source expression at the lint location', () => {
        const source = 'const x = StyleSheet.absoluteFillObject;\n';
        const messages = [
            makeMessage({
                ruleID: '@typescript-eslint/no-deprecated',
                message: '`absoluteFillObject` is deprecated.',
                line: 1,
                column: 11,
            }),
        ];
        const result = stratifyMessages(messages, source);
        expect(result.at(0)?.ruleID).toBe('@typescript-eslint/no-deprecated/StyleSheet.absoluteFillObject');
    });

    it('falls back to the backtick symbol in the message when there is no source', () => {
        const messages = [
            makeMessage({
                ruleID: '@typescript-eslint/no-deprecated',
                message: '`Foo.bar` is deprecated.',
            }),
        ];
        expect(stratifyMessages(messages, null).at(0)?.ruleID).toBe('@typescript-eslint/no-deprecated/Foo.bar');
    });

    it('leaves other rules alone', () => {
        const messages = [makeMessage({ruleID: 'no-console'})];
        expect(stratifyMessages(messages, 'console.log(1)\n')).toEqual(messages);
    });
});

function oxlintDiagnostic(overrides: Partial<OxlintDiagnostic> = {}): OxlintDiagnostic {
    return {
        message: 'nope',
        code: 'eslint(no-console)',
        severity: 'error',
        filename: 'src/a.ts',
        labels: [{span: {offset: 42, length: 7, line: 3, column: 4}}],
        ...overrides,
    };
}

function oxlintStdout(diagnostics: OxlintDiagnostic[], numberOfFiles = 1, prefix = ''): string {
    return `${prefix}{ "diagnostics": ${JSON.stringify(diagnostics)},\n  "number_of_files": ${numberOfFiles},\n  "number_of_rules": 475\n}\n`;
}

describe('normalizeOxlintDiagnostics', () => {
    it('maps every plugin prefix the repo produces to its ESLint rule id', () => {
        const expected: Array<[string, string]> = [
            ['typescript(no-unsafe-type-assertion)', '@typescript-eslint/no-unsafe-type-assertion'],
            ['import(no-cycle)', 'import/no-cycle'],
            ['rc(set-state-in-effect)', 'react-hooks/set-state-in-effect'],
            ['core(no-restricted-syntax)', 'no-restricted-syntax'],
            ['rulesdir(no-onyx-connect)', 'rulesdir/no-onyx-connect'],
            ['unicorn(prefer-at)', 'unicorn/prefer-at'],
            ['eslint(no-restricted-imports)', 'no-restricted-imports'],
            ['react(jsx-key)', 'react/jsx-key'],
            ['hosted(naming-convention)', '@typescript-eslint/naming-convention'],
            ['eslint(no-object-constructor)', 'no-new-object'],
            ['react(exhaustive-deps)', 'react-hooks/exhaustive-deps'],
        ];
        const diagnostics = expected.map(([code]) => oxlintDiagnostic({code}));
        const [file] = normalizeOxlintDiagnostics(diagnostics, '/repo', ['src/a.ts']);
        expect(file.messages.map((message) => message.ruleID)).toEqual(expected.map(([, ruleID]) => ruleID));
    });

    it('resolves oxlint cwd-relative paths against the project root', () => {
        const [file] = normalizeOxlintDiagnostics([oxlintDiagnostic()], '/repo', ['src/a.ts']);
        expect(file.filePath).toBe('/repo/src/a.ts');
        expect(file.messages.at(0)?.filePath).toBe('/repo/src/a.ts');
    });

    it('keeps the linted files that produced no diagnostic, so the seatbelt can ratchet down', () => {
        const files = normalizeOxlintDiagnostics([oxlintDiagnostic()], '/repo', ['src/a.ts', 'src/clean.ts']);
        expect(files.map((file) => file.filePath)).toEqual(['/repo/src/a.ts', '/repo/src/clean.ts']);
        expect(files.at(1)?.messages).toEqual([]);
    });

    it('passes 1-based line and column through, and defaults a label-less diagnostic to 0', () => {
        const [file] = normalizeOxlintDiagnostics([oxlintDiagnostic(), oxlintDiagnostic({labels: []})], '/repo', ['src/a.ts']);
        expect(file.messages.at(0)).toMatchObject({line: 3, column: 4});
        expect(file.messages.at(1)).toMatchObject({line: 0, column: 0});
    });

    it('folds help and note into the message, which is the only text field downstream reads', () => {
        const diagnostic = oxlintDiagnostic({
            message: 'Dependency cycle detected',
            help: 'Refactor to remove the cycle.',
            note: 'These paths form a cycle:\nA -> B -> A',
        });
        const [file] = normalizeOxlintDiagnostics([diagnostic], '/repo', ['src/a.ts']);
        expect(file.messages.at(0)?.message).toBe('Dependency cycle detected\nRefactor to remove the cycle.\nThese paths form a cycle:\nA -> B -> A');
    });

    it('demotes oxlint warning and advice severities, and treats everything else as an error', () => {
        const diagnostics = [oxlintDiagnostic({severity: 'warning'}), oxlintDiagnostic({severity: 'advice'}), oxlintDiagnostic({severity: 'error'})];
        const [file] = normalizeOxlintDiagnostics(diagnostics, '/repo', ['src/a.ts']);
        expect(file.messages.map((message) => message.severity)).toEqual([LINT_SEVERITY.WARNING, LINT_SEVERITY.WARNING, LINT_SEVERITY.ERROR]);
    });

    it('throws on a hosted rule with no known ESLint origin rather than emitting an unmatchable id', () => {
        expect(() => normalizeOxlintDiagnostics([oxlintDiagnostic({code: 'hosted(not-a-hosted-rule)'})], '/repo', ['src/a.ts'])).toThrow(/not-a-hosted-rule/);
    });
});

describe('parseOxlintStdout', () => {
    it('parses the report even when oxlint prints a warning to stdout ahead of it', () => {
        const parsed = parseOxlintStdout(oxlintStdout([oxlintDiagnostic()], 1, 'No files found to lint. Please check your paths and ignore patterns.\n'), '', 1, '/repo', ['src/a.ts']);
        expect(parsed.exitCode).toBe(1);
        expect(parsed.files.at(0)?.messages.at(0)?.ruleID).toBe('no-console');
    });

    it('treats a config that failed to parse as fatal, even though oxlint exits 1', () => {
        const configError = "Failed to parse oxlint configuration file.\n\n  x Rule 'nope' not found in plugin 'eslint'\n";
        const parsed = parseOxlintStdout(configError, '', 1, '/repo', ['src/a.ts']);
        expect(parsed.exitCode).toBe(2);
        expect(parsed.files).toEqual([]);
        expect(parsed.stderr).toContain('Failed to parse Oxlint JSON output');
    });

    it('treats a diagnostic with no rule code as a crashing JS plugin, not a finding', () => {
        const parsed = parseOxlintStdout(oxlintStdout([oxlintDiagnostic({code: undefined, message: 'plugin blew up'})]), '', 1, '/repo', ['src/a.ts']);
        expect(parsed.exitCode).toBe(2);
        expect(parsed.files).toEqual([]);
        expect(parsed.stderr).toContain('no rule code');
        expect(parsed.stderr).toContain('plugin blew up');
    });

    it('rejects a JSON object that is not an oxlint report', () => {
        expect(parseOxlintStdout('{"oops": true}', '', 1, '/repo', []).exitCode).toBe(2);
    });

    it('preserves an oxlint crash exit code above 2', () => {
        expect(parseOxlintStdout('', 'oom', 137, '/repo', []).exitCode).toBe(137);
    });

    it('surfaces an Oxlint fatal through the pipeline the same way an ESLint one does', async () => {
        const parsed = parseOxlintStdout('Failed to parse oxlint configuration file.', '', 1, '/repo', []);
        const pipeline = new Pipeline('/tmp', new StubLinter(parsed), [new Seatbelt(resolveSeatbeltOptions('/tmp', {SEATBELT_DISABLE: '1'}))], new StylishFormatter('/tmp', false));
        const result = await pipeline.run(['.']);
        expect(result.exitCode).toBe(2);
        expect(result.reportText).toContain('Failed to parse Oxlint JSON output');
    });
});

describe('oxlint sharding', () => {
    function shardResult(filePath: string, exitCode: number, messages: LintMessage[] = []): LinterResult {
        return {files: [{filePath, messages}], exitCode, stderr: ''};
    }

    it('interleaves files across shards so adjacent paths land in different buckets', () => {
        const files = Array.from({length: 10}, (_, i) => `src/f${i}.ts`);
        const shards = shardFiles(files, 3);
        expect(shards.map((shard) => shard.length)).toEqual([4, 3, 3]);
        expect(shards.at(0)).toEqual(['src/f0.ts', 'src/f3.ts', 'src/f6.ts', 'src/f9.ts']);
        expect(shards.flat().sort()).toEqual([...files].sort());
    });

    it('a shard count of 1 or more than the file count never drops or duplicates a file', () => {
        const files = ['a.ts', 'b.ts', 'c.ts'];
        expect(shardFiles(files, 1)).toEqual([files]);
        expect(shardFiles(files, 99).flat().sort()).toEqual(files);
        expect(shardFiles(files, 99)).toHaveLength(3);
    });

    it('auto-shards by machine size and honours explicit overrides', () => {
        expect(resolveShardCount(undefined)).toBeGreaterThanOrEqual(1);
        expect(resolveShardCount('')).toBeGreaterThanOrEqual(1);
        expect(resolveShardCount('6')).toBe(6);
        expect(resolveShardCount('0')).toBe(1);
        expect(resolveShardCount('not-a-number')).toBe(1);
    });

    it('sizes the JS-plugin shards by half the cores, minus the memory one type-aware process needs', () => {
        const gib = 1073741824;
        expect(defaultShardCount(14, 48 * gib)).toBe(7);
        expect(defaultShardCount(14, 18 * gib)).toBe(4);
        expect(defaultShardCount(4, 16 * gib)).toBe(2);
        expect(defaultShardCount(4, 4 * gib)).toBe(1);
        expect(defaultShardCount(1, 64 * gib)).toBe(1);
    });

    it('derives the rule prefix of a jsPlugins entry the way oxlint does', () => {
        expect(
            jsPluginName({
                name: 'rulesdir',
                specifier: './config/oxlint/plugins/expensify-rules.mjs',
            }),
        ).toBe('rulesdir');
        expect(jsPluginName('eslint-plugin-lodash')).toBe('lodash');
        expect(jsPluginName('@dword-design/eslint-plugin-import-alias')).toBe('@dword-design/import-alias');
        expect(jsPluginName('@scope/eslint-plugin')).toBe('@scope');
    });

    /* eslint-disable @typescript-eslint/naming-convention */
    it('splits the config into a JS-plugin leg without type information and a type-aware leg without JS plugins', () => {
        const config: OxlintConfig = {
            plugins: ['typescript', 'import'],
            jsPlugins: [{name: 'rulesdir', specifier: './plugins/rules.mjs'}, 'eslint-plugin-lodash'],
            options: {typeAware: true},
            ignorePatterns: ['dist/**'],
            rules: {
                'no-console': 'error',
                'typescript/no-floating-promises': 'error',
                'rulesdir/no-onyx-connect': 'error',
                'lodash/import-scope': ['error', 'method'],
            },
            overrides: [
                {
                    files: ['**/*.test.ts'],
                    jsPlugins: ['@dword-design/eslint-plugin-import-alias'],
                    rules: {
                        '@dword-design/import-alias/prefer-alias': 'error',
                        'no-console': 'off',
                    },
                },
                {files: ['**/*.js'], rules: {'rulesdir/no-onyx-connect': 'off'}},
            ],
        };
        const {jsPlugins, typeAware} = deriveLegConfigs(config);

        expect(jsPlugins.options).toEqual({typeAware: false});
        expect(jsPlugins.jsPlugins).toEqual(config.jsPlugins);
        expect(jsPlugins.rules).toEqual(config.rules);
        expect(jsPlugins.overrides).toEqual(config.overrides);

        expect(typeAware.options).toEqual({typeAware: true});
        expect(typeAware).not.toHaveProperty('jsPlugins');
        expect(typeAware.rules).toEqual({
            'no-console': 'error',
            'typescript/no-floating-promises': 'error',
        });
        expect(typeAware.overrides).toEqual([
            {files: ['**/*.test.ts'], rules: {'no-console': 'off'}},
            {files: ['**/*.js'], rules: {}},
        ]);
        expect(typeAware.overrides?.at(0)).not.toHaveProperty('jsPlugins');

        expect(typeAware.ignorePatterns).toEqual(['dist/**']);
        expect(typeAware.plugins).toEqual(['typescript', 'import']);
        expect(config.jsPlugins).toHaveLength(2);
        expect(config.options).toEqual({typeAware: true});
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    it('drops a finding a later leg repeats for the same file, but keeps one a single leg reports twice', () => {
        const native = makeMessage({ruleID: 'no-console', line: 3, column: 4});
        const typeAwareOnly = makeMessage({
            ruleID: '@typescript-eslint/no-floating-promises',
            line: 9,
            column: 1,
        });
        const twiceInOneLeg = makeMessage({
            ruleID: 'react-hooks/refs',
            line: 12,
            column: 5,
        });
        const merged = mergeShardResults([shardResult('/repo/a.ts', 1, [native, twiceInOneLeg, twiceInOneLeg]), shardResult('/repo/a.ts', 1, [native, typeAwareOnly])]);
        expect(merged.files).toHaveLength(1);
        expect(merged.files.at(0)?.messages).toEqual([native, twiceInOneLeg, twiceInOneLeg, typeAwareOnly]);
    });

    it('retries a leg that died, not one that failed deterministically', () => {
        expect(isTransientFailure('', 137)).toBe(true);
        expect(isTransientFailure('Error running tsgolint: "exit status: exit status: 1"\n', 1)).toBe(true);
        expect(isTransientFailure(oxlintStdout([]), 137)).toBe(true);
        expect(isTransientFailure(oxlintStdout([]), 134)).toBe(true);
        expect(isTransientFailure(oxlintStdout([oxlintDiagnostic({code: undefined, message: 'plugin blew up'})]), 1)).toBe(false);
        expect(isTransientFailure(oxlintStdout([oxlintDiagnostic()], 1), 1)).toBe(false);
        expect(isTransientFailure(oxlintStdout([]), 0)).toBe(false);
    });

    it('merges shards by concatenating files and taking the worst exit code', () => {
        const merged = mergeShardResults([shardResult('/repo/a.ts', 0, [makeMessage()]), shardResult('/repo/b.ts', 1, [makeMessage()]), shardResult('/repo/c.ts', 0)]);
        expect(merged.exitCode).toBe(1);
        expect(merged.files.map((file) => file.filePath)).toEqual(['/repo/a.ts', '/repo/b.ts', '/repo/c.ts']);
    });

    it('a crashed JS plugin in one shard is fatal and dominates clean shards', () => {
        const clean = parseOxlintStdout(oxlintStdout([oxlintDiagnostic()], 1), '', 1, '/repo', ['src/a.ts']);
        const crash = parseOxlintStdout(oxlintStdout([oxlintDiagnostic({code: undefined, message: 'plugin blew up'})]), '', 1, '/repo', ['src/b.ts']);
        const merged = mergeShardResults([clean, crash]);
        expect(merged.exitCode).toBe(2);
        expect(merged.stderr).toContain('plugin blew up');
    });

    it('only a shard that produced no JSON is worth retrying', () => {
        // A killed process writes nothing, and a config error prints its complaint without JSON.
        expect(producedNoJSON('')).toBe(true);
        expect(producedNoJSON('Failed to parse oxlint configuration file.\n  x Rule not found\n')).toBe(true);

        // Deterministic failures are not retried: both of these carry a JSON body.
        expect(producedNoJSON(oxlintStdout([oxlintDiagnostic({code: undefined, message: 'plugin blew up'})]))).toBe(false);
        expect(producedNoJSON(oxlintStdout([oxlintDiagnostic()], 1))).toBe(false);
        expect(producedNoJSON(oxlintStdout([]))).toBe(false);

        // Oxlint prints warnings ahead of the JSON, which must not read as a dead shard.
        expect(producedNoJSON(`No files found to lint.\n${oxlintStdout([])}`)).toBe(false);
    });
});

describe('oxlint rule names', () => {
    it('every rule id in the oxlint seatbelt is one the enabled config still produces through the mapping', async () => {
        const root = path.join(import.meta.dir, '..', '..');
        const config = await loadOxlintConfig(root);
        const configuredRules = [config.rules, ...(config.overrides ?? []).map((override) => override.rules)].flatMap((rules) => Object.keys(rules ?? {}));
        const toDiagnosticCode = (rule: string) => {
            const slash = rule.lastIndexOf('/');
            return slash < 0 ? `eslint(${rule})` : `${rule.slice(0, slash).replace('jsx-a11y', 'jsx_a11y')}(${rule.slice(slash + 1)})`;
        };
        const reachable = new Set(configuredRules.map((rule) => oxlintCodeToESLintRuleID(toDiagnosticCode(rule))));

        const {data} = parseSeatbeltTSV(fs.readFileSync(path.join(root, SEATBELT_TSV_BY_LINTER.oxlint), 'utf8'));
        const seatbeltRuleIDs = new Set(
            [...data.values()].flatMap((file) => file.lines.map((line) => (line.ruleID.startsWith(`${NO_DEPRECATED_RULE_ID}/`) ? NO_DEPRECATED_RULE_ID : line.ruleID))),
        );

        expect(seatbeltRuleIDs.size).toBeGreaterThan(20);
        expect([...seatbeltRuleIDs].filter((ruleID) => !reachable.has(ruleID))).toEqual([]);
    });
});

function knownOxlintPlugins(schema: unknown): string[] {
    if (typeof schema !== 'object' || schema === null || !('definitions' in schema)) {
        return [];
    }
    const definitions: unknown = schema.definitions;
    if (typeof definitions !== 'object' || definitions === null || !('LintPluginOptionsSchema' in definitions)) {
        return [];
    }
    const pluginSchema: unknown = definitions.LintPluginOptionsSchema;
    if (typeof pluginSchema !== 'object' || pluginSchema === null || !('enum' in pluginSchema) || !Array.isArray(pluginSchema.enum)) {
        return [];
    }
    return pluginSchema.enum.filter((entry): entry is string => typeof entry === 'string');
}

describe('oxlint config', () => {
    it('names only plugins oxlint knows, at the root and in every override', async () => {
        // An unknown name in an override's `plugins` array is not an error: the override's other rules
        // keep working while the rules the missing plugin owns report nothing.
        const root = path.join(import.meta.dir, '..', '..');
        const known = new Set(knownOxlintPlugins(JSON.parse(fs.readFileSync(path.join(root, 'node_modules/oxlint/configuration_schema.json'), 'utf8'))));
        expect(known.size).toBeGreaterThan(5);

        const config = await loadOxlintConfig(root);
        const named = [config.plugins, ...(config.overrides ?? []).map((override) => override.plugins)].flatMap((plugins: unknown) =>
            Array.isArray(plugins) ? plugins.map((entry: unknown) => entry) : [],
        );
        expect(named.filter((plugin) => typeof plugin !== 'string' || !known.has(plugin))).toEqual([]);
    });
});

describe('JSONFormatter', () => {
    it('emits the linter-agnostic message list, warnings included', () => {
        const messages = [makeMessage(), makeMessage({severity: LINT_SEVERITY.WARNING, ruleID: 'no-debugger'})];
        const result = new JSONFormatter().format(messages);
        expect(JSON.parse(result.text)).toEqual({
            messages,
            errorCount: 1,
            warningCount: 1,
        });
        expect(result.errorCount).toBe(1);
        expect(result.warningCount).toBe(1);
    });

    it('emits an empty report that still parses, rather than an empty string', () => {
        const result = new JSONFormatter().format([]);
        expect(JSON.parse(result.text)).toEqual({
            messages: [],
            errorCount: 0,
            warningCount: 0,
        });
    });
});

describe('Pipeline', () => {
    it('returns the linter exit code when the linter itself crashed', async () => {
        const pipeline = new Pipeline(
            '/tmp',
            new StubLinter({files: [], exitCode: 2, stderr: 'oops'}),
            [new Seatbelt(resolveSeatbeltOptions('/tmp', {SEATBELT_DISABLE: '1'}))],
            new StylishFormatter('/tmp', false),
        );
        const result = await pipeline.run(['.']);
        expect(result.exitCode).toBe(2);
        expect(result.reportText).toBe('oops');
    });

    it('treats a JSON parse failure with ESLint exit 0 or 1 as fatal', async () => {
        const parsed = parseESLintStdout('not json', '', 1);
        expect(parsed.exitCode).toBe(2);
        expect(parsed.files).toEqual([]);
        expect(parsed.stderr).toContain('Failed to parse ESLint JSON output');

        const pipeline = new Pipeline('/tmp', new StubLinter(parsed), [new Seatbelt(resolveSeatbeltOptions('/tmp', {SEATBELT_DISABLE: '1'}))], new StylishFormatter('/tmp', false));
        const result = await pipeline.run(['.']);
        expect(result.exitCode).toBe(2);
        expect(result.reportText).toContain('Failed to parse ESLint JSON output');
        expect(parseESLintStdout('', '', 0).exitCode).toBe(2);
    });

    it('preserves a linter crash exit code above 2 on parse failure', () => {
        expect(parseESLintStdout('', 'oom', 137).exitCode).toBe(137);
    });
});
