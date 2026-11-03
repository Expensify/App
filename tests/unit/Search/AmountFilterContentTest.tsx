import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import AmountFilterInput from '@components/Search/FilterComponents/AmountFilterInput';
import AmountPopup from '@components/Search/FilterDropdowns/AmountPopup';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';

import useAmountFilterCurrency from '@hooks/useAmountFilterCurrency';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';

import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import React from 'react';

import createMock from '../../utils/createMock';

jest.mock('@components/NumberWithSymbolForm', () => jest.fn(() => null));
jest.mock('@pages/iou/request/step/IOURequestStepCurrencyModal', () => jest.fn(() => null));
jest.mock('@components/Search/FilterDropdowns/BasePopup', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/AmountWithoutCurrencyInput', () => jest.fn(() => null));
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => () => ({didScreenTransitionEnd: true}));
jest.mock('@hooks/useShouldFooterBeInsideList', () => () => false);
jest.mock('@hooks/useDefaultExpensePolicy', () => jest.fn(() => undefined));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'en'}));

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useDefaultExpensePolicy).mockReturnValue(undefined);
});

describe('AmountFilterContent currency selection', () => {
    it.each(['Greater than ', 'Less than '])('trims the %s label in the currency button name', (label) => {
        // Given a range label whose translation leaves space for an optional amount.
        render(
            <AmountFilterInput
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                amount="12.00"
                currency="USD"
                label={label}
                onAmountChange={jest.fn()}
                onCurrencyChange={jest.fn()}
            />,
        );

        // When the currency button's accessible name combines the label with its selected currency.
        const props = jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0];

        // Then no trailing translation space remains before the spoken separator.
        expect(props?.currencyButtonAccessibilityLabel).toBe(`${label.trim()}, common.selectCurrency, USD`);
    });

    it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT])('sends the selected currency for %s', (baseFilterKey) => {
        // Given a legacy bare amount in a workspace whose default currency is GBP.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'GBP'}));
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={baseFilterKey}
                value={{EqualTo: '1200', GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );

        // When the money-request currency button opens its picker and a currency is selected.
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0]).toMatchObject({value: '12.00', currency: '', shouldShowCurrencyButton: true, allowNegativeInput: true});
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

    it.each([
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, policyCurrency: 'GBP', expectedCurrency: 'GBP'},
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT, policyCurrency: 'EUR', expectedCurrency: 'EUR'},
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, policyCurrency: undefined, expectedCurrency: 'USD'},
    ])('defaults a new $baseFilterKey operand to $expectedCurrency', ({baseFilterKey, policyCurrency, expectedCurrency}) => {
        // Given a new operand and an optional default expense policy.
        if (policyCurrency) {
            jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: policyCurrency}));
        }
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={baseFilterKey}
                value={{EqualTo: undefined, GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );

        // When an amount is entered and confirmed without manually choosing a currency.
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].currency).toBe(expectedCurrency);
        act(() => jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].onInputChange?.('12.00'));
        fireEvent.press(screen.getByRole('button'));

        // Then the displayed default is also included in the submitted operand.
        expect(onChange).toHaveBeenCalledWith({
            [`${baseFilterKey}EqualTo`]: `12.00 ${expectedCurrency}`,
            [`${baseFilterKey}GreaterThan`]: undefined,
            [`${baseFilterKey}LessThan`]: undefined,
        });
    });

    it('keeps saved currency-less amounts currency-less when a default policy exists', () => {
        // Given a legacy operand and a GBP workspace default.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'GBP'}));
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={{EqualTo: '1200', GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );

        // When the existing filter is reopened and confirmed without changes.
        fireEvent.press(screen.getByRole('button'));

        // Then the default does not retroactively enable FX for the saved filter.
        expect(onChange).toHaveBeenCalledWith({amountEqualTo: '1200', amountGreaterThan: undefined, amountLessThan: undefined});
    });

    it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT])('shows Any after selecting Any currency for %s', (baseFilterKey) => {
        // Given a saved currency-qualified amount and a GBP workspace default.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'GBP'}));
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={baseFilterKey}
                value={{EqualTo: '0.10 USD', GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );

        // When Any currency is selected and the filter is confirmed.
        expect(jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].shouldAllowEmptySelection).toBe(true);
        act(() => jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].onInputChange?.(''));
        fireEvent.press(screen.getByRole('button'));

        // Then the button uses Any, its accessibility label keeps Any currency, and the amount returns to bare hundredths.
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0]).toMatchObject({
            value: '0.10',
            currency: '',
            currencyButtonLabel: 'common.any',
        });
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].currencyButtonAccessibilityLabel).toContain('common.anyCurrency');
        expect(onChange).toHaveBeenCalledWith({[`${baseFilterKey}EqualTo`]: '10', [`${baseFilterKey}GreaterThan`]: undefined, [`${baseFilterKey}LessThan`]: undefined});
    });

    it('keeps the saved operand when the currency picker is dismissed', () => {
        // Given an existing USD amount and a different workspace default.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'GBP'}));
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

    it('defaults both new range bounds to the policy currency', () => {
        // Given an empty filter and a GBP default expense policy.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'GBP'}));
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT}
                value={{EqualTo: undefined, GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );
        jest.mocked(NumberWithSymbolForm).mockClear();

        // When a new Between filter is entered without selecting either currency.
        fireEvent.press(screen.getByTestId('base-list-item-Between'), {nativeEvent: {}});
        const bounds = jest.mocked(NumberWithSymbolForm).mock.calls.slice(-2);
        expect(bounds.map(([props]) => props.currency)).toEqual(['GBP', 'GBP']);
        act(() => {
            bounds.at(0)?.[0].onInputChange?.('10');
            bounds.at(1)?.[0].onInputChange?.('20');
        });
        fireEvent.press(screen.getByRole('button'));

        // Then both submitted bounds include the workspace currency.
        expect(onChange).toHaveBeenCalledWith({purchaseAmountEqualTo: undefined, purchaseAmountGreaterThan: '10.00 GBP', purchaseAmountLessThan: '20.00 GBP'});
    });

    it('preserves the currency on each side of a between filter', () => {
        // Given two saved currencies that differ from the policy default.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'EUR'}));
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

    it('selects Any currency for one range bound without changing the other', () => {
        // Given a saved range whose bounds have different currencies.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={{EqualTo: undefined, GreaterThan: '0.10 USD', LessThan: '20.00 GBP'}}
                onChange={onChange}
            />,
        );

        // When only the lower bound switches to Any currency.
        const [lowerBoundPicker] = jest.mocked(IOURequestStepCurrencyModal).mock.calls;
        act(() => lowerBoundPicker?.[0].onInputChange?.(''));
        fireEvent.press(screen.getByRole('button'));

        // Then the lower bound uses legacy hundredths and the upper bound retains GBP.
        expect(onChange).toHaveBeenCalledWith({amountEqualTo: undefined, amountGreaterThan: '10', amountLessThan: '20.00 GBP'});
    });

    it('does not offer currency selection for report totals', () => {
        // Given a GBP policy and an amount-like filter that does not support FX comparisons.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'GBP'}));
        const onChange = jest.fn();

        // When its existing editor is rendered.
        render(
            <AmountFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL}
                value={{EqualTo: '1200', GreaterThan: undefined, LessThan: undefined}}
                onChange={onChange}
            />,
        );

        // Then its UI does not gain a currency picker.
        expect(IOURequestStepCurrencyModal).not.toHaveBeenCalled();
        expect(NumberWithSymbolForm).not.toHaveBeenCalled();
        fireEvent.press(screen.getByRole('button'));
        expect(onChange).toHaveBeenCalledWith({totalEqualTo: '1200', totalGreaterThan: undefined, totalLessThan: undefined});
    });
});

