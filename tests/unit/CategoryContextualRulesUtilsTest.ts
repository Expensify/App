import getCategoryContextualRules from '@libs/CategoryContextualRulesUtils';
import {toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, PolicyCategory, Rule} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

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
        };
        // A category's tax default is an ordinary rule matching that category alone and setting a tax.
        const taxDefaultRules: OnyxCollection<Rule> = {
            [`${ONYXKEYS.COLLECTION.RULE}rule1`]: {
                scope: CONST.RULES.SCOPE.POLICY,
                scopeID: policy.id,
                triggers: toIndexMap([CONST.RULES.TRIGGERS.CREATE_TRANSACTION]),
                filters: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: ['Travel']},
                // eslint-disable-next-line @typescript-eslint/naming-convention -- matches the rules engine's tax value shape
                actions: toIndexMap([{name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.TAX, value: {field_id_TAX: {externalID: 'TAX_VAT'}}}]),
            },
        };
        const category: PolicyCategory = {name: 'Travel', enabled: true};

        it('lists the tax default the Rules page shows for the category', () => {
            // Given a category whose tax default lives in the policy's expense rules rather than on the category
            // When the category details RHP builds its rules
            const rules = getCategoryContextualRules({
                policy: policyWithTaxRule,
                policyCategories: undefined,
                policyRules: taxDefaultRules,
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
                policyRules: taxDefaultRules,
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
                policyRules: taxDefaultRules,
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

        it('lists a rule that sets no tax', () => {
            // Given a rule saved from the category that sets an amount rather than a tax
            const amountOnlyRules: OnyxCollection<Rule> = {
                [`${ONYXKEYS.COLLECTION.RULE}rule1`]: {
                    scope: CONST.RULES.SCOPE.POLICY,
                    scopeID: policy.id,
                    triggers: toIndexMap([CONST.RULES.TRIGGERS.CREATE_TRANSACTION]),
                    filters: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: ['Travel']},
                    actions: toIndexMap([{name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.AMOUNT, value: -1000}]),
                },
            };

            // When the category details RHP builds its rules
            const rules = getCategoryContextualRules({
                policy: policyWithTaxRule,
                policyCategories: undefined,
                policyRules: amountOnlyRules,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            });

            // Then it is listed, because the row describes the rule rather than a tax the rule need not set
            expect(rules).toHaveLength(1);
            expect(rules.at(0)?.summary).toBe('Update amount to "$10.00"');
        });

        it('describes every field a rule sets, not just the tax', () => {
            // Given a rule that sets a tax and an amount
            const taxAndAmountRules: OnyxCollection<Rule> = {
                [`${ONYXKEYS.COLLECTION.RULE}rule1`]: {
                    scope: CONST.RULES.SCOPE.POLICY,
                    scopeID: policy.id,
                    triggers: toIndexMap([CONST.RULES.TRIGGERS.CREATE_TRANSACTION]),
                    filters: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: ['Travel']},
                    actions: toIndexMap([
                        // eslint-disable-next-line @typescript-eslint/naming-convention -- matches the rules engine's tax value shape
                        {name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.TAX, value: {field_id_TAX: {externalID: 'TAX_VAT'}}},
                        {name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.AMOUNT, value: -1000},
                    ]),
                },
            };

            // When the category details RHP builds its rules
            const rules = getCategoryContextualRules({
                policy: policyWithTaxRule,
                policyCategories: undefined,
                policyRules: taxAndAmountRules,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            });

            // Then the amount is in the summary too, so the row is not a tax-only view of the rule
            expect(rules.at(0)?.summary).toBe('Update tax to "VAT (20%)", update amount to "$10.00"');
        });

        it('leaves a rule that also matches on a merchant to the Rules page', () => {
            // Given the category's own rule and a second rule matching the category together with a merchant
            const withMerchantRule: OnyxCollection<Rule> = {
                ...taxDefaultRules,
                [`${ONYXKEYS.COLLECTION.RULE}rule2`]: {
                    scope: CONST.RULES.SCOPE.POLICY,
                    scopeID: policy.id,
                    triggers: toIndexMap([CONST.RULES.TRIGGERS.CREATE_TRANSACTION]),
                    filters: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                        left: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: ['Travel']},
                        right: {left: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, right: 'Starbucks'},
                    },
                    actions: toIndexMap([{name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.AMOUNT, value: -1000}]),
                },
            };

            // When the category details RHP builds its rules
            const rules = getCategoryContextualRules({
                policy: policyWithTaxRule,
                policyCategories: undefined,
                policyRules: withMerchantRule,
                category,
                categoryName: 'Travel',
                translate: translateLocal,
                convertToDisplayString,
                isOffline: false,
            });

            // Then only the category's own rule is listed. The merchant one belongs with the merchants on the
            // Rules page, and the row's route opens a rule by category, so a second row would open this same one
            expect(rules).toHaveLength(1);
            expect(rules.at(0)?.summary).toBe('Update tax to "VAT (20%)"');
        });
    });
});
