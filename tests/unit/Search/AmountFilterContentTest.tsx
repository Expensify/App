import {act, fireEvent, render, screen} from '@testing-library/react-native';

import CurrencyPicker from '@components/CurrencyPicker';
import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/CurrencyPicker', () => jest.fn(() => null));
jest.mock('@components/AmountWithoutCurrencyInput', () => jest.fn(() => null));
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => () => ({didScreenTransitionEnd: true}));
jest.mock('@hooks/useShouldFooterBeInsideList', () => () => false);

describe('AmountFilterContent currency selection', () => {
    it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT])('sends the selected currency for %s', (baseFilterKey) => {
        // Given a legacy bare amount opened in either supported filter.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={baseFilterKey}
                value={{EqualTo: '1200', GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );

        // When a currency is selected and the filter is confirmed.
        act(() => jest.mocked(CurrencyPicker).mock.calls.at(-1)?.[0].onInputChange?.('USD'));
        fireEvent.press(screen.getByRole('button'));

        // Then the existing form field carries major units and the currency, not hundredths with a suffix.
        expect(onChange).toHaveBeenCalledWith({[`${baseFilterKey}EqualTo`]: '12.00 USD', [`${baseFilterKey}GreaterThan`]: undefined, [`${baseFilterKey}LessThan`]: undefined});
    });

    it('clears the currency without changing the entered amount', () => {
        // Given a saved currency-qualified amount.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={{EqualTo: '12.00 USD', GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );

        // When the picker clears its selection and the filter is confirmed.
        expect(jest.mocked(CurrencyPicker).mock.calls.at(-1)?.[0].shouldAllowEmptySelection).toBe(true);
        act(() => jest.mocked(CurrencyPicker).mock.calls.at(-1)?.[0].onInputChange?.(''));
        fireEvent.press(screen.getByRole('button'));

        // Then the amount returns to the original bare hundredths format.
        expect(onChange).toHaveBeenCalledWith({amountEqualTo: '1200', amountGreaterThan: undefined, amountLessThan: undefined});
    });

    it('preserves the currency on each side of a between filter', () => {
        // Given two bounds saved in different comparison currencies.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT}
                value={{EqualTo: undefined, GreaterThan: '10.00 USD', LessThan: '20.00 GBP'}}
                onChange={onChange}
            />,
        );

        // When the range is reopened and confirmed without changes.
        fireEvent.press(screen.getByRole('button'));

        // Then neither bound inherits the other's currency or changes its numeric scale.
        expect(onChange).toHaveBeenCalledWith({purchaseAmountEqualTo: undefined, purchaseAmountGreaterThan: '10.00 USD', purchaseAmountLessThan: '20.00 GBP'});
    });

    it('does not offer currency selection for report totals', () => {
        // Given an amount-like filter that does not support FX comparisons.
        jest.mocked(CurrencyPicker).mockClear();

        // When its existing editor is rendered.
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL}
                value={{EqualTo: '1200', GreaterThan: undefined, LessThan: undefined}}
                onChange={jest.fn()}
            />,
        );

        // Then its UI does not gain a currency picker.
        expect(CurrencyPicker).not.toHaveBeenCalled();
    });
});
