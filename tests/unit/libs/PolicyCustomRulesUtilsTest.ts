import {getPolicyCustomRulesText} from '@libs/PolicyCustomRulesUtils';
import type {Policy} from '@src/types/onyx';

describe('PolicyCustomRulesUtils', () => {
    describe('getPolicyCustomRulesText', () => {
        it.each([
            ['missing policy', undefined, ''],
            ['missing custom rules', {}, ''],
            ['empty text', {customRules: ''}, ''],
            ['numeric zero', {customRules: 0}, '0'],
            ['numeric custom rules', {customRules: 123}, '123'],
            ['text custom rules', {customRules: 'Policy text'}, 'Policy text'],
        ])('returns displayable text for %s', (_caseName, policy, expected) => {
            expect(getPolicyCustomRulesText(policy as unknown as Policy)).toBe(expected);
        });
    });
});
