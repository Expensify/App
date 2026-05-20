import {getPolicyCustomRulesText} from '@libs/PolicyCustomRulesUtils';
import type {Policy} from '@src/types/onyx';

describe('PolicyCustomRulesUtils', () => {
    describe('getPolicyCustomRulesText', () => {
        it('coerces numeric custom rules to text', () => {
            const policy = {customRules: 123} as unknown as Policy;

            expect(getPolicyCustomRulesText(policy)).toBe('123');
        });
    });
});
