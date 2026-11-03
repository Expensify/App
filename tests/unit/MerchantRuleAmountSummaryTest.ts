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

/** The rule stores the amount negated, so a $30.00 default is saved as -3000. */
const AMOUNT_ACTION_VALUE = -3000;

const buildPolicy = (outputCurrency: string): Policy => ({...createRandomPolicy(0), id: 'policy1', outputCurrency});

const amountRule: Rule = {
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: 'policy1',
    triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
    filters: {left: FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Coffee Shop'},
    actions: toIndexMap([{name: ACTION.SET, field: FIELD.AMOUNT, value: AMOUNT_ACTION_VALUE}]),
};

describe('Merchant rule amount summary', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    const describeRule = (policy: Policy) =>
        getMerchantRulesTableData({
            policy,
            policyID: policy.id,
            rules: {[`${ONYXKEYS.COLLECTION.RULE}rule1`]: amountRule},
            translate: translateLocal,
            convertToDisplayString,
            isOffline: false,
            onNavigate: () => {},
        }).at(0)?.ruleDescription;

    it('reads the amount in the currency the workspace pays in', () => {
        // Given a workspace paying in a currency that has cents
        const policy = buildPolicy(CONST.CURRENCY.USD);

        // When the rules table describes a rule that sets an amount
        const description = describeRule(policy);

        // Then the amount reads with the cents the currency has
        expect(description).toBe('Update amount to "$30.00"');
    });

    it('leaves out the cents of a currency that has none', () => {
        // Given the same rule on a workspace paying in a currency without a minor unit
        const policy = buildPolicy('JPY');

        // When the rules table describes it
        const description = describeRule(policy);

        // Then the amount reads without cents, matching what the rule's own editor shows. Formatting it through a
        // rate formatter used to force a minimum of two decimals whatever the currency.
        expect(description).toBe('Update amount to "¥30"');
    });
});
