import type {ESLint} from 'eslint';
import {BANNED_RULE_ID, collectSuppressedBans, findNewBypasses} from '../../scripts/onyxConnectBypass';
import type {ResultWithSuppressed} from '../../scripts/onyxConnectBypass';

const PROJECT_ROOT = '/repo';

function makeResult(relativePath: string, suppressedMessages: ESLint.LintResult['suppressedMessages']): ResultWithSuppressed {
    return {filePath: `${PROJECT_ROOT}/${relativePath}`, suppressedMessages};
}

function suppressed(ruleId: string, line: number): ESLint.LintResult['suppressedMessages'][number] {
    return {ruleId, line, column: 1, message: 'x', severity: 2, suppressions: [{kind: 'directive', justification: ''}]};
}

describe('collectSuppressedBans', () => {
    it('keeps only suppressed no-onyx-connect violations and relativizes their paths', () => {
        const results = [makeResult('src/libs/Foo.ts', [suppressed(BANNED_RULE_ID, 12), suppressed('no-console', 3)]), makeResult('src/libs/Bar.ts', [suppressed(BANNED_RULE_ID, 7)])];

        expect(collectSuppressedBans(results, PROJECT_ROOT)).toEqual([
            {file: 'src/libs/Foo.ts', line: 12},
            {file: 'src/libs/Bar.ts', line: 7},
        ]);
    });

    it('returns nothing when there are no suppressed messages', () => {
        expect(collectSuppressedBans([makeResult('src/libs/Foo.ts', [])], PROJECT_ROOT)).toEqual([]);
    });
});

describe('findNewBypasses', () => {
    it('flags a bypass in a file with no grandfathered allowance', () => {
        expect(findNewBypasses([{file: 'src/libs/CurrencyUtils.ts', line: 5}])).toEqual([{file: 'src/libs/CurrencyUtils.ts', line: 5}]);
    });

    it('allows grandfathered disables up to their recorded count', () => {
        const bans = [
            {file: 'src/libs/ReportNameUtils.ts', line: 192},
            {file: 'src/libs/ReportNameUtils.ts', line: 201},
            {file: 'src/libs/NextStepUtils.ts', line: 33},
        ];
        expect(findNewBypasses(bans)).toEqual([]);
    });

    it('flags only the overflow when a grandfathered file gains an extra disable', () => {
        const bans = [
            {file: 'src/libs/ReportNameUtils.ts', line: 192},
            {file: 'src/libs/ReportNameUtils.ts', line: 201},
            {file: 'src/libs/ReportNameUtils.ts', line: 300},
        ];
        expect(findNewBypasses(bans)).toEqual([{file: 'src/libs/ReportNameUtils.ts', line: 300}]);
    });

    it('returns nothing for an empty input', () => {
        expect(findNewBypasses([])).toEqual([]);
    });
});
