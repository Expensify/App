import {getExpenseDefaultConditionText} from '@libs/MerchantTypeRulesUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy} from '@src/types/onyx';
import type {RuleFilterNode} from '@src/types/onyx/RuleFilters';

import createRandomPolicy from '../utils/collections/policies';
import {convertToDisplayString, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;
const {AND, EQUAL_TO, NOT_EQUAL_TO, GREATER_THAN, LOWER_THAN, RANGE} = CONST.SEARCH.SYNTAX_OPERATORS;
const FILTER = CONST.SEARCH.SYNTAX_FILTER_KEYS;

const TAX_RATE_KEY = 'id_VAT';

const policy: Policy = {
    ...createRandomPolicy(0),
    id: 'policy1',
    outputCurrency: CONST.CURRENCY.USD,
    taxRates: {
        name: 'Tax',
        defaultExternalID: TAX_RATE_KEY,
        defaultValue: '5%',
        foreignTaxDefault: TAX_RATE_KEY,
        taxes: {[TAX_RATE_KEY]: {name: 'VAT', value: '20%', code: 'id_TAX_RATE_1'}},
    },
};

const SUBMITTER_ACCOUNT_ID = '12345';
const CARD_ID = '88888';
const conditionNames = {submitters: {[SUBMITTER_ACCOUNT_ID]: 'Alice Smith'}, cards: {[CARD_ID]: 'Visa ending 1234'}};

const getConditionText = (filters: RuleFilterNode) => getExpenseDefaultConditionText(filters, translateLocal, convertToDisplayString, false, policy, conditionNames);

describe('Expense default condition text', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    it.each([
        ['a currency', {left: FILTER.CURRENCY, operator: EQUAL_TO, right: ['GBP', 'EUR']}, 'Currency is "GBP, EUR"'],
        ['a tax rate by its name rather than its ID', {left: FILTER.TAX_RATE, operator: EQUAL_TO, right: [TAX_RATE_KEY]}, 'Tax rate is "VAT (20%)"'],
        ['a submitter by name rather than account ID', {left: FILTER.FROM, operator: EQUAL_TO, right: [SUBMITTER_ACCOUNT_ID]}, 'Submitter is "Alice Smith"'],
        ['a card by its description rather than card ID', {left: FILTER.CARD_ID, operator: EQUAL_TO, right: [CARD_ID]}, 'Card is "Visa ending 1234"'],
        ['a merchant type by its label', {left: 'merchantType', operator: EQUAL_TO, right: ['airlines']}, 'Merchant type is "Airlines"'],
        ['a reimbursable expense', {left: FILTER.REIMBURSABLE, operator: EQUAL_TO, right: 'yes'}, 'Reimbursable is "Yes"'],
        ['a non-billable expense', {left: FILTER.BILLABLE, operator: EQUAL_TO, right: 'no'}, 'Billable is "No"'],
        ['a date on a day', {left: FILTER.DATE, operator: EQUAL_TO, right: '2026-01-15'}, 'Date is on 2026-01-15'],
        ['a date after a day', {left: FILTER.DATE, operator: GREATER_THAN, right: '2026-01-15'}, 'Date is after 2026-01-15'],
        ['an amount over a value', {left: FILTER.AMOUNT, operator: GREATER_THAN, right: '3000'}, 'Amount is greater than $30.00'],
        ['an amount under a value', {left: FILTER.AMOUNT, operator: LOWER_THAN, right: '3000'}, 'Amount is less than $30.00'],
        ['a part the expense carries', {left: FILTER.HAS, operator: EQUAL_TO, right: ['receipt']}, 'Has "Receipt"'],
        ['a part the expense lacks', {left: FILTER.HAS, operator: NOT_EQUAL_TO, right: ['receipt']}, `Doesn't have "Receipt"`],
    ])('words a rule matching on %s', (_conditionName, filters, expected) => {
        // Given a rule matching on one field the table has no column of its own for
        // When the row's condition text is built
        // Then the field is named with its own values rather than left out of the sentence
        expect(getConditionText(filters as RuleFilterNode)).toBe(expected);
    });

    it('reads every condition a rule carries as one sentence', () => {
        // Given a rule matching on a category and an amount
        const filters: RuleFilterNode = {
            operator: AND,
            left: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Meals'},
            right: {left: FILTER.AMOUNT, operator: GREATER_THAN, right: '3000'},
        };

        // When the row's condition text is built
        // Then the amount is spelled out too, rather than the row reading as a plain category rule
        expect(getConditionText(filters)).toBe('Category is "Meals" and Amount is greater than $30.00');
    });

    it('leaves out a comparison it has no wording for rather than blanking the row', () => {
        // Given a rule pairing a category with an amount range, which the editor cannot express either
        const filters: RuleFilterNode = {
            operator: AND,
            left: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Meals'},
            right: {left: FILTER.AMOUNT, operator: RANGE, right: '3000'},
        };

        // When the row's condition text is built
        // Then the category still reads, because a clause the table cannot word drops on its own
        expect(getConditionText(filters)).toBe('Category is "Meals"');
    });

    it.each([
        ['a currency', FILTER.CURRENCY, ['USD']],
        ['a card', FILTER.CARD_ID, [CARD_ID]],
        ['a tax rate', FILTER.TAX_RATE, [TAX_RATE_KEY]],
        ['a submitter', FILTER.FROM, [SUBMITTER_ACCOUNT_ID]],
        ['a merchant type', 'merchantType', ['airlines']],
        ['a reimbursable flag', FILTER.REIMBURSABLE, ['yes']],
    ])('leaves out %s matched on with an operator the editor cannot express', (_conditionName, field, values) => {
        // Given a rule excluding a value rather than requiring it, which the editor keeps read-only
        const filters: RuleFilterNode = {
            operator: AND,
            left: {left: FIELD.CATEGORY, operator: EQUAL_TO, right: 'Meals'},
            right: {left: field, operator: NOT_EQUAL_TO, right: values},
        };

        // When the row's condition text is built
        // Then only the category reads, rather than the clause claiming the rule requires what it excludes
        expect(getConditionText(filters)).toBe('Category is "Meals"');
    });

    it('falls back to the stored ID when a member has left the workspace', () => {
        // Given a rule matching on someone who is no longer listed
        const filters: RuleFilterNode = {left: FILTER.FROM, operator: EQUAL_TO, right: ['99999']};

        // When the row's condition text is built
        // Then the row still shows the rule matches on someone rather than dropping the condition
        expect(getConditionText(filters)).toBe('Submitter is "99999"');
    });
});
