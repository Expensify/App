import {
    buildExpenseDefaultRule,
    canEditExpenseDefaultRule,
    getCategoryOwnExpenseDefaultRule,
    getCategoryOwnExpenseDefaultRules,
    getExpenseDefaultConditionSummary,
    getExpenseDefaultRuleCount,
    getExpenseDefaultRuleSummaryFields,
    getExpenseDefaultFormValues,
    getPolicyExpenseDefaultRules,
    hasExpenseDefaultRuleErrors,
    haveSameConditions,
} from '@libs/ExpenseDefaultRuleUtils';
import type {ExpenseDefaultFormValues} from '@libs/ExpenseDefaultRuleUtils';
import Parser from '@libs/Parser';
import {getRuleFilterLeaves, isExpenseDefaultRule, toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Rule} from '@src/types/onyx';
import type {ExpenseDefaultAction, ExpenseDefaultRule} from '@src/types/onyx/ExpenseDefaultRules';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';

import createRandomPolicy from '../utils/collections/policies';

const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;
const {TRIGGERS: TRIGGER, ACTIONS: ACTION} = CONST.RULES;
const {EQUAL_TO, CONTAINS, AND, OR, GREATER_THAN} = CONST.SEARCH.SYNTAX_OPERATORS;

const POLICY_ID = 'ABC123';
const OTHER_POLICY_ID = 'DEF456';
const TAX_KEY = 'id_TAX_RATE_1';

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
    describe('buildExpenseDefaultRule', () => {
        it('builds both transaction triggers, the merchant filter and one Set action per field', () => {
            const rule = buildExpenseDefaultRule(
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
                triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION, TRIGGER.UPDATE_TRANSACTION]),
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
            const rule = buildExpenseDefaultRule({merchantToMatch: '  Uber  ', category: 'Travel'}, policy);

            expect(rule?.filters).toEqual({left: FIELD.MERCHANT, operator: CONTAINS, right: 'Uber'});
        });

        it('keeps false booleans, which are meaningful values rather than empty ones', () => {
            const rule = buildExpenseDefaultRule({merchantToMatch: 'Uber', billable: false, reimbursable: false}, policy);

            expect(Object.values(rule?.actions ?? {})).toEqual([
                {name: ACTION.SET, field: FIELD.REIMBURSABLE, value: false},
                {name: ACTION.SET, field: FIELD.BILLABLE, value: false},
            ]);
        });

        it('returns undefined when there is nothing to match on', () => {
            expect(buildExpenseDefaultRule({merchantToMatch: '   ', category: 'Coffee'}, policy)).toBeUndefined();
        });

        it('returns undefined when there is nothing to set', () => {
            expect(buildExpenseDefaultRule({merchantToMatch: 'Starbucks'}, policy)).toBeUndefined();
        });

        it('treats a whitespace-only description as nothing to set', () => {
            expect(buildExpenseDefaultRule({merchantToMatch: 'Starbucks', comment: '   '}, policy)).toBeUndefined();
        });

        it('still records the tax external ID when the rate is missing from the policy', () => {
            const rule = buildExpenseDefaultRule({merchantToMatch: 'Starbucks', tax: 'id_UNKNOWN'}, policy);

            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(Object.values(rule?.actions ?? {}).at(0)?.value).toEqual({field_id_TAX: {externalID: 'id_UNKNOWN'}});
        });
    });

    describe('getExpenseDefaultFormValues round trip', () => {
        it('returns the values it was built from', () => {
            const formValues: ExpenseDefaultFormValues = {
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

            expect(getExpenseDefaultFormValues(buildExpenseDefaultRule(formValues, policy))).toEqual(formValues);
        });

        it('round trips a rule that only renames the merchant', () => {
            const formValues: ExpenseDefaultFormValues = {merchantToMatch: 'STARBUCKS #123', matchType: CONTAINS, merchant: 'Starbucks'};

            expect(getExpenseDefaultFormValues(buildExpenseDefaultRule(formValues, policy))).toEqual(formValues);
        });

        it('converts the description back to markdown', () => {
            const rule = buildExpenseDefaultRule({merchantToMatch: 'Starbucks', comment: 'A description'}, policy);

            expect(getExpenseDefaultFormValues(rule)?.comment).toBe('A description');
        });

        it('accepts a single-value list on the right of the merchant filter', () => {
            const rule = buildRuleWithOverrides({filters: {left: FIELD.MERCHANT, operator: CONTAINS, right: ['Starbucks']}});

            expect(getExpenseDefaultFormValues(rule)).toEqual({merchantToMatch: 'Starbucks', matchType: CONTAINS, category: 'Coffee'});
        });
    });

    describe('buildExpenseDefaultRule conditions', () => {
        it('builds one condition per field, ANDed together and nested to the left', () => {
            // Given a form matching on a merchant, two categories and a tag
            const formValues: Partial<ExpenseDefaultFormValues> = {
                merchantToMatch: 'Starbucks',
                matchType: EQUAL_TO,
                categoriesToMatch: ['Coffee', 'Travel'],
                tagsToMatch: ['Team A'],
                category: 'Coffee',
            };

            // When the rule is built
            const rule = buildExpenseDefaultRule(formValues, policy);

            // Then the conditions are ANDed in form order, with each list left as an OR of its values
            expect(rule?.filters).toEqual({
                operator: AND,
                left: {
                    operator: AND,
                    left: {left: FIELD.MERCHANT, operator: EQUAL_TO, right: 'Starbucks'},
                    right: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: ['Coffee', 'Travel']},
                },
                right: {left: FIELD.TAG, operator: EQUAL_TO, right: ['Team A']},
            });
        });

        it('builds a rule that matches on a category alone', () => {
            // Given a form with no merchant, which is a rule the editor could not express before
            const rule = buildExpenseDefaultRule({categoriesToMatch: ['Coffee'], tax: TAX_KEY}, policy);

            // When its filters are read
            // Then the single category condition is the whole tree
            expect(rule?.filters).toEqual({left: FIELD.CATEGORY, operator: EQUAL_TO, right: ['Coffee']});
        });

        it('returns undefined when every condition is blank', () => {
            // Given a form whose pickers were emptied, leaving blanks behind
            // When the rule is built
            // Then there is nothing to match on, so no rule is built
            expect(buildExpenseDefaultRule({merchantToMatch: '  ', categoriesToMatch: ['  '], tagsToMatch: [], category: 'Coffee'}, policy)).toBeUndefined();
        });

        it('round trips every condition', () => {
            // Given a form matching on all three fields
            const formValues: ExpenseDefaultFormValues = {
                merchantToMatch: 'Starbucks',
                matchType: CONTAINS,
                categoriesToMatch: ['Coffee'],
                tagsToMatch: ['Team A', 'Team B'],
                category: 'Coffee',
            };

            // When the built rule is read back
            // Then the form gets the same conditions it wrote
            expect(getExpenseDefaultFormValues(buildExpenseDefaultRule(formValues, policy))).toEqual(formValues);
        });
    });

    describe('buildExpenseDefaultRule amount default', () => {
        it('stores the amount negated, the way an expense carries it', () => {
            // Given a rule setting the amount to $30.00
            const rule = buildExpenseDefaultRule({merchantToMatch: 'Starbucks', amount: '3000'}, policy);

            // When the action is read
            // Then the stored value is negative cents
            expect(Object.values(rule?.actions ?? {})).toEqual([{name: ACTION.SET, field: FIELD.AMOUNT, value: -3000}]);
        });

        it('round trips the amount as the admin typed it', () => {
            // Given a rule setting an amount
            const formValues: ExpenseDefaultFormValues = {merchantToMatch: 'Starbucks', matchType: CONTAINS, amount: '3000'};

            // When it is read back
            // Then the form gets the positive amount, not the negated one
            expect(getExpenseDefaultFormValues(buildExpenseDefaultRule(formValues, policy))).toEqual(formValues);
        });

        it('leaves out an amount of zero, which is not a default', () => {
            // Given a rule whose amount was cleared
            // When it is built
            // Then nothing is set, so the rule has no default and is not built
            expect(buildExpenseDefaultRule({merchantToMatch: 'Starbucks', amount: '0'}, policy)).toBeUndefined();
        });

        it('is read-only for a rule that sets a credit', () => {
            // Given a rule storing a positive amount, which sets a credit rather than an expense
            const rule = buildRuleWithOverrides({actions: toIndexMap([{name: ACTION.SET, field: FIELD.AMOUNT, value: 3000}])});

            // When the form tries to read it
            // Then it is refused, because saving the form back would flip the sign
            expect(getExpenseDefaultFormValues(rule)).toBeUndefined();
        });
    });

    describe('getExpenseDefaultConditionSummary', () => {
        it('groups every condition by the field it matches on', () => {
            // Given a rule matching on a merchant, two categories and a tag
            const rule = buildExpenseDefaultRule({merchantToMatch: 'Starbucks', categoriesToMatch: ['Coffee', 'Travel'], tagsToMatch: ['Team A'], category: 'Coffee'}, policy);

            // When its conditions are summarized
            // Then each field keeps its own values, so the table can name them separately
            expect(getExpenseDefaultConditionSummary(rule?.filters)).toEqual({
                merchants: [{value: 'Starbucks', isExactMatch: false}],
                categories: ['Coffee', 'Travel'],
                tags: ['Team A'],
            });
        });

        it('summarizes a rule the editor cannot open', () => {
            // Given two merchants ORed together, which the form has one input for
            const filters: RuleFilterNode = {
                left: merchantFilter,
                operator: OR,
                right: {left: FIELD.MERCHANT, operator: CONTAINS, right: 'Costa'},
            };

            // When it is summarized
            // Then both merchants are listed, so a read-only rule still shows what it matches
            expect(getExpenseDefaultConditionSummary(filters)).toEqual({
                merchants: [
                    {value: 'Starbucks', isExactMatch: false},
                    {value: 'Costa', isExactMatch: false},
                ],
                categories: [],
                tags: [],
            });
        });

        it('keeps the match type of each merchant condition', () => {
            // Given one rule matching a merchant exactly and another matching it by substring
            const exactRule = buildExpenseDefaultRule({merchantToMatch: 'Uber', matchType: EQUAL_TO, category: 'Travel'}, policy);
            const containsRule = buildExpenseDefaultRule({merchantToMatch: 'Uber', matchType: CONTAINS, category: 'Travel'}, policy);

            // When each is summarized
            // Then the match type comes back with the merchant, so the table can tell the two rules apart
            expect(getExpenseDefaultConditionSummary(exactRule?.filters).merchants).toEqual([{value: 'Uber', isExactMatch: true}]);
            expect(getExpenseDefaultConditionSummary(containsRule?.filters).merchants).toEqual([{value: 'Uber', isExactMatch: false}]);
        });

        it('ignores a field the table has no wording for', () => {
            // Given a rule matching on a merchant category code
            const filters: RuleFilterNode = {left: CONST.SEARCH.SYNTAX_FILTER_KEYS.MCC, operator: EQUAL_TO, right: '5812'};

            // When it is summarized
            // Then nothing is reported, rather than the code being labelled as a merchant
            expect(getExpenseDefaultConditionSummary(filters)).toEqual({merchants: [], categories: [], tags: []});
        });

        it('reports nothing for a rule with no filters', () => {
            // Given a rule whose filters never loaded
            // When it is summarized
            // Then every field is empty
            expect(getExpenseDefaultConditionSummary(undefined)).toEqual({merchants: [], categories: [], tags: []});
        });
    });

    describe('haveSameConditions', () => {
        it('ignores the order of a multi-select', () => {
            // Given two rules picking the same categories in a different order
            // When they are compared
            // Then they are duplicates, because the list is matched as an OR
            expect(haveSameConditions({categoriesToMatch: ['Coffee', 'Travel']}, {categoriesToMatch: ['Travel', 'Coffee']})).toBe(true);
        });

        it('treats a different match type on the same merchant as a different rule', () => {
            // Given the same merchant matched exactly by one rule and partially by the other
            // When they are compared
            // Then they are not duplicates, because they match different expenses
            expect(haveSameConditions({merchantToMatch: 'Starbucks', matchType: EQUAL_TO}, {merchantToMatch: 'Starbucks', matchType: CONTAINS})).toBe(false);
        });

        it('ignores the match type when neither rule matches on a merchant', () => {
            // Given two category rules whose match type is left at its default
            // When they are compared
            // Then they are duplicates, because the match type only applies to the merchant input
            expect(haveSameConditions({categoriesToMatch: ['Coffee'], matchType: EQUAL_TO}, {categoriesToMatch: ['Coffee'], matchType: CONTAINS})).toBe(true);
        });

        it('is false when one rule matches on a condition the other does not', () => {
            // Given two rules on the same merchant, one of which is also narrowed to a tag
            // When they are compared
            // Then they are not duplicates
            expect(haveSameConditions({merchantToMatch: 'Starbucks'}, {merchantToMatch: 'Starbucks', tagsToMatch: ['Team A']})).toBe(false);
        });
    });

    describe('getExpenseDefaultFormValues rejects rules the form cannot represent', () => {
        it.each([
            [
                'conditions combined with or rather than and',
                {
                    filters: {
                        left: merchantFilter,
                        operator: OR,
                        right: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'},
                    },
                },
            ],
            [
                'two conditions on the same field, which the form has one input for',
                {
                    filters: {
                        left: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'},
                        operator: AND,
                        right: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Travel'},
                    },
                },
            ],
            ['a condition on an operator the form has no control for', {filters: {left: FIELD.CATEGORY, operator: CONTAINS, right: 'Coffee'}}],
            ['a filter on a field the form has no input for', {filters: {left: CONST.SEARCH.SYNTAX_FILTER_KEYS.MCC, operator: EQUAL_TO, right: '5812'}}],
            ['an operator the form has no control for', {filters: {left: FIELD.MERCHANT, operator: GREATER_THAN, right: 'Starbucks'}}],
            ['a list of merchants, which the form has one input for', {filters: {left: FIELD.MERCHANT, operator: OR, right: ['Starbucks', 'Costa']}}],
            ['a trigger the form does not set', {triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION, CONST.RULES.TRIGGERS.REPORT_SUBMIT])}],
            ['no triggers at all', {triggers: {}}],
            ['no actions at all', {actions: {}}],
            ['an action the form cannot produce', {actions: toIndexMap([{name: CONST.RULES.ACTIONS.FORWARD_TO, approver: 'a@b.com'}])}],
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
            expect(getExpenseDefaultFormValues(buildRuleWithOverrides(overrides))).toBeUndefined();
        });

        it('returns undefined for an undefined rule', () => {
            expect(getExpenseDefaultFormValues(undefined)).toBeUndefined();
        });
    });

    describe('triggers the backend sets', () => {
        // Given a category tax default as the backend writes it, which also fires when an expense is edited
        const backendTriggers = toIndexMap([TRIGGER.CREATE_TRANSACTION, CONST.RULES.TRIGGERS.UPDATE_TRANSACTION]);

        it('opens a rule that also fires on UpdateTransaction', () => {
            // When the editor reads it
            const formValues = getExpenseDefaultFormValues(buildRuleWithOverrides({triggers: backendTriggers}));

            // Then it is editable rather than read-only, because the form can hand every trigger back untouched
            expect(formValues).toEqual({merchantToMatch: 'Starbucks', matchType: CONTAINS, category: 'Coffee'});
        });

        it('keeps both triggers when the rule is saved again', () => {
            // When the edited rule is rebuilt from the form
            const rule = buildExpenseDefaultRule({categoriesToMatch: ['Coffee'], tax: TAX_KEY}, policy, backendTriggers);

            // Then the trigger the form has no input for survives the save
            expect(rule?.triggers).toEqual(backendTriggers);
        });

        it('sets both triggers on a new rule', () => {
            // When a rule is built with no existing triggers to carry over
            const rule = buildExpenseDefaultRule({categoriesToMatch: ['Coffee'], tax: TAX_KEY}, policy);

            // Then it fires on creation and on an edit, matching what the backend writes
            expect(rule?.triggers).toEqual(backendTriggers);
        });

        it('stays read-only when a trigger is one the form does not know', () => {
            // When the rule carries a trigger outside the transaction lifecycle
            const rule = buildRuleWithOverrides({triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION, CONST.RULES.TRIGGERS.REPORT_APPROVE])});

            // Then the editor refuses it, since saving would drop that trigger
            expect(getExpenseDefaultFormValues(rule)).toBeUndefined();
        });
    });

    describe('isExpenseDefaultRule', () => {
        it('is true for a rule that runs on transaction creation and sets a field', () => {
            expect(isExpenseDefaultRule(asStoredRule(merchantRuleBody))).toBe(true);
        });

        it('is false for a rule with no Set action', () => {
            const rule = asStoredRule(buildRuleWithOverrides({actions: toIndexMap([{name: CONST.RULES.ACTIONS.FORWARD_TO, approver: 'a@b.com'}])}));

            expect(isExpenseDefaultRule(rule)).toBe(false);
        });

        it('is false for a rule that does not run on transaction creation', () => {
            const rule = asStoredRule(buildRuleWithOverrides({triggers: toIndexMap([CONST.RULES.TRIGGERS.REPORT_SUBMIT])}));

            expect(isExpenseDefaultRule(rule)).toBe(false);
        });

        it('is true for a rule that matches on a category rather than a merchant', () => {
            // Given a category rule, which the editor can now open
            const rule = asStoredRule(buildRuleWithOverrides({filters: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'}}));

            // When it is tested
            // Then it is an expense default, because merchant is only one of the conditions it can match on
            expect(isExpenseDefaultRule(rule)).toBe(true);
        });

        it('is false for a rule with no conditions', () => {
            // Given a rule that sets a field but matches on nothing, which would apply to every expense
            const rule = asStoredRule(buildRuleWithOverrides({filters: undefined}));

            // When it is tested
            // Then it is not an expense default
            expect(isExpenseDefaultRule(rule)).toBe(false);
        });

        it('is true for a merchant condition nested inside a combination', () => {
            // Given a rule whose merchant condition sits one level down, which is how two merchants are matched
            const rule = asStoredRule(
                buildRuleWithOverrides({
                    filters: {left: merchantFilter, operator: CONST.SEARCH.SYNTAX_OPERATORS.OR, right: {left: FIELD.MERCHANT, operator: CONTAINS, right: 'Costa'}},
                }),
            );

            // When it is tested
            // Then the nesting does not hide the merchant condition
            expect(isExpenseDefaultRule(rule)).toBe(true);
        });
    });

    describe('getPolicyExpenseDefaultRules', () => {
        it('keeps only the expense default rules scoped to the given policy', () => {
            const collection = {
                [`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(merchantRuleBody),
                [`${ONYXKEYS.COLLECTION.RULE}2`]: asStoredRule(merchantRuleBody, OTHER_POLICY_ID),
                [`${ONYXKEYS.COLLECTION.RULE}3`]: asStoredRule(merchantRuleBody, '5555', CONST.RULES.SCOPE.ACCOUNT),
                [`${ONYXKEYS.COLLECTION.RULE}4`]: asStoredRule(buildRuleWithOverrides({triggers: toIndexMap([CONST.RULES.TRIGGERS.REPORT_SUBMIT])})),
            };

            expect(getPolicyExpenseDefaultRules(collection, POLICY_ID)).toEqual([{ruleID: '1', rule: collection[`${ONYXKEYS.COLLECTION.RULE}1`]}]);
        });

        it('returns an empty list without a policy ID', () => {
            expect(getPolicyExpenseDefaultRules({[`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(merchantRuleBody)}, undefined)).toEqual([]);
        });
    });

    describe('getExpenseDefaultRuleCount', () => {
        it('counts only the rules scoped to the given policy', () => {
            const collection = {
                [`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(merchantRuleBody),
                [`${ONYXKEYS.COLLECTION.RULE}2`]: asStoredRule(merchantRuleBody, OTHER_POLICY_ID),
            };

            expect(getExpenseDefaultRuleCount(collection, POLICY_ID)).toBe(1);
        });

        it('ignores rules being deleted', () => {
            const collection = {
                [`${ONYXKEYS.COLLECTION.RULE}1`]: {...asStoredRule(merchantRuleBody), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            };

            expect(getExpenseDefaultRuleCount(collection, POLICY_ID)).toBe(0);
        });

        it('is zero for an empty collection', () => {
            expect(getExpenseDefaultRuleCount({}, POLICY_ID)).toBe(0);
        });
    });

    describe('getCategoryOwnExpenseDefaultRule', () => {
        const categoryOnlyRuleBody: ExpenseDefaultRule = {
            triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
            filters: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'},
            actions: toIndexMap([{name: ACTION.SET, field: FIELD.MERCHANT, value: 'Starbucks Coffee'} as ExpenseDefaultAction]),
        };

        it('finds the rule the category decides on its own', () => {
            // Given a rule matching that category and nothing else
            const collection = {[`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(categoryOnlyRuleBody)};

            // When the category's own rule is looked up
            // Then it is found, so creating another one for that category opens it as an edit instead
            expect(getCategoryOwnExpenseDefaultRule(collection, POLICY_ID, 'Coffee')?.ruleID).toBe('1');
        });

        it('ignores a rule that also matches on a merchant', () => {
            // Given only a rule matching the category together with a merchant
            const ruleWithMerchant: ExpenseDefaultRule = {
                ...categoryOnlyRuleBody,
                filters: {
                    operator: AND,
                    left: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'},
                    right: {left: FIELD.MERCHANT, operator: CONTAINS, right: 'Starbucks'},
                },
            };
            const collection = {[`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(ruleWithMerchant)};

            // When the category's own rule is looked up
            // Then nothing is returned, because that rule belongs to the merchant as much as to the category, so
            // the category is still free to get a rule of its own
            expect(getCategoryOwnExpenseDefaultRule(collection, POLICY_ID, 'Coffee')).toBeUndefined();
        });

        it('ignores a rule that also matches on a tag', () => {
            // Given only a rule matching the category together with a tag
            const ruleWithTag: ExpenseDefaultRule = {
                ...categoryOnlyRuleBody,
                filters: {
                    operator: AND,
                    left: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Coffee'},
                    right: {left: FIELD.TAG, operator: EQUAL_TO, right: 'Engineering'},
                },
            };
            const collection = {[`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(ruleWithTag)};

            // When the category's own rule is looked up
            // Then nothing is returned, for the same reason a merchant match is skipped
            expect(getCategoryOwnExpenseDefaultRule(collection, POLICY_ID, 'Coffee')).toBeUndefined();
        });

        it('ignores a rule being deleted', () => {
            // Given the category's own rule, deleted while offline so it is still in the collection
            const collection = {
                [`${ONYXKEYS.COLLECTION.RULE}1`]: {...asStoredRule(categoryOnlyRuleBody), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            };

            // When the category's own rule is looked up
            // Then nothing is returned, so the category can be given a rule again
            expect(getCategoryOwnExpenseDefaultRule(collection, POLICY_ID, 'Coffee')).toBeUndefined();
        });

        it('returns a rule that sets no tax', () => {
            // Given a rule matching the category alone that sets an amount rather than a tax
            const amountOnly: ExpenseDefaultRule = {
                ...categoryOnlyRuleBody,
                actions: toIndexMap([{name: ACTION.SET, field: FIELD.AMOUNT, value: -1000} as ExpenseDefaultAction]),
            };
            const collection = {[`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(amountOnly)};

            // When the category's own rule is looked up
            // Then it is found, because a category's rule need not set a tax
            expect(getCategoryOwnExpenseDefaultRule(collection, POLICY_ID, 'Coffee')?.ruleID).toBe('1');
        });

        it('returns every rule the category decides on its own', () => {
            // Given two rules that each match the category alone, which saving past the duplicate prompt allows
            const second: ExpenseDefaultRule = {
                ...categoryOnlyRuleBody,
                actions: toIndexMap([{name: ACTION.SET, field: FIELD.AMOUNT, value: -1000} as ExpenseDefaultAction]),
            };
            const collection = {
                [`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(categoryOnlyRuleBody),
                [`${ONYXKEYS.COLLECTION.RULE}2`]: asStoredRule(second),
            };

            // When every rule the category decides on its own is looked up
            // Then both come back, so category settings can list one row for each instead of hiding the second
            expect(getCategoryOwnExpenseDefaultRules(collection, POLICY_ID, 'Coffee').map(({ruleID}) => ruleID)).toEqual(['1', '2']);
        });
    });

    describe('hasExpenseDefaultRuleErrors', () => {
        const failedRule = {...asStoredRule(merchantRuleBody), errors: {error: 'Whoops'}};

        it("is true when one of the policy's rules failed to save", () => {
            expect(hasExpenseDefaultRuleErrors({[`${ONYXKEYS.COLLECTION.RULE}1`]: failedRule}, POLICY_ID)).toBe(true);
        });

        it('is false when the failed rule belongs to another policy', () => {
            expect(hasExpenseDefaultRuleErrors({[`${ONYXKEYS.COLLECTION.RULE}1`]: {...failedRule, scopeID: OTHER_POLICY_ID}}, POLICY_ID)).toBe(false);
        });

        it('is false when no rule carries an error', () => {
            expect(hasExpenseDefaultRuleErrors({[`${ONYXKEYS.COLLECTION.RULE}1`]: asStoredRule(merchantRuleBody)}, POLICY_ID)).toBe(false);
        });
    });

    describe('canEditExpenseDefaultRule', () => {
        it('allows a representable rule scoped to the policy', () => {
            expect(canEditExpenseDefaultRule(asStoredRule(merchantRuleBody), POLICY_ID)).toBe(true);
        });

        it('refuses a rule belonging to another policy', () => {
            expect(canEditExpenseDefaultRule(asStoredRule(merchantRuleBody, OTHER_POLICY_ID), POLICY_ID)).toBe(false);
        });

        it('refuses an account scoped rule', () => {
            expect(canEditExpenseDefaultRule(asStoredRule(merchantRuleBody, POLICY_ID, CONST.RULES.SCOPE.ACCOUNT), POLICY_ID)).toBe(false);
        });

        it('refuses an approval workflow rule that happens to share the ruleID', () => {
            const approvalWorkflowRule = asStoredRule(
                buildRuleWithOverrides({
                    triggers: toIndexMap([CONST.RULES.TRIGGERS.REPORT_SUBMIT]),
                    actions: toIndexMap([{name: CONST.RULES.ACTIONS.FORWARD_TO, approver: 'a@b.com'}]),
                }),
            );

            expect(canEditExpenseDefaultRule(approvalWorkflowRule, POLICY_ID)).toBe(false);
        });

        it('refuses a rule the form cannot represent, so saving cannot overwrite it', () => {
            const nested = asStoredRule(
                buildRuleWithOverrides({
                    filters: {left: merchantFilter, operator: AND, right: {left: FIELD.MERCHANT, operator: CONTAINS, right: 'Costa'}},
                }),
            );

            expect(canEditExpenseDefaultRule(nested, POLICY_ID)).toBe(false);
        });

        it('refuses without a rule or without a policy', () => {
            expect(canEditExpenseDefaultRule(undefined, POLICY_ID)).toBe(false);
            expect(canEditExpenseDefaultRule(asStoredRule(merchantRuleBody), undefined)).toBe(false);
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
        it('lists the fields a rule sets in the editor field order, including rules the form cannot open', () => {
            // Given actions whose keys are out of numeric order, where "10" would also sort before "2" as a string
            const rule = buildRuleWithOverrides({
                actions: Object.fromEntries([
                    ['0', setCategoryAction],
                    ['10', {name: ACTION.SET, field: FIELD.BILLABLE, value: true}],
                    ['2', {name: ACTION.SET, field: FIELD.COMMENT, value: Parser.replace('A description')}],
                ]),
            });

            // When the summary fields are read back
            // Then they come out in editor field order rather than key order
            expect(getExpenseDefaultRuleSummaryFields(rule)).toEqual([
                {field: FIELD.CATEGORY, value: 'Coffee'},
                {field: FIELD.COMMENT, value: 'A description'},
                {field: FIELD.BILLABLE, value: true},
            ]);
        });

        it('orders the same rule identically however the actions are indexed', () => {
            // Given one rule indexed the way the editor writes it and the same rule indexed the way the backend returns it
            const setMerchant = {name: ACTION.SET, field: FIELD.MERCHANT, value: 'Starbucks'};
            const setComment = {name: ACTION.SET, field: FIELD.COMMENT, value: Parser.replace('A description')};
            const asWritten = buildRuleWithOverrides({actions: toIndexMap([setMerchant, setCategoryAction, setComment])});
            const asReturned = buildRuleWithOverrides({actions: toIndexMap([setCategoryAction, setComment, setMerchant])});

            // When both are summarized
            // Then the differing action keys do not reshuffle the summary, so the row text does not jump when a save comes back
            expect(getExpenseDefaultRuleSummaryFields(asReturned)).toEqual(getExpenseDefaultRuleSummaryFields(asWritten));
            expect(getExpenseDefaultRuleSummaryFields(asReturned)).toEqual([
                {field: FIELD.MERCHANT, value: 'Starbucks'},
                {field: FIELD.CATEGORY, value: 'Coffee'},
                {field: FIELD.COMMENT, value: 'A description'},
            ]);
        });

        it('skips actions that do not set a field', () => {
            const rule = buildRuleWithOverrides({actions: toIndexMap([{name: CONST.RULES.ACTIONS.FORWARD_TO, approver: 'a@b.com'}])});

            expect(getExpenseDefaultRuleSummaryFields(rule)).toEqual([]);
        });
    });
});
