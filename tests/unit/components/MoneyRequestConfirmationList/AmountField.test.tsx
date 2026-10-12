import {fireEvent, render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';

import {setMoneyRequestAmount, setMoneyRequestCurrency} from '@libs/actions/IOU/MoneyRequest';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/NumberWithSymbolForm', () => {
    const {Pressable, Text} =
        jest.requireActual<Record<'Pressable' | 'Text', React.ComponentType<{children?: React.ReactNode; onPress?: () => void; accessibilityRole?: 'button'}>>>('react-native');
    return ({onInputChange, errorText}: {onInputChange: (amount: string) => void; errorText?: string}) => (
        <>
            {!!errorText && <Text>{errorText}</Text>}
            <Pressable
                accessibilityRole="button"
                onPress={() => onInputChange('0')}
            >
                <Text>Enter zero</Text>
            </Pressable>
            <Pressable
                accessibilityRole="button"
                onPress={() => onInputChange('1')}
            >
                <Text>Enter one</Text>
            </Pressable>
        </>
    );
});
jest.mock('@pages/iou/request/step/IOURequestStepCurrencyModal', () => {
    const {Pressable, Text} =
        jest.requireActual<Record<'Pressable' | 'Text', React.ComponentType<{children?: React.ReactNode; onPress?: () => void; accessibilityRole?: 'button'}>>>('react-native');
    return ({onInputChange}: {onInputChange: (currency: string) => void}) => (
        <Pressable
            accessibilityRole="button"
            onPress={() => onInputChange('EUR')}
        >
            <Text>Pick EUR</Text>
        </Pressable>
    );
});
let mockTransactionSlice: {transactionID: string; amount: number; currency: string; isAmountMissing: boolean; isAmountSet?: boolean} = {
    transactionID: '1',
    amount: 0,
    currency: 'USD',
    isAmountMissing: false,
};
jest.mock('@components/MoneyRequestConfirmationList/sections/useTransactionSelector', () => () => mockTransactionSlice);
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, getCurrencySymbol: () => '$'})}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => true}));
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    getMoneyRequestParticipantsFromReport: () => [],
    setMoneyRequestAmount: jest.fn(),
    setMoneyRequestCurrency: jest.fn(),
    clearMoneyRequestAmount: jest.fn(),
}));
jest.mock('@userActions/IOU/Split', () => ({setDraftSplitTransaction: jest.fn()}));

const amountFieldProps: React.ComponentProps<typeof AmountField> = {
    amount: 0,
    formattedAmount: '',
    iouCurrencyCode: CONST.CURRENCY.USD,
    isDistanceRequest: false,
    shouldShowTimeRequestFields: false,
    shouldDisplayFieldError: false,
    formError: 'iou.error.invalidAmount',
    policy: undefined,
    clearFormErrors: jest.fn(),
    setFormError: jest.fn(),
};

describe('AmountField split-bill error clearing', () => {
    beforeEach(() => {
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: false};
    });

    it('shows the missing amount error for a failed split scan', () => {
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: true};

        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.EDIT}
                iouType={CONST.IOU.TYPE.SPLIT}
                isEditingSplitBill
            >
                <AmountField
                    {...amountFieldProps}
                    shouldDisplayFieldError
                    formError="iou.receiptScanningFailed"
                />
            </ConfirmationFieldsProvider>,
        );

        expect(screen.getByText('common.error.enterAmount')).toBeOnTheScreen();
    });

    it('does not show a missing amount error when the split amount is valid', () => {
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.EDIT}
                iouType={CONST.IOU.TYPE.SPLIT}
                isEditingSplitBill
            >
                <AmountField
                    {...amountFieldProps}
                    shouldDisplayFieldError
                    formError="iou.receiptScanningFailed"
                />
            </ConfirmationFieldsProvider>,
        );

        expect(screen.queryByText('common.error.enterAmount')).not.toBeOnTheScreen();
    });

    it('does not show the split missing amount error outside the field-error state', () => {
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: true};

        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <AmountField
                    {...amountFieldProps}
                    formError="iou.receiptScanningFailed"
                />
            </ConfirmationFieldsProvider>,
        );

        expect(screen.queryByText('common.error.enterAmount')).not.toBeOnTheScreen();
    });

    it('keeps the split amount error at zero and clears it when the amount becomes nonzero', () => {
        const clearFormErrors = jest.fn();
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.EDIT}
                iouType={CONST.IOU.TYPE.SPLIT}
                isEditingSplitBill
            >
                <AmountField
                    {...amountFieldProps}
                    clearFormErrors={clearFormErrors}
                />
            </ConfirmationFieldsProvider>,
        );

        fireEvent.press(screen.getByText('Enter zero'));
        expect(clearFormErrors).not.toHaveBeenCalledWith(expect.arrayContaining(['iou.error.invalidAmount']));

        fireEvent.press(screen.getByText('Enter one'));
        expect(clearFormErrors).toHaveBeenCalledWith(expect.arrayContaining(['iou.error.invalidAmount']));
    });

    it('does not clear a split-specific error outside split-bill editing', () => {
        const clearFormErrors = jest.fn();
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <AmountField
                    {...amountFieldProps}
                    clearFormErrors={clearFormErrors}
                />
            </ConfirmationFieldsProvider>,
        );

        fireEvent.press(screen.getByText('Enter one'));
        expect(clearFormErrors).toHaveBeenCalledWith(['common.error.invalidAmount']);
    });
});

describe('AmountField currency change', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: false};
    });

    it('only updates the currency on a scan whose amount is still left to SmartScan', () => {
        // Given a scan expense whose amount field is empty because SmartScan will fill it in
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                canEnterScanFieldsManually
            >
                <AmountField {...amountFieldProps} />
            </ConfirmationFieldsProvider>,
        );

        // When the user changes the currency without entering an amount
        fireEvent.press(screen.getByText('Pick EUR'));

        // Then only the currency is written, so isAmountSet stays unset and the scan isn't turned into a partially
        // entered manual expense that blocks creation until amount, merchant and date are all filled in
        expect(setMoneyRequestCurrency).toHaveBeenCalledWith('1', 'EUR');
        expect(setMoneyRequestAmount).not.toHaveBeenCalled();
    });

    it('keeps the entered amount when the currency changes after the user set one', () => {
        // Given a scan expense where the user has already entered an amount themselves
        mockTransactionSlice = {transactionID: '1', amount: 1000, currency: 'USD', isAmountMissing: false, isAmountSet: true};
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                canEnterScanFieldsManually
            >
                <AmountField
                    {...amountFieldProps}
                    amount={1000}
                />
            </ConfirmationFieldsProvider>,
        );

        // When the user changes the currency
        fireEvent.press(screen.getByText('Pick EUR'));

        // Then the entered amount is saved together with the new currency, since the amount is the user's own
        expect(setMoneyRequestAmount).toHaveBeenCalledWith('1', 1000, 'EUR');
        expect(setMoneyRequestCurrency).not.toHaveBeenCalled();
    });
});
