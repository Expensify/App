import {formatRequireItemizedReceiptsOverText, isCategoryMissing} from '@libs/CategoryUtils';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import {translateLocal} from '../utils/TestHelper';

describe(`isMissingCategory`, () => {
    it('returns true if category is undefined', () => {
        expect(isCategoryMissing(undefined)).toBe(true);
    });

    it('returns true if category is an empty string', () => {
        expect(isCategoryMissing('')).toBe(true);
    });

    it('returns true if category "none" or "Uncategorized"', () => {
        expect(isCategoryMissing('none')).toBe(true);
        expect(isCategoryMissing('Uncategorized')).toBe(true);
    });

    it('returns false if category is a valid string', () => {
        expect(isCategoryMissing('Travel')).toBe(false);
        expect(isCategoryMissing('Meals')).toBe(false);
    });
});

describe('formatRequireItemizedReceiptsOverText', () => {
    const mockPolicy: Policy = {
        id: '1',
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.CORPORATE,
        outputCurrency: CONST.CURRENCY.USD,
        maxExpenseAmountNoItemizedReceipt: 7500,
    } as Policy;

    it('returns "Always" text when category amount is 0', () => {
        const result = formatRequireItemizedReceiptsOverText(translateLocal, mockPolicy, 0);
        expect(result).toBe(translateLocal('workspace.rules.categoryRules.requireItemizedReceiptsOverList.always'));
    });

    it('returns "Never" text when category amount is DISABLED_MAX_EXPENSE_VALUE', () => {
        const result = formatRequireItemizedReceiptsOverText(translateLocal, mockPolicy, CONST.DISABLED_MAX_EXPENSE_VALUE);
        expect(result).toBe(translateLocal('workspace.rules.categoryRules.requireItemizedReceiptsOverList.never'));
    });

    it('returns default text when category has no override', () => {
        const result = formatRequireItemizedReceiptsOverText(translateLocal, mockPolicy, undefined);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });

    it('returns default text when category amount is null', () => {
        const result = formatRequireItemizedReceiptsOverText(translateLocal, mockPolicy, null);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});
