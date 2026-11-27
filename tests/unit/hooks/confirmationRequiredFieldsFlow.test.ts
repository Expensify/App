import {act, renderHook} from '@testing-library/react-native';

import buildConfirmAction from '@components/MoneyRequestConfirmationList/confirmAction';
import useConfirmationFieldErrors from '@components/MoneyRequestConfirmationList/hooks/useConfirmationFieldErrors';
import useConfirmationValidation from '@components/MoneyRequestConfirmationList/hooks/useConfirmationValidation';
import useFormErrorManagement from '@components/MoneyRequestConfirmationList/hooks/useFormErrorManagement';

import {isConfirmationMerchantRequired} from '@libs/MoneyRequestUtils';
import {getMerchant} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import type * as ReactNavigationModule from '@react-navigation/native';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2})}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), getActiveRoute: () => '/'}));
jest.mock('@userActions/Policy/Policy', () => ({hasInvoicingDetails: jest.fn(() => true)}));
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<typeof ReactNavigationModule>('@react-navigation/native');
    return {...actual, useIsFocused: () => mockIsFocused};
});

const WORKSPACE_PARTICIPANT = {accountID: 0, isPolicyExpenseChat: true, policyID: 'policy1'} as Participant;
const CURRENT_USER = {accountID: 1} as CurrentUserPersonalDetails;
const mockOnConfirm = jest.fn();
const mockOnRevealField = jest.fn();

// A manual expense to a workspace, as the draft starts: no amount entered and the "Expense" placeholder as its merchant
const blankDraft: OnyxTypes.Transaction = {
    transactionID: 'txn1',
    reportID: 'report1',
    amount: 0,
    currency: 'USD',
    merchant: CONST.TRANSACTION.DEFAULT_MERCHANT,
    created: '2026-11-05',
    comment: {},
    iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
    isAmountSet: false,
    isMerchantSet: false,
    participants: [WORKSPACE_PARTICIPANT],
};

/** Wires the form error, validation, field error and confirm pieces together the way `useConfirmationListData` does, on a workspace that tracks tax. */
function useManualWorkspaceConfirmation(
    transaction: OnyxTypes.Transaction,
    {isTaxAmountEmpty = false, siblingTransactions}: {isTaxAmountEmpty?: boolean; siblingTransactions?: OnyxTypes.Transaction[]} = {},
) {
    const iouMerchant = getMerchant(transaction);
    const isMerchantRequired = isConfirmationMerchantRequired({isPolicyExpenseChat: true, isScanRequest: false, isEditingSplitBill: false, shouldShowMerchant: true});
    const {formError, setConfirmError, clearConfirmError, errorMessage} = useFormErrorManagement({
        transaction,
        transactionReport: undefined,
        iouCategory: '',
        iouAttendees: [],
        policy: undefined,
        policyTags: undefined,
        policyCategories: undefined,
        currentUserPersonalDetails: CURRENT_USER,
        isEditingSplitBill: false,
        hasSmartScanFailed: false,
        didConfirmSplit: false,
        routeError: undefined,
        isTypeSplit: false,
        shouldShowReadOnlySplits: true,
        isDistanceRequest: false,
    });
    const {validate, fieldErrors, siblingFieldErrors} = useConfirmationValidation({
        transaction,
        transactionReport: undefined,
        transactionID: transaction.transactionID,
        iouType: CONST.IOU.TYPE.SUBMIT,
        iouAmount: transaction.amount,
        iouMerchant,
        iouCategory: '',
        iouCurrencyCode: 'USD',
        iouAttendees: [],
        policy: undefined,
        policyTags: undefined,
        policyTagLists: [],
        policyCategories: undefined,
        selectedParticipants: [WORKSPACE_PARTICIPANT],
        currentUserPersonalDetails: CURRENT_USER,
        isEditingSplitBill: false,
        isMerchantRequired,
        shouldShowTax: true,
        isDistanceRequest: false,
        isDistanceRequestWithPendingRoute: false,
        isPerDiemRequest: false,
        isMovingTransactionFromTrackExpense: false,
        isTimeRequest: false,
        routeError: undefined,
        canEnterScanFieldsManually: false,
        isPolicyExpenseChat: true,
        isReadOnly: false,
        shouldShowDate: true,
        isTaxAmountEmpty,
        siblingTransactions,
    });
    const {visibleFieldErrors, revealFieldErrors} = useConfirmationFieldErrors({
        transactionID: transaction.transactionID,
        fieldErrors,
        siblingFieldErrors,
        onSwitchToTransaction: undefined,
        onRevealField: mockOnRevealField,
    });
    const confirm = buildConfirmAction({
        iouType: CONST.IOU.TYPE.SUBMIT,
        policy: undefined,
        transactionID: transaction.transactionID,
        routeError: undefined,
        formError,
        isDelegateAccessRestricted: false,
        validate,
        setConfirmError,
        clearConfirmError,
        revealFieldErrors,
        setDidConfirmSplit: jest.fn(),
        showDelegateNoAccessModal: jest.fn(),
        onConfirm: mockOnConfirm,
    });

    return {confirm, visibleFieldErrors, footerErrorMessage: errorMessage};
}

