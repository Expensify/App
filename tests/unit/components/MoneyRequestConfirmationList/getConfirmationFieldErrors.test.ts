import type {GetConfirmationFieldErrorsParams} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import getConfirmationFieldErrors, {NO_FIELD_ERRORS} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

const WORKSPACE_PARTICIPANT = {accountID: 0, isPolicyExpenseChat: true, policyID: 'policy1'} as Participant;
const P2P_PARTICIPANT = {accountID: 2, isPolicyExpenseChat: false} as Participant;

const baseParams: GetConfirmationFieldErrorsParams = {
    iouAmount: 1000,
    iouType: CONST.IOU.TYPE.SUBMIT,
    iouMerchant: 'Coffee Shop',
    canEnterScanFieldsManually: false,
    isPolicyExpenseChat: true,
    shouldShowDate: true,
    isReadOnly: false,
    isEditingSplitBill: false,
    isMerchantRequired: true,
    isDistanceRequest: false,
    isTimeRequest: false,
    currentUserAccountID: 1,
};

// A merchant that still holds the "Expense" placeholder the draft was seeded with
const blankRequiredMerchantParams: Partial<GetConfirmationFieldErrorsParams> = {
    iouMerchant: CONST.TRANSACTION.DEFAULT_MERCHANT,
};

function createManualTransaction(overrides: Partial<OnyxTypes.Transaction> = {}): OnyxTypes.Transaction {
    return {
        transactionID: 'txn1',
        reportID: 'report1',
        amount: 1000,
        currency: 'USD',
        merchant: 'Coffee Shop',
        created: '2026-11-05',
        comment: {},
        iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        isAmountSet: true,
        isMerchantSet: true,
        participants: [WORKSPACE_PARTICIPANT],
        ...overrides,
    };
}

function createScanDraft(overrides: Partial<OnyxTypes.Transaction> = {}): OnyxTypes.Transaction {
    return createManualTransaction({
        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
        amount: 0,
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        isAmountSet: false,
        isMerchantSet: false,
        isCreatedSet: false,
        ...overrides,
    });
}

const scanParams: Partial<GetConfirmationFieldErrorsParams> = {
    canEnterScanFieldsManually: true,
    isMerchantRequired: false,
    iouAmount: 0,
    iouMerchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
};

