import {
    formatRequireItemizedReceiptsOverText,
    getAvailableNonPersonalPolicyCategories,
    getCategoryGLCode,
    getDecodedLeafCategoryName,
    hasAnyCategoryRules,
    isCategoryDescriptionRequired,
    isCategoryMissing,
    processCategoryNameSegments,
} from '@libs/CategoryUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

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
        const result = formatRequireItemizedReceiptsOverText(translateLocal, mockPolicy, 0, convertToDisplayString);
        expect(result).toBe(translateLocal('workspace.rules.categoryRules.requireItemizedReceiptsOverList.always'));
    });

    it('returns "Never" text when category amount is DISABLED_MAX_EXPENSE_VALUE', () => {
        const result = formatRequireItemizedReceiptsOverText(translateLocal, mockPolicy, CONST.DISABLED_MAX_EXPENSE_VALUE, convertToDisplayString);
        expect(result).toBe(translateLocal('workspace.rules.categoryRules.requireItemizedReceiptsOverList.never'));
    });

    it('returns default text when category has no override', () => {
        const result = formatRequireItemizedReceiptsOverText(translateLocal, mockPolicy, undefined, convertToDisplayString);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });

    it('returns "Never" text when policy has no itemized receipt requirement (DISABLED_MAX_EXPENSE_VALUE)', () => {
        const policyWithDisabledItemizedReceipt: Policy = {
            ...mockPolicy,
            maxExpenseAmountNoItemizedReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE,
        } as Policy;
        const result = formatRequireItemizedReceiptsOverText(translateLocal, policyWithDisabledItemizedReceipt, undefined, convertToDisplayString);
        expect(result).toBe(translateLocal('workspace.rules.categoryRules.requireItemizedReceiptsOverList.never'));
    });

    it('returns "Never" text when policy has undefined itemized receipt requirement', () => {
        const policyWithUndefinedItemizedReceipt: Policy = {
            ...mockPolicy,
            maxExpenseAmountNoItemizedReceipt: undefined,
        } as Policy;
        const result = formatRequireItemizedReceiptsOverText(translateLocal, policyWithUndefinedItemizedReceipt, undefined, convertToDisplayString);
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

    describe('processCategoryNameSegments and getDecodedLeafCategoryName', () => {
        describe('processCategoryNameSegments', () => {
            it('returns a single segment for colon‑only names', () => {
                expect(processCategoryNameSegments(':')).toEqual([':']);
                expect(processCategoryNameSegments('::')).toEqual(['::']);
            });

            it('handles normal hierarchical categories unchanged (preserves leading spaces)', () => {
                expect(processCategoryNameSegments('Food: Meat')).toEqual(['Food', ' Meat']);
                expect(processCategoryNameSegments('A: B:')).toEqual(['A', ' B:']);
                expect(processCategoryNameSegments('Parent:Child')).toEqual(['Parent', 'Child']);
            });
        });

        describe('getDecodedLeafCategoryName', () => {
            it('returns the leaf name for colon‑only categories', () => {
                expect(getDecodedLeafCategoryName(':')).toEqual(':');
                expect(getDecodedLeafCategoryName('::')).toEqual('::');
            });

            it('returns the leaf for normal hierarchies (trimmed)', () => {
                expect(getDecodedLeafCategoryName('Food: Meat')).toEqual('Meat');
                expect(getDecodedLeafCategoryName('A: B:')).toEqual('B:');
            });
        });
    });
});

