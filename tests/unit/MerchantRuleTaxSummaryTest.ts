import {getMerchantRulesTableData} from '@libs/MerchantTypeRulesUtils';

import {getRuleDescription} from '@pages/workspace/rules/MerchantRulesSection';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Rule} from '@src/types/onyx';
import type {ExpenseDefaultTaxValue} from '@src/types/onyx/ExpenseDefaultRules';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const {FIELD, TRIGGER, ACTION} = CONST.RULES.EXPENSE_DEFAULT;
const TAX_KEY = 'id_TAX_RATE_1';

/** Mirrors the way the rules engine keys `triggers` and `actions` by a stringified index. */
function toIndexMap<T>(values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

/** A policy whose tax list either holds the rate the rule points at, or has not loaded it. */
const buildPolicy = (taxes?: Record<string, {name: string; value: string}>): Policy => ({
    ...createRandomPolicy(0),
    id: 'policy1',
    taxRates: {
        name: 'Tax',
        defaultExternalID: TAX_KEY,
        defaultValue: '10%',
        foreignTaxDefault: TAX_KEY,
        taxes: taxes ?? {},
    },
});

/**
 * The rule stores whatever the rate was called when it was saved. `savedTaxRate` omitted models a rule
 * saved before the policy's tax rates had loaded, which is when `buildTaxActionValue` writes no snapshot.
 */
const buildTaxRule = (savedTaxRate?: {name: string; value: string}): Rule => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const taxValue: ExpenseDefaultTaxValue = {field_id_TAX: {externalID: TAX_KEY, ...(savedTaxRate ?? {})}};

    return {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: 'policy1',
        triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
        filters: {left: FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Coffee Shop'},
        actions: toIndexMap([{name: ACTION.SET, field: FIELD.TAX, value: taxValue}]),
    };
};

const buildLabels = () => ({
    category: translateLocal('common.category').toLowerCase(),
    tag: translateLocal('common.tag').toLowerCase(),
    description: translateLocal('common.description').toLowerCase(),
    tax: translateLocal('common.tax').toLowerCase(),
    vendor: translateLocal('common.vendor').toLowerCase(),
});

describe('Merchant rule tax summary', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    const describeInTable = (policy: Policy, rule: Rule) =>
        getMerchantRulesTableData({
            policy,
            policyID: policy.id,
            rules: {[`${ONYXKEYS.COLLECTION.RULE}rule1`]: rule},
            translate: translateLocal,
            isOffline: false,
            onNavigate: () => {},
        }).at(0)?.ruleDescription;

    const describeInSection = (policy: Policy, rule: Rule) => getRuleDescription(rule, translateLocal, buildLabels(), policy, undefined);

    describe.each([
        ['Expense defaults table', describeInTable],
        ['legacy Merchant rules section', describeInSection],
    ])('%s', (_name, describeRule) => {
        it('prefers the live rate over the one captured when the rule was saved', () => {
            const policy = buildPolicy({[TAX_KEY]: {name: 'GST', value: '15%'}});

            expect(describeRule(policy, buildTaxRule({name: 'Old GST', value: '10%'}))).toContain('Update tax to "GST (15%)"');
        });

        it('falls back to the saved rate when the policy no longer lists it', () => {
            expect(describeRule(buildPolicy(), buildTaxRule({name: 'GST', value: '10%'}))).toContain('Update tax to "GST (10%)"');
        });

        it('falls back to the tax ID rather than dropping the default when there is no saved rate', () => {
            expect(describeRule(buildPolicy(), buildTaxRule())).toContain(`Update tax to "${TAX_KEY}"`);
        });
    });
});
