import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import AmountField from '@components/MoneyRequestConfirmationList/sections/AmountField';
import ExpenseFormLayoutContext from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import type {NumberWithSymbolFormProps} from '@components/NumberWithSymbolForm';

import {setMoneyRequestAmount, setMoneyRequestCurrency} from '@libs/actions/IOU/MoneyRequest';

import type IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import {setDraftSplitTransaction} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import type {IOURequestType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {View} from 'react-native';

import React, {createRef} from 'react';

const mockFocusAmountInput = jest.fn();
let mockIsScreenFocused = true;
let mockCanUseTouchScreen = true;
let mockCurrentRouteName: string | undefined;
let mockOnScreenBlur: (() => void) | undefined;
let mockCurrencyButtonRef: NumberWithSymbolFormProps['currencyButtonRef'];
let mockLauncherRef: React.ComponentProps<typeof IOURequestStepCurrencyModal>['launcherRef'];
let mockOnyxValues: Record<string, unknown> = {};
jest.mock('@components/NumberWithSymbolForm', () => {
    const {Pressable, Text} =
        jest.requireActual<Record<'Pressable' | 'Text', React.ComponentType<{children?: React.ReactNode; onPress?: () => void; accessibilityRole?: 'button'}>>>('react-native');
    const {useImperativeHandle} = jest.requireActual<typeof React>('react');
    return ({
        onInputChange,
        errorText,
        currencyButtonRef,
        ref,
    }: {
        onInputChange: (amount: string) => void;
        errorText?: string;
        currencyButtonRef?: NumberWithSymbolFormProps['currencyButtonRef'];
        ref?: React.Ref<{focus: () => void}>;
    }) => {
        useImperativeHandle(ref, () => ({focus: mockFocusAmountInput}));
        mockCurrencyButtonRef = currencyButtonRef;
        return (
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
                <Pressable
                    accessibilityRole="button"
                    onPress={() => onInputChange('-')}
                >
                    <Text>Enter sign</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => onInputChange('')}
                >
                    <Text>Clear amount</Text>
                </Pressable>
            </>
        );
    };
});
jest.mock('@pages/iou/request/step/IOURequestStepCurrencyModal', () => {
    const {Pressable, Text} =
        jest.requireActual<Record<'Pressable' | 'Text', React.ComponentType<{children?: React.ReactNode; onPress?: () => void; accessibilityRole?: 'button'}>>>('react-native');
    return ({onInputChange, launcherRef}: {onInputChange: (currency: string) => void; launcherRef?: React.ComponentProps<typeof IOURequestStepCurrencyModal>['launcherRef']}) => {
        mockLauncherRef = launcherRef;
        return (
            <>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => onInputChange('EUR')}
                >
                    <Text>Pick EUR</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => onInputChange('USD')}
                >
                    <Text>Pick USD</Text>
                </Pressable>
            </>
        );
    };
});
jest.mock('@components/MenuItem', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return {
        __esModule: true,
        default: {
            Root: ({children, onPress}: {children?: React.ReactNode; onPress?: () => void}) => (
                <>
                    {children}
                    {!!onPress && <Text>Opens amount page</Text>}
                </>
            ),
            Row: ({children}: {children?: React.ReactNode}) => children,
            Content: ({children}: {children?: React.ReactNode}) => children,
            Trailing: ({children}: {children?: React.ReactNode}) => children,
            FieldName: Text,
            FieldValue: ({children}: {children?: string}) => <Text>{`Read-only amount: ${children ?? ''}`}</Text>,
            Chevron: () => null,
            BrickRoadIndicator: () => null,
            HelpText: ({message}: {message: string}) => <Text>{message}</Text>,
        },
    };
});
jest.mock('@components/DropdownFieldRow', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({value, isInteractive = true, errorText}: {value?: string; isInteractive?: boolean; errorText?: string}) => (
        <>
            <Text>{`Read-only amount: ${value ?? ''}`}</Text>
            {isInteractive && <Text>Opens amount page</Text>}
            {!!errorText && <Text>{errorText}</Text>}
        </>
    );
});
type MockTransactionSlice = {transactionID: string; amount: number; currency: string; isAmountMissing: boolean; isAmountSet?: boolean; isScanning?: boolean; iouRequestType?: IOURequestType};
let mockTransactionSlice: MockTransactionSlice = {
    transactionID: '1',
    amount: 0,
    currency: 'USD',
    isAmountMissing: false,
};
jest.mock('@components/MoneyRequestConfirmationList/sections/useTransactionSelector', () => () => mockTransactionSlice);
jest.mock('@hooks/useOnyx', () => (key: string) => [mockOnyxValues[key]]);
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => mockIsScreenFocused,
    useNavigation: () => ({
        addListener: (_event: string, callback: () => void) => {
            mockOnScreenBlur = callback;
            return () => {};
        },
    }),
}));
jest.mock('@libs/Navigation/navigationRef', () => ({getCurrentRoute: () => (mockCurrentRouteName ? {name: mockCurrentRouteName} : undefined)}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, getCurrencySymbol: () => '$'})}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => mockCanUseTouchScreen}));
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
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
    fieldError: undefined,
    policy: undefined,
};

