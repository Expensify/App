import {formatAmountFilterValue, getAmountFilterDisplayValue, getAmountFilterInputValue, parseAmountFilterValue, supportsAmountFilterCurrency} from '@libs/SearchAmountFilterUtils';

import CONST from '@src/CONST';

describe('SearchAmountFilterUtils', () => {
    it.each([
        {amount: '12', currency: undefined, expected: '1200'},
        {amount: '12', currency: 'USD', expected: '12.00 USD'},
        {amount: '11.99', currency: 'GBP', expected: '11.99 GBP'},
        {amount: '-0.5', currency: 'EUR', expected: '-0.50 EUR'},
        {amount: '0', currency: 'JPY', expected: '0.00 JPY'},
        {amount: '12.50', currency: '', expected: '1250'},
        {amount: '0.10', currency: '', expected: '10'},
        {amount: '', currency: 'USD', expected: ''},
    ])('serializes $amount with currency $currency as $expected', ({amount, currency, expected}) => {
        // Given an amount entered in major units and an optional comparison currency.
        // When the editor prepares the operand for its filter form.
        const value = formatAmountFilterValue(amount, currency);

        // Then qualified operands use decimal major units, while bare operands remain hundredths.
        expect(value).toBe(expected);
    });

    it.each([
        {value: '1250', amount: '12.50', currency: undefined},
        {value: '10', amount: '0.10', currency: undefined},
        {value: '11.99 GBP', amount: '11.99', currency: 'GBP'},
        {value: '-0.50 EUR', amount: '-0.50', currency: 'EUR'},
        {value: '0.00 JPY', amount: '0.00', currency: 'JPY'},
    ])('reopens $value without changing its units', ({value, amount, currency}) => {
        // Given a saved legacy or currency-qualified operand.
        // When the editor reopens it.
        const input = getAmountFilterInputValue(value);

        // Then both the visible amount and currency survive another save.
        expect(input).toEqual({amount, ...(currency ? {currency} : {})});
        expect(formatAmountFilterValue(input.amount, input.currency)).toBe(value);
    });

    it('formats the number in the local locale without dropping its currency', () => {
        // Given a qualified operand and a formatter that expects hundredths.
        const formatAmount = jest.fn((amount: number) => (amount / 100).toFixed(2).replace('.', ','));

        // When its filter label is formatted.
        const label = getAmountFilterDisplayValue('11.99 GBP', formatAmount);

        // Then the amount is localized once and the comparison currency stays visible.
        expect(formatAmount).toHaveBeenCalledWith(1199);
        expect(label).toBe('11,99 GBP');
    });

    it('only offers FX currencies for amount and purchase amount', () => {
        // Given every amount-like search field.
        const keys = CONST.SEARCH.SYNTAX_FILTER_KEYS;

        // When checking whether to show its currency picker.
        const supported = [keys.AMOUNT, keys.PURCHASE_AMOUNT, keys.TOTAL, keys.AMOUNT_DEBITED, keys.AMOUNT_REIMBURSED].filter(supportsAmountFilterCurrency);

        // Then report totals and reimbursement fields keep their existing behavior.
        expect(supported).toEqual([keys.AMOUNT, keys.PURCHASE_AMOUNT]);
    });

    it('does not reinterpret malformed qualified amounts as numeric input', () => {
        // Given a value whose currency or amount does not follow the backend contract.
        const value = '12.001 USD';

        // When parsing it for validation.
        const parsed = parseAmountFilterValue(value);

        // Then the full invalid value remains available to the existing amount validator.
        expect(parsed).toEqual({amount: value});
    });
});