describe('AmountPopup currency selection', () => {
    it('submits the default policy currency for a new quick filter', () => {
        // Given a new purchase-amount filter and a GBP default expense policy.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'GBP'}));
        const updateFilterForm = jest.fn();
        render(
            <AmountPopup
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT}
                label="Purchase amount"
                value={{EqualTo: undefined, GreaterThan: undefined, LessThan: undefined}}
                updateFilterForm={updateFilterForm}
                closeOverlay={jest.fn()}
            />,
        );
        const [equalTo] = screen.getAllByRole('button');
        if (!equalTo) {
            throw new Error('Expected amount comparison options');
        }

        // When an amount is entered and both popup steps are applied without choosing a currency.
        fireEvent.press(equalTo, {nativeEvent: {}});
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].currency).toBe('GBP');
        act(() => jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].onInputChange?.('11.99'));
        act(() => jest.mocked(BasePopup).mock.calls.at(-1)?.[0].onApply());
        act(() => jest.mocked(BasePopup).mock.calls.at(-1)?.[0].onApply());

        // Then the default currency is serialized, not just displayed by the picker.
        expect(updateFilterForm).toHaveBeenCalledWith({purchaseAmountEqualTo: '11.99 GBP', purchaseAmountGreaterThan: '', purchaseAmountLessThan: ''});
    });

    it.each([
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, currency: 'USD', expected: '12.00 USD'},
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT, currency: 'USD', expected: '12.00 USD'},
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, currency: '', expected: '1200'},
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT, currency: '', expected: '1200'},
    ])('uses the money-request picker for the $baseFilterKey popup with currency "$currency"', ({baseFilterKey, currency, expected}) => {
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

        // When the shared picker selects a currency or Any currency and both popup steps are applied.
        fireEvent.press(equalTo, {nativeEvent: {}});
        act(() => jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].onCurrencyButtonPress?.());
        expect(jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].isPickerVisible).toBe(true);
        act(() => jest.mocked(IOURequestStepCurrencyModal).mock.calls.at(-1)?.[0].onInputChange?.(currency));
        act(() => jest.mocked(BasePopup).mock.calls.at(-1)?.[0].onApply());
        act(() => jest.mocked(BasePopup).mock.calls.at(-1)?.[0].onApply());

        // Then quick filters use the compact currency label and preserve the format used by advanced filters.
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.at(-1)?.[0].currencyButtonLabel).toBe(currency || 'common.any');
        expect(updateFilterForm).toHaveBeenCalledWith({[`${baseFilterKey}EqualTo`]: expected, [`${baseFilterKey}GreaterThan`]: '', [`${baseFilterKey}LessThan`]: ''});
    });
});

describe('Amount filter currency defaults', () => {
    it('follows policy defaults without overwriting saved or explicit currencies', () => {
        // Given a new filter while its default policy has not loaded yet.
        let savedValue: string | undefined;
        const {result, rerender} = renderHook(() => useAmountFilterCurrency(CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, savedValue));
        expect(result.current.currency).toBe('USD');

        // When policy data arrives, then the untouched default follows it.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'GBP'}));
        rerender(undefined);
        expect(result.current.currency).toBe('GBP');

        // When the default is saved, then it stays part of that operand even if the workspace changes later.
        savedValue = '12.00 GBP';
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'EUR'}));
        rerender(undefined);
        expect(result.current.currency).toBe('GBP');

        // When Any currency is chosen, then later policy updates do not re-enable FX.
        act(() => result.current.setCurrency(''));
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'USD'}));
        rerender(undefined);
        expect(result.current.currency).toBe('');

        // When another currency is explicitly chosen, then it also takes precedence over policy updates.
        act(() => result.current.setCurrency('JPY'));
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'EUR'}));
        rerender(undefined);
        expect(result.current.currency).toBe('JPY');
    });
});
