import type {GetConfirmationFieldErrorsParams} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import getConfirmationFieldErrors, {getSiblingFieldErrors, NO_FIELD_ERRORS} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';

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

        // Then both fields read as required, so each of them is flagged under its own input
        expect(fieldErrors).toEqual({amount: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'});
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

    it.each([
        ['the merchant and the date', {merchant: 'Hilton', isMerchantSet: true, created: '2026-11-05', isCreatedSet: true}, {iouMerchant: 'Hilton'}, {amount: 'common.error.fieldRequired'}],
        ['only the amount', {amount: 2500, isAmountSet: true}, {iouAmount: 2500}, {date: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'}],
    ] as const)('flags the blank fields on a workspace scan where the user entered %s', (_entered, transactionOverrides, paramsOverrides, expectedFieldErrors) => {
        // Given a scan headed for a workspace where the user entered some of the amount, merchant and date by hand
        const transaction = createScanDraft(transactionOverrides);

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, ...scanParams, ...paramsOverrides});

        // Then the fields left blank are required, because the three are all-or-nothing once one is entered
        expect(fieldErrors).toEqual(expectedFieldErrors);
    });

    it.each([
        ['an amount never entered as required', false, 'common.error.fieldRequired'],
        ['a typed $0 amount as invalid', true, 'common.error.invalidAmount'],
    ] as const)('reports %s on an expense to a person', (_case, isAmountSet, expectedError) => {
        // Given a manual expense to a user whose amount is $0, either left blank or typed
        const transaction = createManualTransaction({amount: 0, isAmountSet, participants: [P2P_PARTICIPANT]});

        // When its field errors are computed
        const fieldErrors = getConfirmationFieldErrors(transaction, {...baseParams, iouAmount: 0, isPolicyExpenseChat: false, isMerchantRequired: false});

        // Then a blank amount reads as missing, the same as on a workspace expense, while a typed $0 is invalid because a 1:1 expense can't be $0
        expect(fieldErrors).toEqual({amount: expectedError});
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

describe('getSiblingFieldErrors', () => {
    const siblingParams = {...baseParams, canEnterScanFieldsManually: true, isMerchantRequired: false, participants: [WORKSPACE_PARTICIPANT]};
    const completeFields = {amount: 2500, isAmountSet: true, merchant: 'Hilton', isMerchantSet: true, isCreatedSet: true};

    it('finds nothing without other receipts, or when they were left for SmartScan', () => {
        // Given a single expense, and a multi-scan whose other receipt the user never touched
        // When the other receipts are checked
        // Then nothing blocks, since SmartScan fills in a receipt nobody typed into
        expect(getSiblingFieldErrors(undefined, siblingParams)).toBeUndefined();
        expect(getSiblingFieldErrors([createScanDraft()], siblingParams)).toBeUndefined();
    });

    it('reports a partially filled receipt with the fields it is missing', () => {
        // Given a multi-scan to a workspace whose other receipt only has its amount entered
        const sibling = createScanDraft({transactionID: 'txn2', amount: 2500, isAmountSet: true});

        // When the other receipts are checked
        // Then that receipt is reported with its blank fields, so it can be brought on screen
        expect(getSiblingFieldErrors([sibling], siblingParams)).toEqual({transactionID: 'txn2', fieldErrors: {date: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'}});
    });

    it('reports a complete receipt that holds an invalid merchant, using its own values', () => {
        // Given a multi-scan whose other receipt is fully filled in with a merchant that isn't allowed
        const sibling = createScanDraft({...completeFields, transactionID: 'txn2', merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT});

        // When the other receipts are checked with the valid merchant of the receipt on screen in the params
        // Then the other receipt's own merchant is what gets checked
        expect(getSiblingFieldErrors([sibling], siblingParams)).toEqual({transactionID: 'txn2', fieldErrors: {merchant: 'iou.error.invalidMerchant'}});
    });

    it('checks an amount against the recipient on screen, even when the draft of the other receipt has none', () => {
        // Given a multi-scan whose other receipt has a negative amount and no recipient of its own in its draft
        const sibling = createScanDraft({...completeFields, transactionID: 'txn2', amount: -1234, participants: undefined});
        const params = {...siblingParams, iouType: CONST.IOU.TYPE.CREATE, isPolicyExpenseChat: false};

        // When the recipient on screen is a person, and then a workspace
        const toPerson = getSiblingFieldErrors([sibling], {...params, participants: [P2P_PARTICIPANT]});
        const toWorkspace = getSiblingFieldErrors([sibling], {...params, participants: [WORKSPACE_PARTICIPANT]});

        // Then the negative amount only blocks for a person, because every receipt goes to the same recipient
        expect(toPerson).toEqual({transactionID: 'txn2', fieldErrors: {amount: 'common.error.invalidAmount'}});
        expect(toWorkspace).toBeUndefined();
    });

    it('returns the first receipt that has a field error', () => {
        // Given a multi-scan with a valid receipt followed by two receipts holding invalid merchants
        const valid = createScanDraft({...completeFields, transactionID: 'txn2'});
        const firstInvalid = createScanDraft({...completeFields, transactionID: 'txn3', merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT});
        const secondInvalid = createScanDraft({...completeFields, transactionID: 'txn4', merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT});

        // When the other receipts are checked
        // Then the first one with an error is the one to bring on screen
        expect(getSiblingFieldErrors([valid, firstInvalid, secondInvalid], siblingParams)?.transactionID).toBe('txn3');
    });
});
