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
jest.mock('@components/MenuItemWithTopDescription', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({title, interactive = true}: {title?: string; interactive?: boolean}) => (
        <>
            <Text>{`Read-only amount: ${title ?? ''}`}</Text>
            {interactive && <Text>Opens amount page</Text>}
        </>
    );
});
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldRow', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({value, isInteractive = true}: {value?: string; isInteractive?: boolean}) => (
        <>
            <Text>{`Read-only amount: ${value ?? ''}`}</Text>
            {isInteractive && <Text>Opens amount page</Text>}
        </>
    );
});
let mockTransactionSlice: {transactionID: string; amount: number; currency: string; isAmountMissing: boolean; isAmountSet?: boolean; isScanning?: boolean} = {
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

describe('AmountField while the receipt is scanning', () => {
    beforeEach(() => {
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: false, isAmountSet: true, isScanning: true};
    });

    it('shows the scanning status instead of a zero amount when a tracked scan is moved to someone', () => {
        // Given a tracked scan expense moved to someone, whose receipt is still scanning and whose scan fields can't be entered inline
        // When the confirmation page renders its amount field
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.SUBMIT}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <AmountField
                    {...amountFieldProps}
                    formattedAmount="Scanning…"
                />
            </ConfirmationFieldsProvider>,
        );

        // Then the amount shows as the read-only row with the scanning status, since the editable input would show the receipt's placeholder zero amount
        expect(screen.getByText('Read-only amount: Scanning…')).toBeOnTheScreen();
        expect(screen.queryByText('Enter zero')).not.toBeOnTheScreen();
    });

    it('does not offer the scanning amount row as a control when a tracked scan is moved to someone', () => {
        // Given a tracked scan expense moved to someone, whose receipt is still scanning and whose scan fields can't be entered inline
        // When the confirmation page renders its amount field
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.SUBMIT}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <AmountField
                    {...amountFieldProps}
                    formattedAmount="Scanning…"
                />
            </ConfirmationFieldsProvider>,
        );

        // Then the row has no caret and no press, since SmartScan sets the amount and the user can't edit it until the scan finishes
        expect(screen.getByText('Read-only amount: Scanning…')).toBeOnTheScreen();
        expect(screen.queryByText('Opens amount page')).not.toBeOnTheScreen();
    });

    it('keeps the editable input on a fresh scan where the user can enter the amount instead of waiting for SmartScan', () => {
        // Given a fresh scan expense whose receipt is scanning and whose scan fields the user can enter themselves
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: false, isScanning: true};

        // When the confirmation page renders its amount field
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
                    formattedAmount="Scanning…"
                />
            </ConfirmationFieldsProvider>,
        );

        // Then the editable amount input stays, so the user can still type an amount inline
        expect(screen.getByText('Enter zero')).toBeOnTheScreen();
        expect(screen.queryByText('Read-only amount: Scanning…')).not.toBeOnTheScreen();
    });
});
