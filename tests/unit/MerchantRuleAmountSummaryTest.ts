import {getMerchantRulesTableData} from '@libs/MerchantTypeRulesUtils';
import {toIndexMap} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Rule} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import {convertToDisplayString, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;
const {TRIGGERS: TRIGGER, ACTIONS: ACTION} = CONST.RULES;

const buildPolicy = (outputCurrency: string): Policy => ({
    ...createRandomPolicy(0),
    id: 'policy1',
    outputCurrency,
});

/** The rule stores the amount negated, the way an expense carries it. */
const buildAmountRule = (amountInCents: number): Rule => ({
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: 'policy1',
    triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
    filters: {left: FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Coffee Shop'},
    actions: toIndexMap([{name: ACTION.SET, field: FIELD.AMOUNT, value: -amountInCents}]),
});

describe('Merchant rule amount summary', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    const describeRule = (policy: Policy, rule: Rule) =>
        getMerchantRulesTableData({
            policy,
            policyID: policy.id,
            rules: {[`${ONYXKEYS.COLLECTION.RULE}rule1`]: rule},
            translate: translateLocal,
            convertToDisplayString,
            isOffline: false,
            onNavigate: () => {},
        }).at(0)?.ruleDescription;

    it('shows the cents of a currency that has them', () => {
        // Given a workspace in a currency with two decimal places and a rule setting an amount
        const policy = buildPolicy(CONST.CURRENCY.USD);

        // When the rule is summarized for the table
        const description = describeRule(policy, buildAmountRule(1050));

        // Then the amount reads with its cents
        expect(description).toContain('Update amount to "$10.50"');
    });

    it('omits the cents of a currency that has none', () => {
        // Given a workspace whose currency has no subunit, which is what changing a workspace to JPY does
        const policy = buildPolicy('JPY');

        // When the rule is summarized for the table
        const description = describeRule(policy, buildAmountRule(1050));

        // Then the amount reads without decimals, which is the same value the rule editor shows for this rule
        expect(description).toContain('Update amount to "¥11"');
    });
});
