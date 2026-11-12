import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import AmountFilterInput from '@components/Search/FilterComponents/AmountFilterInput';
import AmountPopup from '@components/Search/FilterDropdowns/AmountPopup';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useAmountFilterCurrency from '@hooks/useAmountFilterCurrency';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';

import type * as CurrencyUtils from '@libs/CurrencyUtils';

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
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useCurrencyList', () => {
    const {convertToDisplayStringWithoutCurrencyForLocale} = jest.requireActual<typeof CurrencyUtils>('@libs/CurrencyUtils');
    const getCurrencyDecimals = (currency?: string) => (currency === 'JPY' || currency === 'VND' ? 0 : 2);

    return {
        useCurrencyListActions: () => ({
            getCurrencyDecimals,
            convertToDisplayStringWithoutCurrency: (amount: number, currency?: string) => convertToDisplayStringWithoutCurrencyForLocale('en', amount, currency, getCurrencyDecimals),
        }),
    };
});

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useDefaultExpensePolicy).mockReturnValue(undefined);
});

describe('AmountFilterContent currency selection', () => {
    it.each([
        {EqualTo: '5000', GreaterThanOrEqualTo: '4000', LessThanOrEqualTo: undefined},
        {EqualTo: '5000', GreaterThanOrEqualTo: undefined, LessThanOrEqualTo: '6000'},
        {EqualTo: '5000', GreaterThanOrEqualTo: '4000', LessThanOrEqualTo: '6000'},
    ])('preserves equality alongside inclusive bounds when confirming $GreaterThanOrEqualTo / $LessThanOrEqualTo', (value) => {
        // Given a raw query combines equality with an inclusive comparison or range.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={value}
                onChange={onChange}
            />,
        );

        // When the user confirms the selected comparison without changes.
        fireEvent.press(screen.getByRole('button'));

        // Then equality remains active so the confirmation cannot broaden the search.
        expect(onChange).toHaveBeenCalledWith({
            amountEqualTo: value.EqualTo,
            amountGreaterThan: undefined,
            amountLessThan: undefined,
            amountGreaterThanOrEqualTo: value.GreaterThanOrEqualTo,
            amountLessThanOrEqualTo: value.LessThanOrEqualTo,
        });
    });

    it('clears equality and inclusive bounds when choosing a replacement comparison', () => {
        // Given a raw query combines equality with an inclusive lower bound.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={{EqualTo: '5000', GreaterThanOrEqualTo: '4000'}}
                onChange={onChange}
            />,
        );

        // When the user replaces the active comparison with a strict lower bound.
        fireEvent.press(screen.getByTestId('base-list-item-GreaterThan'), {nativeEvent: {}});
        act(() => jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0].onInputChange?.('60'));
        fireEvent.press(screen.getByRole('button'));

        // Then the replacement does not retain hidden constraints from the original query.
        expect(onChange).toHaveBeenCalledWith({
            amountEqualTo: undefined,
            amountGreaterThan: '60.00 USD',
            amountLessThan: undefined,
            amountGreaterThanOrEqualTo: undefined,
            amountLessThanOrEqualTo: undefined,
        });
    });

    it('retains both operators when a raw query constrains the same side twice', () => {
        // Given the strict bound is stronger than the inclusive bound selected by the editor.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={{GreaterThan: '6000', GreaterThanOrEqualTo: '5000'}}
                onChange={onChange}
            />,
        );

        // When the user confirms without changing either constraint.
        fireEvent.press(screen.getByRole('button'));

        // Then reopening the filter cannot broaden the result set from over 60 to at least 50.
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({amountGreaterThan: '6000', amountGreaterThanOrEqualTo: '5000'}));
    });

    it('keeps inclusive range operators and currencies when confirming Between', () => {
        // Given NL parsing supplied an inclusive AUD range rather than the editor's strict range.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={{GreaterThanOrEqualTo: '50.00 AUD', LessThanOrEqualTo: '100.00 AUD'}}
                onChange={onChange}
            />,
        );

        // When the lower bound is edited and the existing Between selection is confirmed.
        const [lowerBound, upperBound] = screen.UNSAFE_getAllByType(AmountFilterInput);
        expect(lowerBound?.props).toMatchObject({amount: '50.00', currency: 'AUD', label: 'search.filters.amount.greaterThanOrEqualTo'});
        expect(upperBound?.props).toMatchObject({amount: '100.00', currency: 'AUD', label: 'search.filters.amount.lessThanOrEqualTo'});
        act(() => jest.mocked(NumberWithSymbolForm).mock.calls.at(-2)?.[0].onInputChange?.('60'));
        fireEvent.press(screen.getByRole('button'));

        // Then editing does not silently exclude the original endpoints or enable strict comparisons.
        expect(onChange).toHaveBeenCalledWith({
            amountEqualTo: undefined,
            amountGreaterThan: undefined,
            amountLessThan: undefined,
            amountGreaterThanOrEqualTo: '60.00 AUD',
            amountLessThanOrEqualTo: '100.00 AUD',
        });
    });

    it('clears inclusive bounds when switching to Equal to', () => {
        // Given an inclusive range must not remain active behind a replacement amount filter.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                value={{GreaterThanOrEqualTo: '50.00 AUD', LessThanOrEqualTo: '100.00 AUD'}}
                onChange={onChange}
            />,
        );

        // When Equal to replaces Between.
        fireEvent.press(screen.getByTestId('base-list-item-EqualTo'), {nativeEvent: {}});
        act(() => jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0].onInputChange?.('75'));
        fireEvent.press(screen.getByRole('button'));

        // Then both inclusive operands are explicitly removed from the merged form.
        expect(onChange).toHaveBeenCalledWith({
            amountEqualTo: '75.00 USD',
            amountGreaterThan: undefined,
            amountLessThan: undefined,
            amountGreaterThanOrEqualTo: undefined,
            amountLessThanOrEqualTo: undefined,
        });
    });

    it('stacks Between inputs vertically on desktop', () => {
        // Given a saved range rendered with desktop layout and real theme styles.
        render(
            <ThemeStylesProvider>
                <AmountFilterContent
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                    value={{EqualTo: undefined, GreaterThan: '10.00 USD', LessThan: '20.00 GBP'}}
                    onChange={jest.fn()}
                />
            </ThemeStylesProvider>,
        );

        // When both range inputs are displayed.
        const [lowerBound, upperBound] = screen.UNSAFE_getAllByType(AmountFilterInput);

        // Then they share a vertical container rather than splitting its width.
        expect(lowerBound?.parent).toBe(upperBound?.parent);
        expect(lowerBound?.parent).toHaveStyle({flexDirection: 'column'});
    });

    it.each([
        {currency: 'JPY', decimals: 0},
        {currency: 'VND', decimals: 0},
        {currency: 'USD', decimals: 2},
        {currency: '', decimals: 2},
        {currency: undefined, decimals: 2},
    ])('uses $decimals decimal places with currency "$currency"', ({currency, decimals}) => {
        // Given a selected currency or a currency-less amount filter.
        render(
            <AmountFilterInput
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                amount="12"
                currency={currency}
                label="Amount"
                onAmountChange={jest.fn()}
                onCurrencyChange={jest.fn()}
            />,
        );

        // When the filter configures the shared number input.
        const props = jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0];

        // Then validation uses the currency precision, or two places for Any currency.
        expect(props?.decimals).toBe(decimals);
    });

    it('updates precision when switching between zero-decimal and Any currency', () => {
        // Given a saved USD amount that allows fractional input.
        render(
            <AmountFilterContent
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT}
                value={{EqualTo: '12.34 USD', GreaterThan: undefined, LessThan: undefined}}
                onChange={jest.fn()}
            />,
        );
        expect(jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0].decimals).toBe(2);

        // When JPY is selected.
        act(() => jest.mocked(IOURequestStepCurrencyModal).mock.lastCall?.[0].onInputChange?.('JPY'));

        // Then the shared input receives zero precision to reject fractions.
        expect(jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0]).toMatchObject({currency: 'JPY', decimals: 0});

        // When Any currency is selected.
        act(() => jest.mocked(IOURequestStepCurrencyModal).mock.lastCall?.[0].onInputChange?.(''));

        // Then two-decimal precision becomes available again.
        expect(jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0]).toMatchObject({currency: '', decimals: 2});
    });

    it.each([
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, label: 'Greater than ', amount: ''},
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, label: 'Less than ', amount: '12.00'},
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT, label: 'Greater than ', amount: ''},
        {baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT, label: 'Less than ', amount: '12.00'},
    ])('keeps $baseFilterKey input and button names in sync with currency for $label', ({baseFilterKey, label, amount}) => {
        // Given a range label whose translation leaves space for an optional amount
        const renderInput = (currency?: string) => (
            <AmountFilterInput
                baseFilterKey={baseFilterKey}
                amount={amount}
                currency={currency}
                label={label}
                onAmountChange={jest.fn()}
                onCurrencyChange={jest.fn()}
            />
        );
        const {rerender} = render(renderInput('USD'));

        // When currency is selected, removed, or restored without remounting the input
        for (const currency of ['USD', '', undefined, 'AED']) {
            rerender(renderInput(currency));

            // Then each independently focused control includes currency context without changing the amount
            const currencyName = currency || 'common.anyCurrency';
            expect(jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0]).toMatchObject({
                accessibilityLabel: `${label.trim()}, ${currencyName}`,
                currencyButtonAccessibilityLabel: `${label.trim()}, common.selectCurrency, ${currencyName}`,
                value: amount,
            });
        }
    });

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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
        // Given saved range currencies with different precisions and a different policy default.
        jest.mocked(useDefaultExpensePolicy).mockReturnValue(createMock<Policy>({outputCurrency: 'EUR'}));
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT}
                value={{EqualTo: undefined, GreaterThan: '10.00 JPY', LessThan: '20.00 GBP'}}
                onChange={onChange}
            />,
        );

        // When the range is reopened and confirmed without changes.
        expect(jest.mocked(NumberWithSymbolForm).mock.calls.map(([{currency, decimals}]) => ({currency, decimals}))).toEqual([
            {currency: 'JPY', decimals: 0},
            {currency: 'GBP', decimals: 2},
        ]);
        fireEvent.press(screen.getByRole('button'));

        // Then neither bound inherits the other's currency or changes its numeric scale.
        expect(onChange).toHaveBeenCalledWith({purchaseAmountEqualTo: undefined, purchaseAmountGreaterThan: '10.00 JPY', purchaseAmountLessThan: '20.00 GBP'});
    });

    it('selects Any currency for one range bound without changing the other', () => {
        // Given a saved range whose bounds have different currencies.
        const onChange = jest.fn();
        render(
            <AmountFilterContent
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
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
    it('preserves both same-side constraints when applying an active chip comparison', () => {
        // Given a raw query includes a stricter comparison alongside the inclusive operand.
        const updateFilterForm = jest.fn();
        render(
            <AmountPopup
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                label="Amount"
                value={{GreaterThan: '6000', GreaterThanOrEqualTo: '5000'}}
                updateFilterForm={updateFilterForm}
                closeOverlay={jest.fn()}
            />,
        );

        // When the existing inclusive comparison is opened and both popup steps are applied unchanged.
        fireEvent.press(screen.getByText('search.filters.amount.greaterThanOrEqualTo'), {nativeEvent: {}});
        act(() => jest.mocked(BasePopup).mock.lastCall?.[0].onApply());
        act(() => jest.mocked(BasePopup).mock.lastCall?.[0].onApply());

        // Then confirming the chip cannot broaden the search by dropping the strict bound.
        expect(updateFilterForm).toHaveBeenCalledWith(expect.objectContaining({amountGreaterThan: '6000', amountGreaterThanOrEqualTo: '5000'}));
    });

    it('edits an inclusive chip bound without changing its operator or the other bound', () => {
        // Given the chip popup opens an inclusive range produced by Describe your search.
        const updateFilterForm = jest.fn();
        const closeOverlay = jest.fn();
        render(
            <AmountPopup
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                label="Amount"
                value={{GreaterThanOrEqualTo: '50.00 AUD', LessThanOrEqualTo: '100.00 AUD'}}
                updateFilterForm={updateFilterForm}
                closeOverlay={closeOverlay}
            />,
        );

        // When the inclusive lower bound is edited and both popup steps are applied.
        fireEvent.press(screen.getByText('search.filters.amount.greaterThanOrEqualTo'), {nativeEvent: {}});
        act(() => jest.mocked(NumberWithSymbolForm).mock.lastCall?.[0].onInputChange?.('60'));
        act(() => jest.mocked(BasePopup).mock.lastCall?.[0].onApply());
        act(() => jest.mocked(BasePopup).mock.lastCall?.[0].onApply());

        // Then the popup submits both inclusive operands and closes normally.
        expect(updateFilterForm).toHaveBeenCalledWith({
            amountEqualTo: '',
            amountGreaterThan: undefined,
            amountLessThan: undefined,
            amountGreaterThanOrEqualTo: '60.00 AUD',
            amountLessThanOrEqualTo: '100.00 AUD',
        });
        expect(closeOverlay).toHaveBeenCalled();
    });

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