describe('AmountField split-bill amount errors', () => {
    beforeEach(() => {
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: false};
        mockOnyxValues = {};
    });

    it('shows the missing amount error for a failed split scan', () => {
        // Given a split being edited whose failed scan left the amount missing, with the split's missing-field errors shown
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: true};

        // When the field renders
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
                />
            </ConfirmationFieldsProvider>,
        );

        // Then it asks for the amount, since the scan didn't fill it in
        expect(screen.getByText('common.error.enterAmount')).toBeOnTheScreen();
    });

    it('does not show a missing amount error when the split amount is valid', () => {
        // Given a split being edited whose amount is set, with the split's missing-field errors shown
        // When the field renders
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
                />
            </ConfirmationFieldsProvider>,
        );

        // Then it asks for nothing, because only a missing amount gets that error
        expect(screen.queryByText('common.error.enterAmount')).not.toBeOnTheScreen();
    });

    it('does not show the split missing amount error outside the field-error state', () => {
        // Given a new expense with no amount, which isn't a split being edited, so the split's missing-field errors are off
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: true};

        // When the field renders
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <AmountField {...amountFieldProps} />
            </ConfirmationFieldsProvider>,
        );

        // Then it asks for nothing yet, since a new expense's missing amount only shows once a confirm is blocked
        expect(screen.queryByText('common.error.enterAmount')).not.toBeOnTheScreen();
    });

    it('shows the amount error a blocked save revealed on an edited split', () => {
        // Given a split being edited whose save was blocked by its $0 amount, after the user already typed an amount, so the missing-field state is off
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
                    fieldError="common.error.enterAmount"
                />
            </ConfirmationFieldsProvider>,
        );

        // When the field renders
        // Then it shows that error under the input, the same message the field shows for a missing amount before any save
        expect(screen.getByText('common.error.enterAmount')).toBeOnTheScreen();
    });

    it('seeds a split draft from the saved transaction when no split draft exists yet', () => {
        // Given a split being edited whose split draft has not been created yet, so the saved transaction is the base
        const transaction = {transactionID: '1', amount: 0, currency: 'USD'};
        mockOnyxValues = {[`${ONYXKEYS.COLLECTION.TRANSACTION}1`]: transaction};

        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.EDIT}
                iouType={CONST.IOU.TYPE.SPLIT}
                isEditingSplitBill
            >
                <AmountField {...amountFieldProps} />
            </ConfirmationFieldsProvider>,
        );

        // When the amount changes
        fireEvent.press(screen.getByText('Enter one'));

        // Then the split draft is seeded from the saved transaction instead of being cleared with a null merge
        expect(setDraftSplitTransaction).toHaveBeenCalledWith(
            expect.any(Function),
            '1',
            transaction,
            expect.objectContaining({amount: 100, currency: 'USD'}),
            expect.any(Function),
            expect.any(Function),
        );
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

describe('AmountField refocus on return', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: false};
        mockIsScreenFocused = true;
        mockCanUseTouchScreen = false;
        mockCurrentRouteName = undefined;
    });

    afterEach(() => {
        mockCanUseTouchScreen = true;
        jest.useRealTimers();
    });

    it.each([
        ['focuses the amount again after picking a participant', SCREENS.MONEY_REQUEST.DYNAMIC_STEP_PARTICIPANTS, 1],
        ["leaves focus on the edited row after another field's page", SCREENS.MONEY_REQUEST.DYNAMIC_STEP_CATEGORY, 0],
    ])('%s', (_description, leftForScreen, expectedFocusCalls) => {
        // Given a manual expense on a device without a touch screen, whose amount took focus when the confirmation opened
        const renderAmountField = () => (
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <AmountField {...amountFieldProps} />
            </ConfirmationFieldsProvider>
        );
        const {rerender} = render(renderAmountField());
        act(() => {
            jest.runAllTimers();
        });
        expect(mockFocusAmountInput).toHaveBeenCalledTimes(1);
        mockFocusAmountInput.mockClear();

        // When the user leaves the confirmation for another page and comes back to it
        mockCurrentRouteName = leftForScreen;
        mockIsScreenFocused = false;
        act(() => {
            mockOnScreenBlur?.();
        });
        rerender(renderAmountField());
        mockIsScreenFocused = true;
        rerender(renderAmountField());
        act(() => {
            jest.runAllTimers();
        });

        // Then only the participants page refocuses the amount, and other pages leave focus on the edited row
        expect(mockFocusAmountInput).toHaveBeenCalledTimes(expectedFocusCalls);
    });
});

