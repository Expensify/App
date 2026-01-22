import type {OnyxCollection} from 'react-native-onyx';
import {formatRequireItemizedReceiptsOverText, getAvailableNonPersonalPolicyCategories, isCategoryDescriptionRequired, isCategoryMissing} from '@libs/CategoryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories} from '@src/types/onyx';
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

    it('returns "Never" text when policy has no itemized receipt requirement (DISABLED_MAX_EXPENSE_VALUE)', () => {
        const policyWithDisabledItemizedReceipt: Policy = {
            ...mockPolicy,
            maxExpenseAmountNoItemizedReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE,
        } as Policy;
        const result = formatRequireItemizedReceiptsOverText(translateLocal, policyWithDisabledItemizedReceipt, undefined);
        expect(result).toBe(translateLocal('workspace.rules.categoryRules.requireItemizedReceiptsOverList.never'));
    });

    it('returns "Never" text when policy has undefined itemized receipt requirement', () => {
        const policyWithUndefinedItemizedReceipt: Policy = {
            ...mockPolicy,
            maxExpenseAmountNoItemizedReceipt: undefined,
        } as Policy;
        const result = formatRequireItemizedReceiptsOverText(translateLocal, policyWithUndefinedItemizedReceipt, undefined);
        expect(result).toBe(translateLocal('workspace.rules.categoryRules.requireItemizedReceiptsOverList.never'));
    });
});

describe('isCategoryDescriptionRequired', () => {
    const mockPolicyCategories: PolicyCategories = {
        Travel: {
            areCommentsRequired: true,
            enabled: true,
            name: 'Travel',
            pendingAction: null,
        },
        Meals: {
            areCommentsRequired: false,
            enabled: true,
            name: 'Meals',
            pendingAction: null,
        },
        Office: {
            areCommentsRequired: true,
            enabled: false,
            name: 'Office',
            pendingAction: null,
        },
    };

    it('returns false when policyCategories is undefined', () => {
        expect(isCategoryDescriptionRequired(undefined, 'Travel', true)).toBe(false);
    });

    it('returns false when category is undefined', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, undefined, true)).toBe(false);
    });

    it('returns false when category is empty string', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, '', true)).toBe(false);
    });

    it('returns false when areRulesEnabled is undefined', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Travel', undefined)).toBe(false);
    });

    it('returns false when areRulesEnabled is false', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Travel', false)).toBe(false);
    });

    it('returns true when category has areCommentsRequired set to true and rules are enabled', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Travel', true)).toBe(true);
    });

    it('returns false when category has areCommentsRequired set to false even if rules are enabled', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Meals', true)).toBe(false);
    });

    it('returns true when category has areCommentsRequired set to true regardless of enabled status', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Office', true)).toBe(true);
    });

    it('returns false when category does not exist in policyCategories', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'NonExistentCategory', true)).toBe(false);
    });

    it('returns false when all parameters are valid but areCommentsRequired is falsy', () => {
        const categoriesWithFalsyComments: PolicyCategories = {
            TestCategory: {
                areCommentsRequired: false,
                enabled: true,
                name: 'TestCategory',
                pendingAction: null,
            },
        };
        expect(isCategoryDescriptionRequired(categoriesWithFalsyComments, 'TestCategory', true)).toBe(false);
    });

    it('handles edge case with undefined areCommentsRequired', () => {
        const categoriesWithUndefinedComments: PolicyCategories = {
            TestCategory: {
                enabled: true,
                name: 'TestCategory',
                pendingAction: null,
            },
        };
        expect(isCategoryDescriptionRequired(categoriesWithUndefinedComments, 'TestCategory', true)).toBe(false);
    });
});

describe('getAvailableNonPersonalPolicyCategories', () => {
    it('returns empty object when input is undefined or no available categories', () => {
        expect(getAvailableNonPersonalPolicyCategories(undefined, 'p_1')).toEqual({});
        const onlyDeleted: OnyxCollection<PolicyCategories> = {
            [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}p_2`]: {
                TestCategory: {
                    enabled: true,
                    name: 'TestCategory',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        };
        expect(getAvailableNonPersonalPolicyCategories(onlyDeleted, 'p_1')).toEqual({});
    });

    it('excludes personal policy and policies with only deleted categories, keeps policies with at least one non-deleted category', () => {
        const personalPolicyID = 'personal_1';
        const keyPersonal = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${personalPolicyID}`;
        const keyOther = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy_2`;
        const keyAllDeleted = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy_3`;

        const policyCategories: OnyxCollection<PolicyCategories> = {
            [keyPersonal]: {
                cTestCategory1at1: {
                    enabled: true,
                    name: 'TestCategory1',
                    pendingAction: null,
                },
            },
            [keyOther]: {
                TestCategory2: {
                    enabled: true,
                    name: 'TestCategory2',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
                TestCategory3: {
                    enabled: true,
                    name: 'TestCategory3',
                    pendingAction: null,
                },
            },
            [keyAllDeleted]: {
                TestCategory4: {
                    enabled: true,
                    name: 'TestCategory4',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        };

        const result: OnyxCollection<PolicyCategories> = getAvailableNonPersonalPolicyCategories(policyCategories, personalPolicyID);
        expect(Object.keys(result)).toEqual([keyOther]);
        expect(result[keyOther]?.TestCategory2).toBeDefined();
        expect(result[keyOther]?.TestCategory3).toBeDefined();
    });
});
