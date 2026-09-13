import {describe, expect, it} from 'bun:test';

import type {ESLintJSONResult} from '../../scripts/lint/eslint/ESLintLinter';
import type {OxlintDiagnostic} from '../../scripts/lint/oxlint/OxlintLinter';
import type {LintMessage, LinterResult} from '../../scripts/lint/types';

import {normalizeESLintResults, parseESLintStdout} from '../../scripts/lint/eslint/ESLintLinter';
import JSONFormatter from '../../scripts/lint/formatters/JSONFormatter';
import StylishFormatter from '../../scripts/lint/formatters/StylishFormatter';
import Linter from '../../scripts/lint/Linter';
import Pipeline from '../../scripts/lint/LintPipeline';
import {normalizeOxlintDiagnostics, parseOxlintStdout} from '../../scripts/lint/oxlint/OxlintLinter';
import {filterReactCompilerMessages, shouldPersistCompilerCache} from '../../scripts/lint/processors/ReactCompilerFilter';
import Seatbelt, {SEATBELT_TSV_BY_LINTER, resolveSeatbeltOptions} from '../../scripts/lint/processors/Seatbelt';
import {stratifyMessages} from '../../scripts/lint/processors/StratifyNoDeprecated';
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
        const options = resolveSeatbeltOptions(root, {SEATBELT_INCREASE: 'no-console'});
        expect(options.readOnly).toBe(false);
        expect(options.allowIncreaseRules).toEqual(new Set(['no-console']));
    });

    it('lets SEATBELT_INCREASE override SEATBELT_READ_ONLY', () => {
        const options = resolveSeatbeltOptions(root, {SEATBELT_INCREASE: 'no-console', SEATBELT_READ_ONLY: '1'});
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
            {filePath: '/repo/src/a.ts', messages: [{ruleId: 'no-console', severity: 2, message: 'nope', line: 3, column: 4}]},
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
                messages: [{ruleId: 'no-console', severity: 2, message: 'nope', line: 3, column: 4}],
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
            makeMessage({ruleID: 'react-hooks/exhaustive-deps', message: 'React Hook useCallback() Hook is missing a dependency'}),
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
        const messages = [makeMessage({ruleID: 'react-hooks/exhaustive-deps', message: 'React Hook useEffect has a missing dependency: "foo"'})];
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
        const messages = [makeMessage({filePath: '/tmp/does-not-exist.tsx', ruleID: 'react/jsx-no-constructed-context-values'})];
        const result = await filterReactCompilerMessages(messages, '/tmp');
        expect(result).toEqual(messages);
    });

    it('does not persist fallback compiler failures to cache', () => {
        expect(shouldPersistCompilerCache({filename: 'a.tsx', bothMemoized: false, cacheable: false})).toBe(false);
        expect(shouldPersistCompilerCache({filename: 'a.tsx', bothMemoized: false, cacheable: true})).toBe(true);
        expect(shouldPersistCompilerCache({filename: 'a.tsx', bothMemoized: true, cacheable: true})).toBe(true);
        expect(shouldPersistCompilerCache(undefined)).toBe(false);
    });
});

describe('stratifyMessages', () => {
    it('rewrites no-deprecated using the source expression at the lint location', () => {
        const source = 'const x = StyleSheet.absoluteFillObject;\n';
        const messages = [makeMessage({ruleID: '@typescript-eslint/no-deprecated', message: '`absoluteFillObject` is deprecated.', line: 1, column: 11})];
        const result = stratifyMessages(messages, source);
        expect(result.at(0)?.ruleID).toBe('@typescript-eslint/no-deprecated/StyleSheet.absoluteFillObject');
    });

    it('falls back to the backtick symbol in the message when there is no source', () => {
        const messages = [makeMessage({ruleID: '@typescript-eslint/no-deprecated', message: '`Foo.bar` is deprecated.'})];
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
        const diagnostic = oxlintDiagnostic({message: 'Dependency cycle detected', help: 'Refactor to remove the cycle.', note: 'These paths form a cycle:\nA -> B -> A'});
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

describe('JSONFormatter', () => {
    it('emits the linter-agnostic message list, warnings included', () => {
        const messages = [makeMessage(), makeMessage({severity: LINT_SEVERITY.WARNING, ruleID: 'no-debugger'})];
        const result = new JSONFormatter().format(messages);
        expect(JSON.parse(result.text)).toEqual({messages, errorCount: 1, warningCount: 1});
        expect(result.errorCount).toBe(1);
        expect(result.warningCount).toBe(1);
    });

    it('emits an empty report that still parses, rather than an empty string', () => {
        const result = new JSONFormatter().format([]);
        expect(JSON.parse(result.text)).toEqual({messages: [], errorCount: 0, warningCount: 0});
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