describe('required fields on a manual workspace expense', () => {
    beforeEach(() => {
        mockOnConfirm.mockClear();
        mockOnRevealField.mockClear();
        mockIsFocused = true;
    });

    it('keeps the errors shown when the user leaves the page and comes back without filling anything in', () => {
        // Given a blocked confirm on a manual workspace expense with neither an amount nor a merchant
        const {result, rerender} = renderHook((transaction: OnyxTypes.Transaction) => useManualWorkspaceConfirmation(transaction), {initialProps: blankDraft});
        act(() => result.current.confirm());

        // When the user opens another page, such as the category picker, and comes back, which clears the form error
        mockIsFocused = false;
        rerender(blankDraft);
        mockIsFocused = true;
        rerender(blankDraft);

        // Then both fields are still flagged, since they are still blank
        expect(result.current.visibleFieldErrors).toEqual({amount: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'});
    });

    it('does not let the tax error of a removed expense block the one left on screen', () => {
        // Given a confirmation of several expenses where Create was blocked by the empty tax amount of the one on screen
        const expenseWithEmptyTax = {...blankDraft, amount: 2500, isAmountSet: true, merchant: 'Hilton', isMerchantSet: true};
        const {result, rerender} = renderHook(
            ({transaction, isTaxAmountEmpty}: {transaction: OnyxTypes.Transaction; isTaxAmountEmpty: boolean}) => useManualWorkspaceConfirmation(transaction, {isTaxAmountEmpty}),
            {
                initialProps: {transaction: expenseWithEmptyTax, isTaxAmountEmpty: true},
            },
        );
        act(() => result.current.confirm());
        expect(result.current.footerErrorMessage).toBe('iou.error.invalidAmount');

        // When the user removes that expense, and Create on the one left is blocked by its blank merchant
        const remainingExpense = {...expenseWithEmptyTax, transactionID: 'txn2', merchant: CONST.TRANSACTION.DEFAULT_MERCHANT, isMerchantSet: false};
        rerender({transaction: remainingExpense, isTaxAmountEmpty: false});
        act(() => result.current.confirm());

        // Then only the blank merchant explains the block, and the removed expense's tax error is gone from the footer
        expect(result.current.visibleFieldErrors).toEqual({merchant: 'common.error.fieldRequired'});
        expect(result.current.footerErrorMessage).toBeUndefined();

        // When the user fills in the merchant and presses Create again
        rerender({transaction: {...remainingExpense, merchant: 'Office Depot', isMerchantSet: true}, isTaxAmountEmpty: false});
        act(() => result.current.confirm());

        // Then the expense is confirmed, since the tax error belonged to the expense that was removed
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('does not submit from a valid expense while another expense still holds an invalid value', () => {
        // Given a confirmation of two expenses where Create was blocked by a typed merchant that isn't allowed
        const invalidExpense: OnyxTypes.Transaction = {...blankDraft, amount: 2500, isAmountSet: true, merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, isMerchantSet: true};
        const validExpense: OnyxTypes.Transaction = {...invalidExpense, transactionID: 'txn2', merchant: 'Hilton'};
        const {result, rerender} = renderHook(
            ({transaction, siblingTransactions}: {transaction: OnyxTypes.Transaction; siblingTransactions: OnyxTypes.Transaction[]}) =>
                useManualWorkspaceConfirmation(transaction, {siblingTransactions}),
            {initialProps: {transaction: invalidExpense, siblingTransactions: [validExpense]}},
        );
        act(() => result.current.confirm());
        expect(result.current.visibleFieldErrors).toEqual({merchant: 'iou.error.invalidMerchant'});

        // When the user pages to the valid expense and presses Create there
        rerender({transaction: validExpense, siblingTransactions: [invalidExpense]});
        mockOnRevealField.mockClear();
        act(() => result.current.confirm());

        // Then nothing is submitted, and the invalid merchant of the other expense is the field brought into view, since Create submits both expenses
        expect(mockOnConfirm).not.toHaveBeenCalled();
        expect(mockOnRevealField).toHaveBeenCalledWith('merchant', invalidExpense.transactionID);

        // When the other expense's merchant is fixed and the user presses Create
        rerender({transaction: validExpense, siblingTransactions: [{...invalidExpense, merchant: 'Office Depot'}]});
        act(() => result.current.confirm());

        // Then both expenses are confirmed
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
});
