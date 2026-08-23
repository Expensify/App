import {describe, expect, it} from 'bun:test';

import type {LintMessage, LinterResult} from '../../scripts/lint/types';

import {normalizeEslintResults, parseEslintStdout} from '../../scripts/lint/eslint/EslintLinter';
import StylishFormatter from '../../scripts/lint/formatters/StylishFormatter';
import Linter from '../../scripts/lint/Linter';
import Pipeline from '../../scripts/lint/LintPipeline';
import {filterReactCompilerMessages} from '../../scripts/lint/processors/ReactCompilerFilter';
import Seatbelt, {resolveSeatbeltOptions} from '../../scripts/lint/processors/Seatbelt';
import {stratifyMessages} from '../../scripts/lint/processors/StratifyNoDeprecated';

function makeMessage(overrides: Partial<LintMessage> = {}): LintMessage {
    return {
        filePath: '/tmp/src/file.ts',
        ruleId: 'no-console',
        severity: 2,
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

    it('parses SEATBELT_INCREASE=ALL', () => {
        expect(resolveSeatbeltOptions(root, {SEATBELT_INCREASE: 'ALL'}).allowIncreaseRules).toBe('all');
    });

    it('treats 0/false/no as false for boolean env vars', () => {
        expect(resolveSeatbeltOptions(root, {SEATBELT_DISABLE: '0'}).disable).toBe(false);
        expect(resolveSeatbeltOptions(root, {SEATBELT_DISABLE: 'false'}).disable).toBe(false);
        expect(resolveSeatbeltOptions(root, {SEATBELT_FROZEN: '1'}).frozen).toBe(true);
    });
});

describe('extractJsonArray via runEslint stdout', () => {
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
        const [first] = normalizeEslintResults(
            parsed.filter((value): value is {filePath: string; messages: Array<{ruleId: string; severity: number; message: string; line: number; column: number}>} => {
                return typeof value === 'object' && value !== null && 'filePath' in value && 'messages' in value;
            }),
        );
        expect(first?.messages.at(0)?.ruleId).toBe('no-console');
    });
});

describe('normalizeEslintResults', () => {
    it('copies ESLint JSON into the linter-agnostic message shape', () => {
        const [result] = normalizeEslintResults([
            {
                filePath: '/repo/src/a.ts',
                messages: [{ruleId: 'no-console', severity: 2, message: 'nope', line: 3, column: 4}],
            },
        ]);
        expect(result.filePath).toBe('/repo/src/a.ts');
        expect(result.messages).toEqual([
            {
                filePath: '/repo/src/a.ts',
                ruleId: 'no-console',
                severity: 2,
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
        const messages = [makeMessage({ruleId: 'no-console'})];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => {
            called++;
            return true;
        });
        expect(called).toBe(0);
        expect(result).toEqual(messages);
    });

    it('drops suppressible messages when both compilers memoize the file', async () => {
        const messages = [
            makeMessage({ruleId: 'react/jsx-no-constructed-context-values'}),
            makeMessage({ruleId: 'react-hooks/exhaustive-deps', message: 'React Hook useCallback() Hook is missing a dependency'}),
            makeMessage({ruleId: 'no-console'}),
        ];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => true);
        expect(result.map((message) => message.ruleId)).toEqual(['no-console']);
    });

    it('keeps suppressible messages when either compiler skips memoization', async () => {
        const messages = [makeMessage({ruleId: 'react/jsx-no-constructed-context-values'})];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => false);
        expect(result).toEqual(messages);
    });

    it('does not suppress genuine exhaustive-deps missing-deps warnings', async () => {
        const messages = [makeMessage({ruleId: 'react-hooks/exhaustive-deps', message: 'React Hook useEffect has a missing dependency: "foo"'})];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => true);
        expect(result).toEqual(messages);
    });

    it('keeps suppressible messages when a compiler check throws', async () => {
        const messages = [makeMessage({ruleId: 'react/jsx-no-constructed-context-values'})];
        const result = await filterReactCompilerMessages(messages, '/tmp', () => {
            throw new Error('compiler boom');
        });
        expect(result).toEqual(messages);
    });
});

describe('stratifyMessages', () => {
    it('rewrites no-deprecated using the source expression at the lint location', () => {
        const source = 'const x = StyleSheet.absoluteFillObject;\n';
        const messages = [makeMessage({ruleId: '@typescript-eslint/no-deprecated', message: '`absoluteFillObject` is deprecated.', line: 1, column: 11})];
        const result = stratifyMessages(messages, source);
        expect(result.at(0)?.ruleId).toBe('@typescript-eslint/no-deprecated/StyleSheet.absoluteFillObject');
    });

    it('falls back to the backtick symbol in the message when there is no source', () => {
        const messages = [makeMessage({ruleId: '@typescript-eslint/no-deprecated', message: '`Foo.bar` is deprecated.'})];
        expect(stratifyMessages(messages, null).at(0)?.ruleId).toBe('@typescript-eslint/no-deprecated/Foo.bar');
    });

    it('leaves other rules alone', () => {
        const messages = [makeMessage({ruleId: 'no-console'})];
        expect(stratifyMessages(messages, 'console.log(1)\n')).toEqual(messages);
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
        const parsed = parseEslintStdout('not json', '', 1);
        expect(parsed.exitCode).toBe(2);
        expect(parsed.files).toEqual([]);
        expect(parsed.stderr).toContain('Failed to parse ESLint JSON output');

        const pipeline = new Pipeline('/tmp', new StubLinter(parsed), [new Seatbelt(resolveSeatbeltOptions('/tmp', {SEATBELT_DISABLE: '1'}))], new StylishFormatter('/tmp', false));
        const result = await pipeline.run(['.']);
        expect(result.exitCode).toBe(2);
        expect(result.reportText).toContain('Failed to parse ESLint JSON output');
        expect(parseEslintStdout('', '', 0).exitCode).toBe(2);
    });

    it('preserves a linter crash exit code above 2 on parse failure', () => {
        expect(parseEslintStdout('', 'oom', 137).exitCode).toBe(137);
    });
});