describe('getConfirmationFieldErrors', () => {
    it('returns the shared empty map when every field is filled in', () => {
        // Given a manual workspace expense with an amount, a merchant and a date
        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(createManualTransaction(), baseParams);

        // Then nothing is reported, and the shared empty map comes back so the footer's error state keeps its identity
        expect(fieldErrors).toBe(NO_FIELD_ERRORS);
    });

    it('flags both the amount and a blank required merchant on a manual workspace expense', () => {
        // Given a manual workspace expense with neither an amount nor a merchant
        const transaction = createManualTransaction({amount: 0, isAmountSet: false, merchant: CONST.TRANSACTION.DEFAULT_MERCHANT, isMerchantSet: false});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, ...blankRequiredMerchantParams, iouAmount: 0});

        // Then both fields read as required, so the summary above the button applies to each of them
        expect(fieldErrors).toEqual({amount: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'});
    });

    it('keeps the blank required merchant flagged once only the amount is filled in', () => {
        // Given a manual workspace expense whose amount was entered after a blocked confirm, while the merchant is still blank
        const transaction = createManualTransaction({merchant: CONST.TRANSACTION.DEFAULT_MERCHANT, isMerchantSet: false});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, ...blankRequiredMerchantParams});

        // Then the merchant is still reported as missing, rather than the error going away with the amount's
        expect(fieldErrors).toEqual({merchant: 'common.error.fieldRequired'});
    });

    it('reports a required merchant the user typed but that is not allowed as invalid, not missing', () => {
        // Given a workspace expense whose typed merchant fails validation
        const transaction = createManualTransaction({merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, isMerchantSet: true});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, iouMerchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT});

        // Then the merchant asks for a valid value instead of saying the field is required
        expect(fieldErrors).toEqual({merchant: 'iou.error.invalidMerchant'});
    });

    it.each([
        ['the "(none)" placeholder the split was seeded with', CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, undefined, 'common.error.fieldRequired'],
        ['a merchant the user cleared', '', false, 'common.error.fieldRequired'],
        ['the "(none)" placeholder the user typed', CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, true, 'iou.error.invalidMerchant'],
    ] as const)('reports %s on an edited split the same way as on a new expense', (_case, merchant, isMerchantSet, expectedError) => {
        // Given a workspace split being edited with this merchant
        const transaction = createManualTransaction({merchant, isMerchantSet});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {
            ...baseParams,
            iouType: CONST.IOU.TYPE.SPLIT,
            iouMerchant: merchant,
            isEditingSplitBill: true,
        });

        // Then a merchant the field shows as blank reads as required, and only one the user typed reads as invalid
        expect(fieldErrors).toEqual({merchant: expectedError});
    });

    it('flags a placeholder value the user typed into an optional merchant', () => {
        // Given an expense to a user, whose merchant is optional, where the user typed the "Expense" placeholder themselves
        const transaction = createManualTransaction({merchant: CONST.TRANSACTION.DEFAULT_MERCHANT, isMerchantSet: true, participants: [P2P_PARTICIPANT]});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {
            ...baseParams,
            iouMerchant: CONST.TRANSACTION.DEFAULT_MERCHANT,
            isPolicyExpenseChat: false,
            isMerchantRequired: false,
        });

        // Then the merchant is invalid, since a typed placeholder is an entry the user made rather than a blank field
        expect(fieldErrors).toEqual({merchant: 'iou.error.invalidMerchant'});
    });

    it('drops the merchant error once the recipient changes from a workspace chat to a user', () => {
        // Given an untouched manual draft that still carries the placeholder merchant
        const transaction = createManualTransaction({merchant: CONST.TRANSACTION.DEFAULT_MERCHANT, isMerchantSet: false, participants: [P2P_PARTICIPANT]});

        // When the recipient is a user, so the merchant is no longer required
        const fieldErrors = getConfirmationFieldErrors(transaction, {
            ...baseParams,
            ...blankRequiredMerchantParams,
            isPolicyExpenseChat: false,
            isMerchantRequired: false,
        });

        // Then the merchant is no longer reported
        expect(fieldErrors).toBe(NO_FIELD_ERRORS);
    });

    it('keeps the date flagged until it is filled in, even once the amount is', () => {
        // Given a manual expense whose amount was entered while the date is still empty
        const transaction = createManualTransaction({created: ''});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, baseParams);

        // Then the date is still reported
        expect(fieldErrors).toEqual({date: 'common.error.fieldRequired'});
    });

    it.each([
        {name: 'hidden', overrides: {shouldShowDate: false}},
        {name: 'read-only', overrides: {isReadOnly: true}},
    ])('never reports a $name date as missing, since it cannot be filled in', ({overrides}) => {
        // Given an expense with no date on a confirmation that doesn't let the user enter one
        const transaction = createManualTransaction({created: ''});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, ...overrides});

        // Then the date doesn't block confirmation
        expect(fieldErrors).toBe(NO_FIELD_ERRORS);
    });

    it('leaves an untouched scan to SmartScan', () => {
        // Given a scan whose amount, merchant and date the user left blank
        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(createScanDraft(), {...baseParams, ...scanParams});

        // Then nothing is reported, since SmartScan reads all three off the receipt
        expect(fieldErrors).toBe(NO_FIELD_ERRORS);
    });

    it('flags only the amount on a scan whose merchant and date were entered by hand', () => {
        // Given a scan headed for a workspace where the user typed the merchant and picked the date but left the amount blank
        const transaction = createScanDraft({merchant: 'Hilton', isMerchantSet: true, created: '2026-11-05', isCreatedSet: true});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, ...scanParams, iouMerchant: 'Hilton'});

        // Then the amount is required, because the three fields are all-or-nothing once one is entered
        expect(fieldErrors).toEqual({amount: 'common.error.fieldRequired'});
    });

    it('flags the merchant and the date on a workspace scan where only the amount was entered', () => {
        // Given a workspace scan with only the amount entered
        const transaction = createScanDraft({amount: 2500, isAmountSet: true});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, ...scanParams, iouAmount: 2500});

        // Then both blank fields are required
        expect(fieldErrors).toEqual({date: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'});
    });

    it('reports an amount never entered on an expense to a person as required, not invalid', () => {
        // Given a manual expense to a user whose amount field was left blank
        const transaction = createManualTransaction({amount: 0, isAmountSet: false, participants: [P2P_PARTICIPANT]});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, iouAmount: 0, isPolicyExpenseChat: false, isMerchantRequired: false});

        // Then the amount reads as missing, so the required fields summary covers it the same as on a workspace expense
        expect(fieldErrors).toEqual({amount: 'common.error.fieldRequired'});
    });

    it('reports a zero amount to a person as invalid', () => {
        // Given a manual expense to a user where the user typed a $0 amount
        const transaction = createManualTransaction({amount: 0, isAmountSet: true, participants: [P2P_PARTICIPANT]});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, iouAmount: 0, isPolicyExpenseChat: false, isMerchantRequired: false});

        // Then the amount is invalid, as a 1:1 expense can't be $0
        expect(fieldErrors).toEqual({amount: 'common.error.invalidAmount'});
    });

    it('does not check the amount of a distance expense, which is computed rather than typed', () => {
        // Given a distance expense whose computed amount is zero while its route loads
        const transaction = createManualTransaction({amount: 0, iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, participants: [P2P_PARTICIPANT]});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, iouAmount: 0, isDistanceRequest: true, isPolicyExpenseChat: false, isMerchantRequired: false});

        // Then the amount field isn't flagged, since its errors belong to the footer for this type
        expect(fieldErrors).toBe(NO_FIELD_ERRORS);
    });
});
