import {
    buildFlagForReviewRule,
    canMatchFlagRuleCategory,
    getCategoryFlagLimit,
    getFlagForReviewConditions,
    getFlagForReviewDraft,
    getFlagForReviewTableData,
    getFlagTagDisplayName,
} from '@libs/FlagForReviewRulesUtils';
import {getRuleFilterLeaves, toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';
import type {Rule} from '@src/types/onyx';

import {createCategoryFlagLimitsSelector, createFlagForReviewRulesSelector} from '@selectors/Rule';

import createRandomPolicy from '../utils/collections/policies';
import {convertToDisplayString, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const policy = {...createRandomPolicy(0), outputCurrency: CONST.CURRENCY.USD};
const selectFlagLimits = createCategoryFlagLimitsSelector(policy.id);
const selectFlagRules = createFlagForReviewRulesSelector(policy.id);
const ruleKey = (id: string) => `${ONYXKEYS.COLLECTION.RULE}${id}` as const;
const {ACTIONS, TRIGGERS, DAILY_BUDGET_FILTER} = CONST.RULES;
const {AND, OR, EQUAL_TO, GREATER_THAN, LOWER_THAN, NOT_EQUAL_TO} = CONST.SEARCH.SYNTAX_OPERATORS;
const {AMOUNT, CATEGORY, FROM, TAG, HAS, CARD_ID, TAX_RATE, REIMBURSABLE, BILLABLE, DATE, CURRENCY} = CONST.SEARCH.SYNTAX_FILTER_KEYS;
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
        // Given rules from multiple workspaces, including rule shapes the flag editor cannot round-trip.
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
            [mealCategory.name]: {amount: 10025, currency: CONST.CURRENCY.USD, expenseLimitType: DAILY, ruleID: '2'},
            Travel: {amount: 300000, currency: 'JPY', expenseLimitType: EXPENSE, ruleID: '3'},
        });
    });

    it('uses the mirrored limit for the list and edit draft, not the settled category threshold', () => {
        // Given a daily cap mirrored to rules and conflicting legacy values.
        const category = {...mealCategory, maxExpenseAmount: 4200, expenseLimitType: EXPENSE};
        const policyCategories = {[category.name]: category, Parking: {name: 'Parking', enabled: true, maxExpenseAmount: 2500}};
        const flagRules = selectFlagRules({[ruleKey('1')]: dailyRule});
        const onNavigate = jest.fn();

        // When rendering the table and deriving the edit draft.
        const rows = getFlagForReviewTableData({policyID: policy.id, policyCategories, flagRules, translate: translateLocal, convertToDisplayString, isOffline: false, onNavigate});
        const conditions = flagRules['1'];
        const form = getFlagForReviewDraft(conditions, () => CONST.DEFAULT_CURRENCY_DECIMALS, true);
        rows.at(0)?.action();

        // Then only the mirrored cap is shown, with daily scope and a stable rule ID.
        expect(rows.map((row) => [row.keyForList, row.conditionText])).toEqual([['1', '"Meals & drinks" total over $100.25 per submitter per day across reports']]);
        expect(form).toMatchObject({category: mealCategory.name, maxExpenseAmount: '100.25', expenseLimitType: DAILY});
        expect(onNavigate).toHaveBeenCalledWith(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policy.id, '1'));
        expect(getCategoryFlagLimit(policyCategories.Parking, selectFlagLimits({[ruleKey('1')]: dailyRule}))).toBeUndefined();
    });

    it('reflects pending state from the rule, not the legacy category', () => {
        // Given a queued amount change and a queued deletion for the same mirrored limit.
        const {UPDATE, DELETE} = CONST.RED_BRICK_ROAD_PENDING_ACTION;
        const updatedRule = {...dailyRule, pendingAction: UPDATE, filters: {...dailyRule.filters, right: {...dailyCap, right: '25.00 USD'}}};
        const deletedRule = {...dailyRule, pendingAction: DELETE};
        const params = {
            policyID: policy.id,
            policyCategories: {[mealCategory.name]: {...mealCategory, maxExpenseAmount: 4200}},
            translate: translateLocal,
            convertToDisplayString,
            onNavigate: jest.fn(),
        };
        const updatedFlags = selectFlagRules({[ruleKey('1')]: updatedRule});
        const deletedFlags = selectFlagRules({[ruleKey('1')]: deletedRule});

        // When showing them offline, then reconnecting while the delete is in flight.
        const updatedRows = getFlagForReviewTableData({...params, flagRules: updatedFlags, isOffline: true});
        const deletedRows = getFlagForReviewTableData({...params, flagRules: deletedFlags, isOffline: true});
        const onlineRows = getFlagForReviewTableData({...params, flagRules: deletedFlags, isOffline: false});

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
            const flagRules = selectFlagRules({[ruleKey('1')]: dailyRule});
            const onNavigate = jest.fn();

            // When loading the flag table from the renamed category and cached rule.
            const rows = getFlagForReviewTableData({
                policyID: policy.id,
                policyCategories: {
                    [renamedCategory.name]: renamedCategory,
                    [mealCategory.name]: {...mealCategory, ...pendingCategoryUpdate},
                },
                flagRules,
                translate: translateLocal,
                convertToDisplayString,
                isOffline: true,
                onNavigate,
            });
            rows.at(0)?.action();

            // Then only the renamed category keeps the cap and the edit route keeps its ID.
            expect(rows).toHaveLength(1);
            expect(rows.at(0)?.conditionText).toContain('"Food" total over $100.25');
            expect(onNavigate).toHaveBeenCalledWith(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policy.id, '1'));
            const limits = selectFlagLimits({[ruleKey('1')]: dailyRule});
            expect(getCategoryFlagLimit(renamedCategory, limits)?.ruleID).toBe('1');
            expect(getCategoryFlagLimit({...mealCategory, ...pendingCategoryUpdate}, limits)).toBeUndefined();
            expect(canMatchFlagRuleCategory({...mealCategory, ...pendingCategoryUpdate})).toBe(false);
        },
    );

    it.each([CONST.RULES.FLAG_FOR_REVIEW.ENFORCEMENT.WARNING, CONST.RULES.FLAG_FOR_REVIEW.ENFORCEMENT.BLOCK])('round-trips a merchant and per-expense threshold with %s', (enforcement) => {
        // Given a merchant rule that also matches a category and a per-expense amount.
        const draft = {merchantToMatch: 'Starbucks', matchType: EQUAL_TO, category: mealCategory.name, maxExpenseAmount: '3000', expenseLimitType: EXPENSE};
        const body = buildFlagForReviewRule(draft, 'JPY', enforcement);

        // When the wire body comes back from GetRules and seeds the editor.
        const conditions = body && getFlagForReviewConditions({...dailyRule, ...body});

        // Then the one-based action, exact match, amount and currency survive.
        expect(Object.keys(body?.actions ?? {})).toEqual(['1']);
        expect(body?.actions[1]).toEqual({name: ACTIONS.TRIGGER_VIOLATION, enforcement});
        expect(conditions && getFlagForReviewDraft(conditions, () => 0)).toMatchObject({
            merchantToMatch: 'Starbucks',
            matchType: EQUAL_TO,
            category: mealCategory.name,
            amountToMatch: '3000.00 JPY',
            enforcement,
        });
    });

    it('round-trips every expanded match without turning false booleans into unset conditions', () => {
        // Given a flag with the same controls used by expense defaults.
        const draft = {
            merchantTypesToMatch: [CONST.RULES.MERCHANT_TYPE.DINING],
            tagsToMatch: ['Client A', 'Client B'],
            submittersToMatch: ['123', '456'],
            currenciesToMatch: ['USD', 'JPY'],
            taxRatesToMatch: ['id_GST'],
            cardsToMatch: ['789'],
            dateToMatch: '2026-11-25',
            dateMatchType: LOWER_THAN,
            reimbursableToMatch: false,
            billableToMatch: true,
            hasToMatch: [CONST.SEARCH.HAS_VALUES.RECEIPT],
            hasMatchType: NOT_EQUAL_TO,
        } satisfies Partial<FlagForReviewRuleForm>;

        // When reading and rebuilding the saved warning.
        const enforcement = CONST.RULES.FLAG_FOR_REVIEW.ENFORCEMENT.WARNING;
        const rule = buildFlagForReviewRule(draft, 'USD', enforcement);
        const conditions = getFlagForReviewConditions(rule);
        const reopenedDraft = conditions && getFlagForReviewDraft(conditions, () => 2);

        // Then every qualifier retains its operator and values, and the action still warns.
        expect(getRuleFilterLeaves(rule?.filters)).toEqual(
            expect.arrayContaining([
                {left: FROM, operator: EQUAL_TO, right: ['123', '456']},
                {left: TAG, operator: EQUAL_TO, right: ['Client A', 'Client B']},
                {left: CURRENCY, operator: EQUAL_TO, right: ['USD', 'JPY']},
                {left: CARD_ID, operator: EQUAL_TO, right: ['789']},
                {left: TAX_RATE, operator: EQUAL_TO, right: ['id_GST']},
                {left: REIMBURSABLE, operator: EQUAL_TO, right: 'no'},
                {left: BILLABLE, operator: EQUAL_TO, right: 'yes'},
                {left: DATE, operator: LOWER_THAN, right: '2026-11-25'},
                {left: HAS, operator: NOT_EQUAL_TO, right: [CONST.SEARCH.HAS_VALUES.RECEIPT]},
            ]),
        );
        expect(reopenedDraft).toMatchObject({...draft, enforcement});
        expect(reopenedDraft && buildFlagForReviewRule(reopenedDraft, 'USD', reopenedDraft.enforcement === enforcement ? enforcement : undefined)).toEqual(rule);
    });

    it('writes exact scalar budget selectors and separates receipt and expense amount checks', () => {
        // Given a budget scoped to one category, tag dimension and submitter, with additional expense checks.
        const draft = {
            category: mealCategory.name,
            dailyBudgetToMatch: '100.25 USD',
            tagsToMatch: ['Client:A'],
            budgetTagLevel: 2,
            submittersToMatch: ['123'],
            amountToMatch: '50.00 CAD',
            hasToMatch: [CONST.SEARCH.HAS_VALUES.RECEIPT],
            hasMatchType: NOT_EQUAL_TO,
        } satisfies Partial<FlagForReviewRuleForm>;
        const enforcement = CONST.RULES.FLAG_FOR_REVIEW.ENFORCEMENT.BLOCK;

        // When saving and reopening it from GetRules.
        const rule = buildFlagForReviewRule(draft, 'JPY', enforcement);
        const conditions = getFlagForReviewConditions(rule);
        const reopenedDraft = conditions && getFlagForReviewDraft(conditions, () => 2);

        // Then only the selectors use scalar equality; the extra conditions do not become category settings.
        expect(getRuleFilterLeaves(rule?.filters)).toEqual(
            expect.arrayContaining([
                categoryFilter,
                dailyCap,
                {left: TAG, operator: EQUAL_TO, right: 'Client:A', tagLevel: 2},
                {left: FROM, operator: EQUAL_TO, right: '123'},
                {left: AMOUNT, operator: GREATER_THAN, right: '50.00 CAD'},
                {left: HAS, operator: NOT_EQUAL_TO, right: [CONST.SEARCH.HAS_VALUES.RECEIPT]},
            ]),
        );
        expect(reopenedDraft).toMatchObject({...draft, enforcement});
        expect(rule && selectFlagLimits({[ruleKey('1')]: {...dailyRule, ...rule}})).toEqual({});
    });

    it.each([
        {tagsToMatch: ['A', 'B'], budgetTagLevel: 1},
        {tagsToMatch: ['A']},
        {submittersToMatch: ['123', '456']},
        {submittersToMatch: ['unknown']},
        {dailyBudgetToMatch: '10000'},
    ] as Array<Partial<FlagForReviewRuleForm>>)('refuses unsupported daily budget operands: %o', (unsupported) => {
        // Given a budget draft with a selector or amount outside Auth's accepted shape.
        const draft = {dailyBudgetToMatch: '100.00 USD', ...unsupported};

        // When building its SetRule body.
        const rule = buildFlagForReviewRule(draft, 'USD', CONST.RULES.FLAG_FOR_REVIEW.ENFORCEMENT.BLOCK);

        // Then the rule cannot be saved with ambiguous spend or any currency.
        expect(rule).toBeUndefined();
    });

    it.each([EQUAL_TO, NOT_EQUAL_TO])('rejects attachment conditions with %s on daily budgets only', (operator) => {
        // Given a presence check for an attachment alongside a receipt.
        const draft = {hasToMatch: [CONST.SEARCH.HAS_VALUES.RECEIPT, CONST.SEARCH.HAS_VALUES.ATTACHMENT], hasMatchType: operator};
        const enforcement = CONST.RULES.FLAG_FOR_REVIEW.ENFORCEMENT.WARNING;

        // When building a regular flag and budgets using expense or report attachment checks.
        const regularFlag = buildFlagForReviewRule(draft, 'USD', enforcement);
        const budget = buildFlagForReviewRule({...draft, dailyBudgetToMatch: dailyCap.right}, 'USD', enforcement);
        const reportAttachmentBudget = buildFlagForReviewRule({...draft, dailyBudgetToMatch: dailyCap.right, hasToMatch: ['report-attachment']}, 'USD', enforcement);

        // Then the regular attachment check still round-trips, but neither budget can be saved.
        expect(getFlagForReviewConditions(regularFlag)?.matchingConditions).toEqual([{left: HAS, operator, right: draft.hasToMatch}]);
        expect(budget).toBeUndefined();
        expect(reportAttachmentBudget).toBeUndefined();
    });

    it('reads a stored budget tag without a level as an exact level-one tag', () => {
        // Given a saved tag budget with an unwrapped tag and Auth's default level.
        const rule = {...dailyRule, filters: {left: {left: TAG, operator: EQUAL_TO, right: 'Client A'}, operator: AND, right: dailyCap}};

        // When deriving the edit draft.
        const conditions = getFlagForReviewConditions(rule);
        const draft = conditions && getFlagForReviewDraft(conditions, () => 2);

        // Then subsequent edits retain the original spending group.
        expect(draft).toMatchObject({tagsToMatch: ['Client A'], budgetTagLevel: 1, dailyBudgetToMatch: '100.25 USD'});
    });

    it('keeps literal backslashes visible in exact budget tags', () => {
        // Given two budget tags that differ by a literal backslash.
        const plainTag = 'Client:A &amp; B';
        const escapedTag = 'Client\\:A &amp; B';

        // When naming the exact tag at the selected level.
        const plain = getFlagTagDisplayName(plainTag, translateLocal, 2);
        const escaped = getFlagTagDisplayName(escapedTag, translateLocal, 2);

        // Then HTML entities are decoded and the two tags still read differently.
        expect(plain).toBe('Client:A & B (Tag level 2)');
        expect(escaped).toBe('Client\\:A & B (Tag level 2)');
    });
});
