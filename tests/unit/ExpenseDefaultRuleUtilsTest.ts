import {
    buildMerchantRule,
    getExpenseDefaultRuleSummaryFields,
    getMerchantRuleFormValues,
    getPolicyExpenseDefaultRules,
    getRuleFilterLeaves,
    isExpenseDefaultRule,
} from '@libs/ExpenseDefaultRuleUtils';
import type {MerchantRuleFormValues} from '@libs/ExpenseDefaultRuleUtils';
import Parser from '@libs/Parser';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Rule} from '@src/types/onyx';
import type {ExpenseDefaultAction, ExpenseDefaultRule} from '@src/types/onyx/ExpenseDefaultRules';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';

import createRandomPolicy from '../utils/collections/policies';

const {FIELD, TRIGGER, ACTION} = CONST.RULES.EXPENSE_DEFAULT;
const {EQUAL_TO, CONTAINS, AND, OR, GREATER_THAN} = CONST.SEARCH.SYNTAX_OPERATORS;

const POLICY_ID = 'ABC123';
const OTHER_POLICY_ID = 'DEF456';
const TAX_KEY = 'id_TAX_RATE_1';

/** Mirrors the way the rules engine keys `triggers` and `actions` by a stringified index. */
function toIndexMap<T>(values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

const policy: Policy = {
    ...createRandomPolicy(1),
    id: POLICY_ID,
    taxRates: {
        name: 'Tax',
        defaultExternalID: TAX_KEY,
        defaultValue: '10%',
        foreignTaxDefault: TAX_KEY,
        taxes: {
            [TAX_KEY]: {name: 'GST', value: '10%'},
        },
    },
};

const merchantFilter: RuleFilterComparison = {left: FIELD.MERCHANT, operator: CONTAINS, right: 'Starbucks'};
const setCategoryAction: ExpenseDefaultAction = {name: ACTION.SET, field: FIELD.CATEGORY, value: 'Coffee'};

const merchantRuleBody: ExpenseDefaultRule = {
    triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
    filters: merchantFilter,
    actions: toIndexMap([setCategoryAction]),
};

/** Wraps a rule body into a collection-shaped rule so the collection helpers can be tested. */
function asStoredRule(body: ExpenseDefaultRule, scopeID = POLICY_ID, scope: Rule['scope'] = CONST.RULES.SCOPE.POLICY): Rule {
    return {...body, scope, scopeID};
}

/** Builds a rule body the merchant rule form can't represent, by overriding one part of a valid one. */
function buildRuleWithOverrides(overrides: Record<string, unknown>): ExpenseDefaultRule {
    return {...merchantRuleBody, ...overrides} as ExpenseDefaultRule;
}

describe('ExpenseDefaultRuleUtils', () => {
    describe('buildMerchantRule', () => {
        it('builds the CreateTransaction trigger, the merchant filter and one Set action per field', () => {
            const rule = buildMerchantRule(
                {
                    merchantToMatch: 'Starbucks',
                    matchType: EQUAL_TO,
                    merchant: 'Starbucks Coffee',
                    category: 'Coffee',
                    tag: 'Team A',
                    tax: TAX_KEY,
                    vendorID: 'vendor-1',
                    comment: 'A description',
                    reimbursable: true,
                    billable: false,
                },
                policy,
            );

            expect(rule).toEqual({
                triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
                filters: {left: FIELD.MERCHANT, operator: EQUAL_TO, right: 'Starbucks'},
                actions: toIndexMap([
                    {name: ACTION.SET, field: FIELD.MERCHANT, value: 'Starbucks Coffee'},
                    {name: ACTION.SET, field: FIELD.CATEGORY, value: 'Coffee'},
                    {name: ACTION.SET, field: FIELD.TAG, value: 'Team A'},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    {name: ACTION.SET, field: FIELD.TAX, value: {field_id_TAX: {externalID: TAX_KEY, value: '10%', name: 'GST'}}},
                    {name: ACTION.SET, field: FIELD.VENDOR_ID, value: 'vendor-1'},
                    {name: ACTION.SET, field: FIELD.COMMENT, value: Parser.replace('A description')},
                    {name: ACTION.SET, field: FIELD.REIMBURSABLE, value: true},
                    {name: ACTION.SET, field: FIELD.BILLABLE, value: false},
                ]),
            });
        });

        it('defaults the match type to contains and trims the matched merchant', () => {
            const rule = buildMerchantRule({merchantToMatch: '  Uber  ', category: 'Travel'}, policy);

            expect(rule?.filters).toEqual({left: FIELD.MERCHANT, operator: CONTAINS, right: 'Uber'});
        });

        it('keeps false booleans, which are meaningful values rather than empty ones', () => {
            const rule = buildMerchantRule({merchantToMatch: 'Uber', billable: false, reimbursable: false}, policy);

            expect(Object.values(rule?.actions ?? {})).toEqual([
                {name: ACTION.SET, field: FIELD.REIMBURSABLE, value: false},
                {name: ACTION.SET, field: FIELD.BILLABLE, value: false},
            ]);
        });

        it('returns undefined when there is nothing to match on', () => {
            expect(buildMerchantRule({merchantToMatch: '   ', category: 'Coffee'}, policy)).toBeUndefined();
        });

        it('returns undefined when there is nothing to set', () => {
            expect(buildMerchantRule({merchantToMatch: 'Starbucks'}, policy)).toBeUndefined();
        });

        it('still records the tax external ID when the rate is missing from the policy', () => {
            const rule = buildMerchantRule({merchantToMatch: 'Starbucks', tax: 'id_UNKNOWN'}, policy);

            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(Object.values(rule?.actions ?? {}).at(0)?.value).toEqual({field_id_TAX: {externalID: 'id_UNKNOWN'}});
        });
    });

    describe('getMerchantRuleFormValues round trip', () => {
        it('returns the values it was built from', () => {
            const formValues: MerchantRuleFormValues = {
                merchantToMatch: 'Starbucks',
                matchType: EQUAL_TO,
                merchant: 'Starbucks Coffee',
                category: 'Coffee',
                tag: 'Team A',
                tax: TAX_KEY,
                vendorID: 'vendor-1',
                comment: 'A description',
                reimbursable: true,
                billable: false,
            };

            expect(getMerchantRuleFormValues(buildMerchantRule(formValues, policy))).toEqual(formValues);
        });

        it('round trips a rule that only renames the merchant', () => {
            const formValues: MerchantRuleFormValues = {merchantToMatch: 'STARBUCKS #123', matchType: CONTAINS, merchant: 'Starbucks'};

            expect(getMerchantRuleFormValues(buildMerchantRule(formValues, policy))).toEqual(formValues);
        });

        it('converts the description back to markdown', () => {
            const rule = buildMerchantRule({merchantToMatch: 'Starbucks', comment: 'A description'}, policy);

            expect(getMerchantRuleFormValues(rule)?.comment).toBe('A description');
        });

        it('accepts a single-value list on the right of the merchant filter', () => {
            const rule = buildRuleWithOverrides({filters: {left: FIELD.MERCHANT, operator: CONTAINS, right: ['Starbucks']}});

            expect(getMerchantRuleFormValues(rule)).toEqual({merchantToMatch: 'Starbucks', matchType: CONTAINS, category: 'Coffee'});
        });
    });

    describe('getMerchantRuleFormValues rejects rules the form cannot represent', () => {
        it.each([
            [
                'a nested filter tree',
                {
                    filters: {
                        left: merchantFilter,
                        operator: AND,
                        right: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'},
                    },
                },
            ],
            ['a filter on a field the form has no input for', {filters: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'}}],
            ['an operator the form has no control for', {filters: {left: FIELD.MERCHANT, operator: GREATER_THAN, right: 'Starbucks'}}],
            ['a list of merchants, which the form has one input for', {filters: {left: FIELD.MERCHANT, operator: OR, right: ['Starbucks', 'Costa']}}],
            ['a trigger the form does not set', {triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION, CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT])}],
            ['no triggers at all', {triggers: {}}],
            ['no actions at all', {actions: {}}],
            ['an action the form cannot produce', {actions: toIndexMap([{name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver: 'a@b.com'}])}],
            ['an unknown field', {actions: toIndexMap([{name: ACTION.SET, field: 'attendees', value: 'someone'}])}],
            [
                'two actions writing the same field',
                {
                    actions: toIndexMap([setCategoryAction, {name: ACTION.SET, field: FIELD.CATEGORY, value: 'Travel'}]),
                },
            ],
            ['a value of the wrong type', {actions: toIndexMap([{name: ACTION.SET, field: FIELD.BILLABLE, value: 'true'}])}],
            ['a malformed tax value', {actions: toIndexMap([{name: ACTION.SET, field: FIELD.TAX, value: TAX_KEY}])}],
        ])('returns undefined for %s', (_description, overrides) => {
            expect(getMerchantRuleFormValues(buildRuleWithOverrides(overrides))).toBeUndefined();
        });

        it('returns undefined for an undefined rule', () => {
            expect(getMerchantRuleFormValues(undefined)).toBeUndefined();
        });
    });

    describe('isExpenseDefaultRule', () => {
        it('is true for a rule that runs on transaction creation and sets a field', () => {
            expect(isExpenseDefaultRule(asStoredRule(merchantRuleBody))).toBe(true);
        });

        it('is false for a rule with no Set action', () => {
            const rule = asStoredRule(buildRuleWithOverrides({actions: toIndexMap([{name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver: 'a@b.com'}])}));

            expect(isExpenseDefaultRule(rule)).toBe(false);
        });

        it('is false for a rule that does not run on transaction creation', () => {
            const rule = asStoredRule(buildRuleWithOverrides({triggers: toIndexMap([CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT])}));

            expect(isExpenseDefaultRule(rule)).toBe(false);
        });
    });

    describe('getPolicyExpenseDefaultRules', () => {
        it('keeps only the expense default rules scoped to the given policy', () => {
            const collection = {
                [`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(merchantRuleBody),
                [`${ONYXKEYS.COLLECTION.RULE}2`]: asStoredRule(merchantRuleBody, OTHER_POLICY_ID),
                [`${ONYXKEYS.COLLECTION.RULE}3`]: asStoredRule(merchantRuleBody, '5555', CONST.RULES.SCOPE.ACCOUNT),
                [`${ONYXKEYS.COLLECTION.RULE}4`]: asStoredRule(buildRuleWithOverrides({triggers: toIndexMap([CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT])})),
            };

            expect(getPolicyExpenseDefaultRules(collection, POLICY_ID)).toEqual([{ruleID: '1', rule: collection[`${ONYXKEYS.COLLECTION.RULE}1`]}]);
        });

        it('returns an empty list without a policy ID', () => {
            expect(getPolicyExpenseDefaultRules({[`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(merchantRuleBody)}, undefined)).toEqual([]);
        });
    });

    describe('getRuleFilterLeaves', () => {
        it('flattens a nested tree left to right', () => {
            const middleLeaf: RuleFilterComparison = {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'};
            const rightLeaf: RuleFilterComparison = {left: FIELD.TAG, operator: EQUAL_TO, right: 'Team A'};
            const tree: RuleFilterNode = {left: {left: merchantFilter, operator: OR, right: middleLeaf}, operator: AND, right: rightLeaf};

            expect(getRuleFilterLeaves(tree)).toEqual([merchantFilter, middleLeaf, rightLeaf]);
        });

        it('returns a single leaf unchanged', () => {
            expect(getRuleFilterLeaves(merchantFilter)).toEqual([merchantFilter]);
        });
    });

    describe('getExpenseDefaultRuleSummaryFields', () => {
        it('lists the fields a rule sets in action-key order, including rules the form cannot open', () => {
            // Keys are deliberately out of numeric order, and "10" would sort before "2" as a string.
            const rule = buildRuleWithOverrides({
                actions: Object.fromEntries([
                    ['0', setCategoryAction],
                    ['10', {name: ACTION.SET, field: FIELD.BILLABLE, value: true}],
                    ['2', {name: ACTION.SET, field: FIELD.COMMENT, value: Parser.replace('A description')}],
                ]),
            });

            expect(getExpenseDefaultRuleSummaryFields(rule)).toEqual([
                {field: FIELD.CATEGORY, value: 'Coffee'},
                {field: FIELD.COMMENT, value: 'A description'},
                {field: FIELD.BILLABLE, value: true},
            ]);
        });

        it('skips actions that do not set a field', () => {
            const rule = buildRuleWithOverrides({actions: toIndexMap([{name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver: 'a@b.com'}])});

            expect(getExpenseDefaultRuleSummaryFields(rule)).toEqual([]);
        });
    });
});