describe('AmountField currency picker focus return', () => {
    beforeEach(() => {
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: false};
        mockCurrencyButtonRef = undefined;
        mockLauncherRef = undefined;
    });

    it('hands the currency button ref to the picker so focus returns to the button on close', () => {
        // Given a manual expense whose amount field shows the currency button
        // When the amount field renders
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <AmountField {...amountFieldProps} />
            </ConfirmationFieldsProvider>,
        );

        // Then the picker gets the same ref the currency button is attached to, so closing the picker returns keyboard
        // focus to that button instead of dropping the user at the top of the form
        expect(mockLauncherRef).toBeDefined();
        expect(mockLauncherRef).toBe(mockCurrencyButtonRef);
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

    it.each([
        ['push row', false],
        ['bordered row', true],
    ])('shows the amount error a blocked save revealed on the %s of a split edited while its receipt is scanning', (_layout, shouldUseDropdownRows) => {
        // Given a split being edited whose receipt is still scanning, so its amount is a read-only row, and whose save was blocked by its $0 amount
        const fieldViewRefs = {amount: createRef<View>(), merchant: createRef<View>(), date: createRef<View>(), taxAmount: createRef<View>(), attendees: createRef<View>()};

        // When the field renders
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.EDIT}
                iouType={CONST.IOU.TYPE.SPLIT}
                isEditingSplitBill
                fieldViewRefs={fieldViewRefs}
            >
                <ExpenseFormLayoutContext.Provider value={{shouldUseDropdownRows}}>
                    <AmountField
                        {...amountFieldProps}
                        formattedAmount="Scanning…"
                        fieldError="common.error.enterAmount"
                    />
                </ExpenseFormLayoutContext.Provider>
            </ConfirmationFieldsProvider>,
        );

        // Then the row shows the error and holds the amount ref, so the blocked save scrolls to a message instead of doing nothing visible
        expect(screen.getByText('Read-only amount: Scanning…')).toBeOnTheScreen();
        expect(screen.getByText('common.error.enterAmount')).toBeOnTheScreen();
        expect(fieldViewRefs.amount.current).not.toBeNull();
    });
});

describe('AmountField unsaved input reporting', () => {
    const onUnsavedAmountInputChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnyxValues = {};
        mockTransactionSlice = {transactionID: '1', amount: 0, currency: 'USD', isAmountMissing: false, iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL};
    });

    function renderManualAmountField(amount = 0) {
        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                onUnsavedAmountInputChange={onUnsavedAmountInputChange}
            >
                <AmountField
                    {...amountFieldProps}
                    amount={amount}
                />
            </ConfirmationFieldsProvider>,
        );
    }

    it('reports a sign typed into an empty amount, which the draft does not keep', () => {
        // Given a new manual expense, whose amount field is empty
        renderManualAmountField();

        // When the user enters only the minus sign
        fireEvent.press(screen.getByText('Enter sign'));

        // Then the field reports unsaved input, because a sign without digits leaves no amount in the draft
        expect(onUnsavedAmountInputChange).toHaveBeenLastCalledWith(true);
    });

    it('stops reporting unsaved input once the sign is removed', () => {
        // Given a new manual expense where the user entered only the minus sign
        renderManualAmountField();
        fireEvent.press(screen.getByText('Enter sign'));

        // When the user removes the sign again
        fireEvent.press(screen.getByText('Clear amount'));

        // Then nothing is left to discard, so leaving the form shouldn't ask
        expect(onUnsavedAmountInputChange).toHaveBeenLastCalledWith(false);
    });

    it('does not report the sign left after deleting the digits of an entered amount', () => {
        // Given a manual expense where the user entered a negative amount
        mockTransactionSlice = {transactionID: '1', amount: -100, currency: 'USD', isAmountMissing: false, isAmountSet: true, iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL};
        renderManualAmountField(-100);

        // When the user deletes the digits and only the sign is left
        fireEvent.press(screen.getByText('Enter sign'));

        // Then nothing is reported, because clearing the amount empties the field and the sign goes with it
        expect(onUnsavedAmountInputChange).toHaveBeenLastCalledWith(false);
    });

    it('reports a currency the user picked until they pick the original one back', () => {
        // Given a new manual expense in USD with an empty amount
        renderManualAmountField();

        // When the user picks another currency
        fireEvent.press(screen.getByText('Pick EUR'));

        // Then the field reports unsaved input, because the draft can't tell the user's pick from the currency the flow set
        expect(onUnsavedAmountInputChange).toHaveBeenLastCalledWith(true);

        // When the user picks the original currency back
        fireEvent.press(screen.getByText('Pick USD'));

        // Then nothing is left to discard
        expect(onUnsavedAmountInputChange).toHaveBeenLastCalledWith(false);
    });
});
