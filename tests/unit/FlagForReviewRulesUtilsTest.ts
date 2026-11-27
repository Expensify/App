import {getCategoryFlagLimit, getFlagForReviewFormFromLimit, getFlagForReviewTableData, hasFlagForReviewRuleForLegacyWrite} from '@libs/FlagForReviewRulesUtils';
import {toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Rule} from '@src/types/onyx';

import {createCategoryFlagLimitsSelector} from '@selectors/Rule';

import createRandomPolicy from '../utils/collections/policies';
import {convertToDisplayString, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const policy = {...createRandomPolicy(0), outputCurrency: CONST.CURRENCY.USD};
const selectFlagLimits = createCategoryFlagLimitsSelector(policy.id);
const ruleKey = (id: string) => `${ONYXKEYS.COLLECTION.RULE}${id}` as const;
const {ACTIONS, TRIGGERS, DAILY_BUDGET_FILTER} = CONST.RULES;
const {AND, OR, EQUAL_TO, GREATER_THAN} = CONST.SEARCH.SYNTAX_OPERATORS;
const {AMOUNT, CATEGORY} = CONST.SEARCH.SYNTAX_FILTER_KEYS;
const {DAILY, EXPENSE} = CONST.POLICY.EXPENSE_LIMIT_TYPES;
const mealCategory = {name: 'Meals &amp; drinks', enabled: true};
const categoryFilter = {left: CATEGORY, operator: EQUAL_TO, right: mealCategory.name};
const dailyCap = {left: DAILY_BUDGET_FILTER, operator: GREATER_THAN, right: '100.25 USD'};
const dailyRule = {
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: policy.id,
    triggers: toIndexMap([TRIGGERS.CREATE_TRANSACTION, TRIGGERS.UPDATE_TRANSACTION]),
    actions: toIndexMap([{name: ACTIONS.TRIGGER_VIOLATION}]),
    filters: {left: categoryFilter, operator: AND, right: dailyCap},
} satisfies Rule;

describe('mirrored category flag limits', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    it('reads only migrated-shaped transaction flags in this workspace', () => {
        // Given rules from multiple workspaces, including rule shapes the legacy editor cannot round-trip.
        const expenseRule = {
            ...dailyRule,
            filters: {
                left: {left: AMOUNT, operator: GREATER_THAN, right: '3000 JPY'},
                operator: AND,
                right: {...categoryFilter, right: 'Travel'},
            },
        };
        const rules = {
            [ruleKey('1')]: {...dailyRule, scopeID: 'other-workspace', filters: {...dailyRule.filters, right: {...dailyCap, right: '5 USD'}}},
            [ruleKey('2')]: dailyRule,
            [ruleKey('3')]: expenseRule,
            [ruleKey('4')]: {...dailyRule, scope: CONST.RULES.SCOPE.ACCOUNT, filters: {...dailyRule.filters, right: {...dailyCap, right: '9 USD'}}},
            [ruleKey('5')]: {
                ...dailyRule,
                actions: toIndexMap([{name: ACTIONS.SET, field: CATEGORY, value: 'Meals'}]),
                filters: {...dailyRule.filters, right: {...dailyCap, right: '10 USD'}},
            },
            [ruleKey('6')]: {...dailyRule, triggers: toIndexMap([TRIGGERS.CREATE_TRANSACTION]), filters: {...dailyRule.filters, right: {...dailyCap, right: '20 USD'}}},
            [ruleKey('7')]: {...dailyRule, filters: {...dailyRule.filters, operator: OR, right: {...dailyCap, right: '30 USD'}}},
            [ruleKey('8')]: {...dailyRule, filters: {...dailyRule.filters, right: {...dailyCap, right: '4000'}}},
            [ruleKey('9')]: {...dailyRule, filters: {left: dailyRule.filters, operator: AND, right: {...categoryFilter, right: 'Other'}}},
        } satisfies Record<string, Rule>;

        // When selecting category limits from the rules collection.
        const limits = selectFlagLimits(rules);

        // Then the category names stay in stored form, and monetary operands keep their own currency and type.
        expect(limits).toEqual({
            [mealCategory.name]: {amount: 10025, currency: CONST.CURRENCY.USD, expenseLimitType: DAILY, ruleKey: ruleKey('2')},
            Travel: {amount: 300000, currency: 'JPY', expenseLimitType: EXPENSE, ruleKey: ruleKey('3')},
        });
    });

    it('uses the mirrored limit for the list and edit draft, not the settled category threshold', () => {
        // Given a daily cap mirrored to rules and conflicting legacy values.
        const category = {...mealCategory, maxExpenseAmount: 4200, expenseLimitType: EXPENSE};
        const policyCategories = {[category.name]: category, Parking: {name: 'Parking', enabled: true, maxExpenseAmount: 2500}};
        const categoryFlagLimits = selectFlagLimits({[ruleKey('1')]: dailyRule});
        const onNavigate = jest.fn();

        // When rendering the table and deriving the edit draft.
        const rows = getFlagForReviewTableData({policy, policyCategories, categoryFlagLimits, translate: translateLocal, convertToDisplayString, isOffline: false, onNavigate});
        const limit = getCategoryFlagLimit(category, categoryFlagLimits, policy.outputCurrency);
        const form = limit && getFlagForReviewFormFromLimit(category.name, limit, () => CONST.DEFAULT_CURRENCY_DECIMALS);
        rows.at(0)?.action();

        // Then only the mirrored cap is shown, with daily scope and the existing category edit route.
        expect(rows.map((row) => [row.keyForList, row.conditionText])).toEqual([[mealCategory.name, '"Meals & drinks" total over $100.25 per submitter per day across reports']]);
        expect(form).toEqual({category: mealCategory.name, maxExpenseAmount: '100.25', expenseLimitType: DAILY});
        expect(onNavigate).toHaveBeenCalledWith(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policy.id, mealCategory.name));
        expect(hasFlagForReviewRuleForLegacyWrite(policyCategories.Parking, categoryFlagLimits)).toBe(true);
    });

    it('keeps pending legacy writes visible until Auth supplies the mirrored state', () => {
        // Given a queued amount change and a queued deletion for the same mirrored limit.
        const {UPDATE, DELETE} = CONST.RED_BRICK_ROAD_PENDING_ACTION;
        const categoryFlagLimits = selectFlagLimits({[ruleKey('1')]: dailyRule});
        const params = {policy, categoryFlagLimits, translate: translateLocal, convertToDisplayString, onNavigate: jest.fn()};
        const category = {...mealCategory, maxExpenseAmount: 2500, expenseLimitType: EXPENSE};
        const pendingUpdate = {[category.name]: {...category, pendingFields: {maxExpenseAmount: UPDATE}}};
        const pendingDelete = {[category.name]: {...category, pendingFields: {maxExpenseAmount: DELETE}}};

        // When showing them offline, then reconnecting while the delete is in flight.
        const updatedRows = getFlagForReviewTableData({...params, policyCategories: pendingUpdate, isOffline: true});
        const deletedRows = getFlagForReviewTableData({...params, policyCategories: pendingDelete, isOffline: true});
        const onlineRows = getFlagForReviewTableData({...params, policyCategories: pendingDelete, isOffline: false});

        // Then the pending amount is shown and the deleted row cannot be selected or reopened.
        expect(updatedRows.at(0)?.conditionText).toContain('$25.00');
        expect(updatedRows.at(0)).toMatchObject({pendingAction: UPDATE, disabled: false});
        expect(deletedRows.at(0)?.conditionText).toContain('$100.25');
        expect(deletedRows.at(0)).toMatchObject({pendingAction: DELETE, disabled: true});
        expect(onlineRows).toEqual([]);
    });

    it.each([{pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}, {pendingFields: {name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}}])(
        'keeps a mirrored cap on its category when another category takes the old name (%o)',
        (pendingCategoryUpdate) => {
            // Given two queued renames and a different category using the original name.
            const renamedCategory = {
                ...mealCategory,
                name: 'Food',
                previousCategoryName: 'Team meals',
                maxExpenseAmountMigrationID: 1,
                maxExpenseAmount: 900,
                pendingFields: {name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            };
            const categoryFlagLimits = selectFlagLimits({[ruleKey('1')]: dailyRule});
            const onNavigate = jest.fn();

            // When loading the flag table from the renamed category and cached rule.
            const rows = getFlagForReviewTableData({
                policy,
                policyCategories: {
                    [renamedCategory.name]: renamedCategory,
                    [mealCategory.name]: {...mealCategory, ...pendingCategoryUpdate},
                },
                categoryFlagLimits,
                translate: translateLocal,
                convertToDisplayString,
                isOffline: true,
                onNavigate,
            });
            rows.at(0)?.action();

            // Then only the renamed category keeps the cap and the edit route uses its new name.
            expect(rows).toHaveLength(1);
            expect(rows.at(0)?.conditionText).toContain('"Food" total over $100.25');
            expect(onNavigate).toHaveBeenCalledWith(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policy.id, renamedCategory.name));
        },
    );
});
