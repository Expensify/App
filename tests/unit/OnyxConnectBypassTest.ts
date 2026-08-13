import type {ESLint} from 'eslint';

import type {ResultWithSuppressed} from '../../scripts/onyxConnectBypass';

import {BANNED_RULE_ID, collectSuppressedBans, findNewBypasses, RENDER_READ_RULE_ID} from '../../scripts/onyxConnectBypass';

const PROJECT_ROOT = '/repo';

function makeResult(relativePath: string, suppressedMessages: ESLint.LintResult['suppressedMessages']): ResultWithSuppressed {
    return {filePath: `${PROJECT_ROOT}/${relativePath}`, suppressedMessages};
}

function suppressed(ruleId: string, line: number): ESLint.LintResult['suppressedMessages'][number] {
    return {ruleId, line, column: 1, message: 'x', severity: 2, suppressions: [{kind: 'directive', justification: ''}]};
}

describe('collectSuppressedBans', () => {
    it('keeps only suppressed violations of the policed rules and relativizes their paths', () => {
        const results = [makeResult('src/libs/Foo.ts', [suppressed(BANNED_RULE_ID, 12), suppressed('no-console', 3)]), makeResult('src/libs/Bar.ts', [suppressed(BANNED_RULE_ID, 7)])];

        expect(collectSuppressedBans(results, PROJECT_ROOT)).toEqual([
            {ruleId: BANNED_RULE_ID, file: 'src/libs/Foo.ts', line: 12},
            {ruleId: BANNED_RULE_ID, file: 'src/libs/Bar.ts', line: 7},
        ]);
    });

    it('collects both policed rules from the same file', () => {
        const results = [makeResult('src/libs/Foo.ts', [suppressed(BANNED_RULE_ID, 12), suppressed(RENDER_READ_RULE_ID, 40)])];

        expect(collectSuppressedBans(results, PROJECT_ROOT)).toEqual([
            {ruleId: BANNED_RULE_ID, file: 'src/libs/Foo.ts', line: 12},
            {ruleId: RENDER_READ_RULE_ID, file: 'src/libs/Foo.ts', line: 40},
        ]);
    });

    it('returns nothing when there are no suppressed messages', () => {
        expect(collectSuppressedBans([makeResult('src/libs/Foo.ts', [])], PROJECT_ROOT)).toEqual([]);
    });
});

describe('findNewBypasses', () => {
    it('flags a bypass in a file with no grandfathered allowance', () => {
        expect(findNewBypasses([{ruleId: BANNED_RULE_ID, file: 'src/libs/CurrencyUtils.ts', line: 5}])).toEqual([{ruleId: BANNED_RULE_ID, file: 'src/libs/CurrencyUtils.ts', line: 5}]);
    });

    it('allows grandfathered disables up to their recorded count', () => {
        const bans = [
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 192},
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 201},
            {ruleId: BANNED_RULE_ID, file: 'src/libs/NextStepUtils.ts', line: 33},
        ];
        expect(findNewBypasses(bans)).toEqual([]);
    });

    it('flags only the overflow when a grandfathered file gains an extra disable', () => {
        const bans = [
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 192},
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 201},
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 300},
        ];
        expect(findNewBypasses(bans)).toEqual([{ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 300}]);
    });

    it('flags every disable of the render-read rule, which has no allowance anywhere', () => {
        const bans = [
            {ruleId: RENDER_READ_RULE_ID, file: 'src/components/Search/SearchList/ListItem/ActionCell/PayActionCell.tsx', line: 41},
            {ruleId: RENDER_READ_RULE_ID, file: 'src/hooks/useSwitchToDelegator.ts', line: 12},
        ];
        expect(findNewBypasses(bans)).toEqual(bans);
    });

    it("does not let one rule's allowance cover another rule in the same file", () => {
        const bans = [
            {ruleId: BANNED_RULE_ID, file: 'src/libs/NextStepUtils.ts', line: 33},
            {ruleId: RENDER_READ_RULE_ID, file: 'src/libs/NextStepUtils.ts', line: 33},
        ];
        expect(findNewBypasses(bans)).toEqual([{ruleId: RENDER_READ_RULE_ID, file: 'src/libs/NextStepUtils.ts', line: 33}]);
    });

    it('flags a render-read bypass in a file whose connect allowance would otherwise absorb it', () => {
        // Two bans in a file allowed two connect disables: counting per file rather than per rule would
        // let the render-read bypass through unnoticed.
        const bans = [
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 192},
            {ruleId: RENDER_READ_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 205},
        ];
        expect(findNewBypasses(bans)).toEqual([{ruleId: RENDER_READ_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 205}]);
    });

    it('keeps a grandfathered connect disable allowed when another rule is also disabled earlier in the file', () => {
        // The mirror of the case above: counting per file would spend the render-read rule's empty
        // allowance on the connect disables and report all three.
        const bans = [
            {ruleId: RENDER_READ_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 10},
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 192},
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 201},
        ];
        expect(findNewBypasses(bans)).toEqual([{ruleId: RENDER_READ_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 10}]);
    });

    it('counts the two rules separately when both are disabled repeatedly in one file', () => {
        const bans = [
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 192},
            {ruleId: BANNED_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 201},
            {ruleId: RENDER_READ_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 205},
        ];
        expect(findNewBypasses(bans)).toEqual([{ruleId: RENDER_READ_RULE_ID, file: 'src/libs/ReportNameUtils.ts', line: 205}]);
    });

    it('returns nothing for an empty input', () => {
        expect(findNewBypasses([])).toEqual([]);
    });
});
