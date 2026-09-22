import {act, render} from '@testing-library/react-native';

import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';

import {setMoneyRequestAmount, setMoneyRequestCurrency} from '@libs/actions/IOU/MoneyRequest';

import CONST from '@src/CONST';

import React from 'react';

type NumberWithSymbolFormProps = {
    onInputChange?: (value: string) => void;
};

type CurrencyModalProps = {
    onInputChange?: (currency: string) => void;
};

let mockNumberWithSymbolFormProps: NumberWithSymbolFormProps | undefined;
let mockCurrencyModalProps: CurrencyModalProps | undefined;
let mockTransactionSlice: {isAmountSet?: boolean; iouRequestType?: string} | undefined;
const mockOnSignDirtyChange = jest.fn();

jest.mock('@components/MoneyRequestConfirmationFields/context', () => ({
    useConfirmationFields: () => ({
        isEditingSplitBill: false,
        canEnterScanFieldsManually: false,
        isReadOnly: false,
        didConfirm: false,
        transactionID: 'transactionID',
        action: 'CREATE',
        iouType: 'SUBMIT',
        reportID: 'reportID',
        reportActionID: undefined,
        onSignDirtyChange: mockOnSignDirtyChange,
    }),
}));

jest.mock('@components/NumberWithSymbolForm', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return ReactModule.forwardRef((props: NumberWithSymbolFormProps) => {
        mockNumberWithSymbolFormProps = props;
        return null;
    });
});

jest.mock('@pages/iou/request/step/IOURequestStepCurrencyModal', () => (props: CurrencyModalProps) => {
    mockCurrencyModalProps = props;
    return null;
});

jest.mock('@components/MenuItemWithTopDescription', () => () => null);
jest.mock('@components/MoneyRequestConfirmationList/sections/AutomaticFieldHint', () => () => null);
jest.mock('@components/MoneyRequestConfirmationList/sections/selectors', () => ({amountSliceSelector: jest.fn()}));
jest.mock('@components/MoneyRequestConfirmationList/sections/useTransactionSelector', () => () => mockTransactionSlice);
jest.mock('@libs/Log', () => ({__esModule: true, default: {alert: jest.fn(), hmmm: jest.fn(), info: jest.fn(), warn: jest.fn()}}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, getCurrencySymbol: () => '$'})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    clearMoneyRequestAmount: jest.fn(),
    getMoneyRequestParticipantsFromReport: jest.fn(() => []),
    setMoneyRequestAmount: jest.fn(),
    setMoneyRequestCurrency: jest.fn(),
    setMoneyRequestTaxAmount: jest.fn(),
    setMoneyRequestTaxRate: jest.fn(),
}));
jest.mock('@libs/CurrencyUtils', () => ({
    convertToBackendAmount: (amount: number) => amount,
    convertToFrontendAmountAsString: (amount: number) => `${amount}`,
    getLocalizedCurrencySymbol: () => '$',
}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => true}));
jest.mock('@libs/IOUUtils', () => ({calculateAmount: jest.fn(), isMovingTransactionFromTrackExpense: () => false, isParticipantP2P: () => false}));
jest.mock('@libs/MoneyRequestUtils', () => ({isConfirmationAmountMissing: () => false}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@libs/ReportUtils', () => ({shouldEnableNegative: () => true}));
jest.mock('@libs/TransactionUtils', () => ({calculateTaxAmount: jest.fn(), getTaxCode: jest.fn(), getTaxValue: jest.fn(), hasAnyManuallyEnteredScanField: () => false}));
jest.mock('@userActions/IOU/Split', () => ({resetSplitShares: jest.fn(), setDraftSplitTransaction: jest.fn(), setSplitShares: jest.fn()}));

function renderAmountField(amount = 0) {
    return render(
        <AmountField
            amount={amount}
            formattedAmount={`${amount}`}
            iouCurrencyCode={CONST.CURRENCY.USD}
            isDistanceRequest={false}
            shouldShowTimeRequestFields={false}
            shouldDisplayFieldError={false}
            formError=""
            policy={undefined}
            clearFormErrors={jest.fn()}
            setFormError={jest.fn()}
        />,
    );
}

describe('AmountField', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNumberWithSymbolFormProps = undefined;
        mockCurrencyModalProps = undefined;
        mockTransactionSlice = {isAmountSet: false, iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL};
    });

    it('tracks sign-only changes and clears the sign state after deleting a negative amount back to a lone minus', () => {
        renderAmountField();

        act(() => mockNumberWithSymbolFormProps?.onInputChange?.('-'));
        act(() => mockNumberWithSymbolFormProps?.onInputChange?.('-5'));
        if (!mockTransactionSlice) {
            throw new Error('Expected a transaction slice');
        }
        mockTransactionSlice.isAmountSet = true;
        act(() => mockNumberWithSymbolFormProps?.onInputChange?.('-'));

        expect(mockOnSignDirtyChange).toHaveBeenNthCalledWith(1, true);
        expect(mockOnSignDirtyChange).toHaveBeenNthCalledWith(2, true);
        expect(mockOnSignDirtyChange).toHaveBeenNthCalledWith(3, false);
    });

    it('compares the current sign with a negative amount baseline', () => {
        mockTransactionSlice = {isAmountSet: true, iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL};
        renderAmountField(-5);

        act(() => mockNumberWithSymbolFormProps?.onInputChange?.('5'));
        act(() => mockNumberWithSymbolFormProps?.onInputChange?.('-5'));

        expect(mockOnSignDirtyChange).toHaveBeenNthCalledWith(1, true);
        expect(mockOnSignDirtyChange).toHaveBeenNthCalledWith(2, false);
    });

    it('updates only currency when the amount is empty, and persists the total when an amount is entered', () => {
        renderAmountField();

        act(() => mockCurrencyModalProps?.onInputChange?.(CONST.CURRENCY.USD));

        expect(setMoneyRequestCurrency).toHaveBeenCalledWith('transactionID', CONST.CURRENCY.USD);
        expect(setMoneyRequestAmount).not.toHaveBeenCalled();

        mockTransactionSlice = {isAmountSet: true, iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL};
        renderAmountField(5);

        act(() => mockCurrencyModalProps?.onInputChange?.(CONST.CURRENCY.CAD));

        expect(setMoneyRequestAmount).toHaveBeenCalledWith('transactionID', 5, CONST.CURRENCY.CAD);
    });
});