describe('hasAnyCategoryRules', () => {
    const createCategory = (overrides: Partial<PolicyCategories[string]> = {}) => ({
        enabled: true,
        name: 'Test',
        pendingAction: null,
        ...overrides,
    });

    it('returns false when categories are undefined', () => {
        expect(hasAnyCategoryRules(undefined)).toBe(false);
    });

    it('returns false when categories are empty', () => {
        expect(hasAnyCategoryRules({})).toBe(false);
    });

    it('returns false when category has only metadata and no rule fields', () => {
        const categories: PolicyCategories = {
            Advertising: createCategory({name: 'Advertising', 'GL Code': '1234'}), // eslint-disable-line @typescript-eslint/naming-convention
        };
        expect(hasAnyCategoryRules(categories)).toBe(false);
    });

    it('returns true when maxExpenseAmount is set to an active value', () => {
        const categories: PolicyCategories = {
            Advertising: createCategory({maxExpenseAmount: 50000}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns false when maxExpenseAmount is disabled or undefined', () => {
        expect(hasAnyCategoryRules({Advertising: createCategory({maxExpenseAmount: CONST.DISABLED_MAX_EXPENSE_VALUE})})).toBe(false);
        expect(hasAnyCategoryRules({Advertising: createCategory({maxExpenseAmount: undefined})})).toBe(false);
    });

    it('returns true when maxAmountNoReceipt is 0', () => {
        const categories: PolicyCategories = {
            Travel: createCategory({name: 'Travel', maxAmountNoReceipt: 0}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns true when maxAmountNoReceipt is a positive amount', () => {
        const categories: PolicyCategories = {
            Travel: createCategory({name: 'Travel', maxAmountNoReceipt: 2500}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns true when maxAmountNoReceipt is explicitly disabled', () => {
        const categories: PolicyCategories = {
            Travel: createCategory({name: 'Travel', maxAmountNoReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns false when maxAmountNoReceipt is null or undefined', () => {
        expect(hasAnyCategoryRules({Travel: createCategory({name: 'Travel', maxAmountNoReceipt: null})})).toBe(false);
        expect(hasAnyCategoryRules({Travel: createCategory({name: 'Travel', maxAmountNoReceipt: undefined})})).toBe(false);
    });

    it('returns true when maxAmountNoItemizedReceipt is 0', () => {
        const categories: PolicyCategories = {
            Travel: createCategory({name: 'Travel', maxAmountNoItemizedReceipt: 0}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns true when maxAmountNoItemizedReceipt is explicitly disabled', () => {
        const categories: PolicyCategories = {
            Travel: createCategory({name: 'Travel', maxAmountNoItemizedReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns false when maxAmountNoItemizedReceipt is null or undefined', () => {
        expect(hasAnyCategoryRules({Travel: createCategory({name: 'Travel', maxAmountNoItemizedReceipt: null})})).toBe(false);
        expect(hasAnyCategoryRules({Travel: createCategory({name: 'Travel', maxAmountNoItemizedReceipt: undefined})})).toBe(false);
    });

    it('returns true when areCommentsRequired is true', () => {
        const categories: PolicyCategories = {
            Meals: createCategory({name: 'Meals', areCommentsRequired: true}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns true when areAttendeesRequired is true', () => {
        const categories: PolicyCategories = {
            Meals: createCategory({name: 'Meals', areAttendeesRequired: true}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns true when commentHint is set', () => {
        const categories: PolicyCategories = {
            Car: createCategory({name: 'Car', commentHint: 'Enter purpose'}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns false when commentHint is empty', () => {
        const categories: PolicyCategories = {
            Car: createCategory({name: 'Car', commentHint: ''}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(false);
    });

    it('returns true when only the second category has a rule field', () => {
        const categories: PolicyCategories = {
            Advertising: createCategory({name: 'Advertising', 'GL Code': '1234'}), // eslint-disable-line @typescript-eslint/naming-convention
            Travel: createCategory({name: 'Travel', maxAmountNoReceipt: 0}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(true);
    });

    it('returns false when multiple categories have no rule fields', () => {
        const categories: PolicyCategories = {
            Advertising: createCategory({name: 'Advertising', 'GL Code': '1234'}), // eslint-disable-line @typescript-eslint/naming-convention
            Meals: createCategory({name: 'Meals', enabled: true}),
        };
        expect(hasAnyCategoryRules(categories)).toBe(false);
    });
});

describe('getCategoryGLCode', () => {
    it('returns empty string when policyCategories is undefined', () => {
        expect(getCategoryGLCode(undefined, 'Meals')).toBe('');
    });

    it('returns empty string when category is undefined or empty', () => {
        expect(getCategoryGLCode({} as PolicyCategories, undefined)).toBe('');
        expect(getCategoryGLCode({} as PolicyCategories, '')).toBe('');
    });

    it('returns empty string when category is missing from policyCategories', () => {
        expect(getCategoryGLCode({} as PolicyCategories, 'Meals')).toBe('');
    });

    it('returns empty string when category has no GL Code', () => {
        const categories: PolicyCategories = {
            Meals: {
                enabled: true,
                name: 'Meals',
                pendingAction: null,
            },
        };
        expect(getCategoryGLCode(categories, 'Meals')).toBe('');
    });

    it('returns GL Code when it is a string', () => {
        const categories: PolicyCategories = {
            Meals: {
                enabled: true,
                name: 'Meals',
                pendingAction: null,
                'GL Code': '1200', // eslint-disable-line @typescript-eslint/naming-convention
            },
        };
        expect(getCategoryGLCode(categories, 'Meals')).toBe('1200');
    });

    it('returns GL Code when it is a number', () => {
        const categories: PolicyCategories = {
            Meals: {
                enabled: true,
                name: 'Meals',
                pendingAction: null,
                // @ts-expect-error - Defensively handles malformed Onyx data that violates the string type.
                'GL Code': 1200, // eslint-disable-line @typescript-eslint/naming-convention
            },
        };
        expect(getCategoryGLCode(categories, 'Meals')).toBe('1200');
    });

    it('strips double quotes from GL Code', () => {
        const categories: PolicyCategories = {
            Meals: {
                enabled: true,
                name: 'Meals',
                pendingAction: null,
                'GL Code': '"1200"', // eslint-disable-line @typescript-eslint/naming-convention
            },
        };
        expect(getCategoryGLCode(categories, 'Meals')).toBe('1200');
    });
});
