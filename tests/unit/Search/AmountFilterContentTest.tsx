import {act, fireEvent, render, screen} from '@testing-library/react-native';

import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import AmountPopup from '@components/Search/FilterDropdowns/AmountPopup';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';

import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/NumberWithSymbolForm', () => jest.fn(() => null));
jest.mock('@pages/iou/request/step/IOURequestStepCurrencyModal', () => jest.fn(() => null));
jest.mock('@components/Search/FilterDropdowns/BasePopup', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/AmountWithoutCurrencyInput', () => jest.fn(() => null));
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => () => ({didScreenTransitionEnd: true}));
jest.mock('@hooks/useShouldFooterBeInsideList', () => () => false);

beforeEach(() => jest.clearAllMocks());

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

        // When the money-request currency button opens its picker and a currency is selected.
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0]).toMatchObject({value: '12.00', shouldShowCurrencyButton: true, allowNegativeInput: true});
        act(() => jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].onCurrencyButtonPress?.());
        expect(jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].isPickerVisible).toBe(true);
        act(() => {
            jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].onInputChange?.('USD');
            jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].hidePickerModal();
        });
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
        expect(jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].shouldAllowEmptySelection).toBe(true);
        act(() => jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].onInputChange?.(''));
        fireEvent.press(screen.getByRole('button'));

        // Then the amount returns to the original bare hundredths format.
        expect(onChange).toHaveBeenCalledWith({amountEqualTo: '1200', amountGreaterThan: undefined, amountLessThan: undefined});
    });

    it('keeps the saved operand when the currency picker is dismissed', () => {
        // Given an existing USD amount in the filter editor.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={{EqualTo: '12.00 USD', GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );

        // When the shared picker opens and closes without a selection.
        act(() => jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].onCurrencyButtonPress?.());
        act(() => jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].hidePickerModal());
        fireEvent.press(screen.getByRole('button'));

        // Then neither the amount nor its comparison currency changes.
        expect(jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].isPickerVisible).toBe(false);
        expect(onChange).toHaveBeenCalledWith({amountEqualTo: '12.00 USD', amountGreaterThan: undefined, amountLessThan: undefined});
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
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.map(([props]) => props.currency)).toEqual(['USD', 'GBP']);
        fireEvent.press(screen.getByRole('button'));

        // Then neither bound inherits the other's currency or changes its numeric scale.
        expect(onChange).toHaveBeenCalledWith({purchaseAmountEqualTo: undefined, purchaseAmountGreaterThan: '10.00 USD', purchaseAmountLessThan: '20.00 GBP'});
    });

    it('does not offer currency selection for report totals', () => {
        // Given an amount-like filter that does not support FX comparisons.

        // When its existing editor is rendered.
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL}
                value={{EqualTo: '1200', GreaterThan: undefined, LessThan: undefined}}
                onChange={jest.fn()}
            />,
        );

        // Then its UI does not gain a currency picker.
        expect(IOURequestStepCurrencyModal).not.toHaveBeenCalled();
        expect(NumberWithSymbolForm).not.toHaveBeenCalled();
    });
});

describe('AmountPopup currency selection', () => {
    it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT])('uses the money-request picker for the %s popup', (baseFilterKey) => {
        // Given a quick filter popup holding a bare amount.
        const updateFilterForm = jest.fn();
        render(
            <AmountPopup
                baseFilterKey={baseFilterKey}
                label="Amount"
                value={{EqualTo: '1200', GreaterThan: undefined, LessThan: undefined}}
                updateFilterForm={updateFilterForm}
                closeOverlay={jest.fn()}
            />,
        );
        const [equalTo] = screen.getAllByRole('button');
        if (!equalTo) {
            throw new Error('Expected amount comparison options');
        }

        // When the equal-to editor selects USD using the shared picker and both popup steps are applied.
        fireEvent.press(equalTo, {nativeEvent: {}});
        act(() => jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].onCurrencyButtonPress?.());
        expect(jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].isPickerVisible).toBe(true);
        act(() => jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].onInputChange?.('USD'));
        act(() => jest.mocked(BasePopup).mock.calls.at(-1)?.[0].onApply());
        act(() => jest.mocked(BasePopup).mock.calls.at(-1)?.[0].onApply());

        // Then quick filters use the same decimal-major-unit operand as advanced filters.
        expect(updateFilterForm).toHaveBeenCalledWith({[`${baseFilterKey}EqualTo`]: '12.00 USD', [`${baseFilterKey}GreaterThan`]: '', [`${baseFilterKey}LessThan`]: ''});
    });
});
