import getCategoryContextualRules from '@libs/CategoryContextualRulesUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, PolicyCategory} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import {convertToDisplayString, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const policy = {
    ...createRandomPolicy(0),
    id: 'policy123',
    outputCurrency: CONST.CURRENCY.USD,
};

describe('getCategoryContextualRules', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    it('returns an empty list when the category has no Rules Revamp overrides', () => {
        const category: PolicyCategory = {name: 'Travel', enabled: true};

        expect(
            getCategoryContextualRules({
                policy,
                policyCategories: undefined,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            }),
        ).toEqual([]);
    });

    it('returns flag-for-review and require-fields summaries with category dynamic edit routes', () => {
        const category: PolicyCategory = {
            name: 'Travel',
            enabled: true,
            maxExpenseAmount: 20000,
            expenseLimitType: CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
            areCommentsRequired: true,
        };

        const rules = getCategoryContextualRules({
            policy,
            policyCategories: undefined,
            category,
            categoryName: 'Travel',
            translate: translateLocal,
            convertToDisplayString,
            isOffline: false,
        });

        expect(rules).toHaveLength(2);
        expect(rules.at(0)?.summary).toContain('flag for review');
        expect(rules.at(0)?.summary).toContain('200');
        expect(rules.at(0)?.dynamicRoutePath).toBe(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_EDIT.path);
        expect(rules.at(1)?.summary).toContain('Require description');
        expect(rules.at(1)?.dynamicRoutePath).toBe(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_REQUIRE_FIELDS_EDIT.path);
    });

    it('keeps optimistically deleted rules listed and disabled while offline', () => {
        const category: PolicyCategory = {
            name: 'Travel',
            enabled: true,
            maxExpenseAmount: 20000,
            expenseLimitType: CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
            areCommentsRequired: true,
            pendingFields: {
                maxExpenseAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                areCommentsRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        };

        const rules = getCategoryContextualRules({
            policy,
            policyCategories: undefined,
            category,
            categoryName: 'Travel',
            translate: translateLocal,
            convertToDisplayString,
            isOffline: true,
        });

        expect(rules).toHaveLength(2);
        expect(rules.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(rules.at(0)?.isDisabled).toBe(true);
        // The require-fields summary is built from fields that are pending delete, so it has to opt into them.
        expect(rules.at(1)?.summary).toContain('Require description');
        expect(rules.at(1)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(rules.at(1)?.isDisabled).toBe(true);
    });

    it('drops optimistically deleted rules once back online', () => {
        const category: PolicyCategory = {
            name: 'Travel',
            enabled: true,
            maxExpenseAmount: 20000,
            expenseLimitType: CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
            areCommentsRequired: true,
            pendingFields: {
                maxExpenseAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                areCommentsRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        };

        expect(
            getCategoryContextualRules({
                policy,
                policyCategories: undefined,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            }),
        ).toEqual([]);
    });

    describe('category tax default', () => {
        const policyWithTaxRule: Policy = {
            ...policy,
            taxRates: {
                name: 'Tax',
                defaultExternalID: 'TAX_EXEMPT',
                defaultValue: '0%',
                foreignTaxDefault: 'TAX_EXEMPT',
                taxes: {
                    TAX_EXEMPT: {name: 'Tax exempt', value: '0%'},
                    TAX_VAT: {name: 'VAT', value: '20%'},
                },
            },
            rules: {
                expenseRules: [
                    {
                        // eslint-disable-next-line @typescript-eslint/naming-convention -- matches the backend's expense rule shape
                        tax: {field_id_TAX: {externalID: 'TAX_VAT'}},
                        applyWhen: [{condition: CONST.POLICY.RULE_CONDITIONS.MATCHES, field: CONST.POLICY.FIELDS.CATEGORY, value: 'Travel'}],
                    },
                ],
            },
        };
        const category: PolicyCategory = {name: 'Travel', enabled: true};

        it('lists the tax default the Rules page shows for the category', () => {
            // Given a category whose tax default lives in the policy's expense rules rather than on the category
            // When the category details RHP builds its rules
            const rules = getCategoryContextualRules({
                policy: policyWithTaxRule,
                policyCategories: undefined,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            });

            // Then the tax default is listed and opens the category-scoped editor, so the RHP matches the Rules page
            expect(rules).toHaveLength(1);
            expect(rules.at(0)?.summary).toBe('Update tax to "VAT (20%)"');
            expect(rules.at(0)?.dynamicRoutePath).toBe(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_EDIT.path);
        });

        it('does not list a tax default belonging to another category', () => {
            // Given a tax default that only matches Travel
            // When the rules are built for a different category
            const rules = getCategoryContextualRules({
                policy: policyWithTaxRule,
                policyCategories: undefined,
                category: {name: 'Meals', enabled: true},
                categoryName: 'Meals',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            });

            // Then nothing is listed, since the workspace default rate is not a rule of its own
            expect(rules).toEqual([]);
        });

        it('shows the tax default as deleting offline while its rate is being deleted', () => {
            // Given the rate the tax default uses is pending delete, which takes the rule down with it
            const policyWithDeletingRate: Policy = {
                ...policyWithTaxRule,
                taxRates: {
                    ...policyWithTaxRule.taxRates,
                    name: 'Tax',
                    defaultExternalID: 'TAX_EXEMPT',
                    defaultValue: '0%',
                    foreignTaxDefault: 'TAX_EXEMPT',
                    taxes: {
                        TAX_EXEMPT: {name: 'Tax exempt', value: '0%'},
                        TAX_VAT: {name: 'VAT', value: '20%', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    },
                },
            };
            const params = {
                policy: policyWithDeletingRate,
                policyCategories: undefined,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
            };

            // When the rules are built offline and online
            const offlineRules = getCategoryContextualRules({...params, isOffline: true});
            const onlineRules = getCategoryContextualRules({...params, isOffline: false});

            // Then offline keeps it listed but disabled, and online drops it since the delete resolves in a moment
            expect(offlineRules.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            expect(offlineRules.at(0)?.isDisabled).toBe(true);
            expect(onlineRules).toEqual([]);
        });
    });
});
