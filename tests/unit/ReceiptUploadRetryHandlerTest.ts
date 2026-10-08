import retryReceiptUpload, {canRetryReceiptUpload} from '@libs/ReceiptUploadRetryHandler';
import buildReplaceReceiptRetryPayload from '@libs/ReceiptUploadRetryHandler/buildReplaceReceiptRetryPayload';
import buildRetryPayload, {canBuildRetryPayload} from '@libs/ReceiptUploadRetryHandler/buildRetryPayload';
import resolveReceiptFile from '@libs/ReceiptUploadRetryHandler/resolveReceiptFile';
import type {ReceiptRetryContext} from '@libs/ReceiptUploadRetryHandler/types';

import {replaceReceipt} from '@userActions/IOU/Receipt';
import type {ReplaceReceiptRetryParams} from '@userActions/IOU/Receipt';
import {requestMoney} from '@userActions/IOU/TrackExpense';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ReceiptUploadRetryHandler/resolveReceiptFile', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@userActions/IOU/Receipt', () => ({...jest.requireActual<Record<string, unknown>>('@userActions/IOU/Receipt'), replaceReceipt: jest.fn()}));
jest.mock('@userActions/IOU/TrackExpense', () => ({...jest.requireActual<Record<string, unknown>>('@userActions/IOU/TrackExpense'), requestMoney: jest.fn()}));

const CURRENT_USER_ACCOUNT_ID = 1;
const TRANSACTION_ID = '7000000000000001';
const IOU_REPORT_ID = '8000000000000001';
const CHAT_REPORT_ID = '9000000000000001';
const POLICY_ID = 'A0000000000000001';
const IOU_ACTION_ID = '6000000000000001';
const THREAD_REPORT_ID = '5000000000000001';

const receiptFile: FileObject = {name: 'receipt.jpg', type: 'image/jpeg', uri: 'file:///receipts/receipt.jpg'};

function buildFailedTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: IOU_REPORT_ID,
        amount: 0,
        currency: CONST.CURRENCY.USD,
        created: '2026-09-01',
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        comment: {comment: ''},
        iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        receipt: {source: 'file:///receipts/receipt.jpg', filename: 'receipt.jpg', state: CONST.IOU.RECEIPT_STATE.SCAN_READY},
        ...overrides,
    } as Transaction;
}

function buildContext(transaction: Transaction, receiptErrorOverrides: Partial<ReceiptError> = {}): ReceiptRetryContext {
    return {
        receiptError: {
            error: CONST.IOU.RECEIPT_ERROR,
            source: 'file:///receipts/receipt.jpg',
            filename: 'receipt.jpg',
            action: CONST.IOU.ACTION_PARAMS.MONEY_REQUEST,
            ...receiptErrorOverrides,
        },
        transaction,
        iouReport: {reportID: IOU_REPORT_ID, chatReportID: CHAT_REPORT_ID, policyID: POLICY_ID, type: CONST.REPORT.TYPE.EXPENSE} as Report,
        iouActionID: IOU_ACTION_ID,
        transactionThreadReportID: THREAD_REPORT_ID,
        policyParams: {},
        isVendorMatchingBetaEnabled: false,
        rules: {},
        conciergeReportID: undefined,
        isSelfTourViewed: true,
        isASAPSubmitBetaEnabled: false,
        isTrackIntentUser: false,
        delegateAccountID: undefined,
        formatPhoneNumber: (phone) => phone,
        getCurrencyDecimals: () => 2,
        transactionReport: undefined,
        transactionThreadReport: undefined,
        transactionViolations: undefined,
        currentUserPersonalDetails: {accountID: CURRENT_USER_ACCOUNT_ID, login: 'me@example.com'},
    };
}

function buildReplaceReceiptContext(retryParamsOverrides: Partial<ReplaceReceiptRetryParams> = {}, receiptErrorOverrides: Partial<ReceiptError> = {}): ReceiptRetryContext {
    const transaction = buildFailedTransaction({receipt: undefined, merchant: 'Coffee', amount: -1200});
    const retryParams: ReplaceReceiptRetryParams = {
        transactionID: TRANSACTION_ID,
        file: undefined,
        source: 'file:///receipts/receipt.jpg',
        transactionPolicy: undefined,
        isVendorMatchingBetaEnabled: false,
        ...retryParamsOverrides,
    };
    return buildContext(transaction, {action: CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT, retryParams: JSON.stringify(retryParams), ...receiptErrorOverrides});
}

describe('buildRetryPayload', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: 'me@example.com'}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, {
            reportID: CHAT_REPORT_ID,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: POLICY_ID,
        });
        await waitForBatchedUpdates();
    });

    it('reuses the original transaction ID, which is the only thing stopping a re-send from creating a second expense', () => {
        // Given a RequestMoney whose upload failed after its transaction was built
        const context = buildContext(buildFailedTransaction());

        // When the retry payload is rebuilt from what the failure left in Onyx
        const payload = buildRetryPayload(context, receiptFile);

        // Then it keeps the transaction ID, so a re-send that already reached the server gets "Transaction already created" instead of a second expense
        expect(payload?.optimisticTransactionID).toBe(TRANSACTION_ID);
    });

    it('offers a retry for a failed expense as the create path really leaves it, with no participants and a manual request type', () => {
        // Given a failed expense with no participants and a manual request type, the way the requestMoney failure leaves it
        const context = buildContext(buildFailedTransaction());

        // When the view asks whether Try again can be shown
        const canRetry = canBuildRetryPayload(context);

        // Then it is offered, because the participant can still be resolved from the report
        expect(canRetry).toBe(true);
    });

    it('reuses the IOU report action and transaction thread, so the retry does not add a second expense to the report', () => {
        // Given a failed expense whose IOU action and transaction thread already exist locally
        const context = buildContext(buildFailedTransaction());

        // When the retry payload is rebuilt
        const payload = buildRetryPayload(context, receiptFile);

        // Then it reuses both, so the retry overwrites them instead of adding a second expense to the report
        expect(payload?.currentReportActionID).toBe(IOU_ACTION_ID);
        expect(payload?.existingTransactionThreadReportID).toBe(THREAD_REPORT_ID);
    });

    it('offers no retry for a distance expense, whose waypoints the transaction alone cannot restore', () => {
        // Given a failed expense with waypoints, which a RequestMoney retry would have to send again
        const context = buildContext(buildFailedTransaction({comment: {waypoints: {waypoint0: {address: 'Berlin'}}}}));

        // When the view asks whether Try again can be shown
        const canRetry = canBuildRetryPayload(context);

        // Then it is hidden, because the transaction alone cannot restore the waypoints
        expect(canRetry).toBe(false);
    });

    it('does not rebuild a replaceReceipt failure as a RequestMoney call, because replace has its own builder', () => {
        // Given a failed ReplaceReceipt on an existing expense
        const context = buildContext(buildFailedTransaction(), {action: CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT});

        // When the RequestMoney builder is asked whether it can rebuild it
        const canRetry = canBuildRetryPayload(context);

        // Then it refuses, because replaying it as RequestMoney would create a new expense instead of updating the receipt
        expect(canRetry).toBe(false);
    });

    it('offers no retry for a trackExpense failure, whose convert-and-submit path the handler does not replay', () => {
        // Given a failed TrackExpense
        const context = buildContext(buildFailedTransaction(), {action: CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE});

        // When the RequestMoney builder is asked whether it can rebuild it
        const canRetry = canBuildRetryPayload(context);

        // Then it refuses, because the track flow is not a RequestMoney call
        expect(canRetry).toBe(false);
    });

    it('offers no retry for the report-creation fallback error, which carries no action to replay', () => {
        // Given the fallback receipt error the view builds for a report-creation failure, which has no action
        const context = buildContext(buildFailedTransaction(), {action: undefined});

        // When the view asks whether Try again can be shown
        const canRetry = canBuildRetryPayload(context);

        // Then it is hidden, because there is no call to replay
        expect(canRetry).toBe(false);
    });

    it('offers no retry once the receipt source is no longer a local file, so there is nothing left on the device to resend', () => {
        // Given a failed expense whose receipt source is a remote URL
        const context = buildContext(buildFailedTransaction(), {source: 'https://example.com/receipt.jpg'});

        // When the view asks whether Try again can be shown
        const canRetry = canBuildRetryPayload(context);

        // Then it is hidden, because nothing is left on the device to resend
        expect(canRetry).toBe(false);
    });

    describe('retryReceiptUpload', () => {
        beforeEach(() => {
            jest.mocked(resolveReceiptFile).mockResolvedValue(receiptFile);
            jest.mocked(requestMoney).mockReset();
        });

        it('keeps the receipt error when the dispatch throws, so Try again and Save stay available', async () => {
            // Given a retryable failure whose dispatch throws
            jest.mocked(requestMoney).mockImplementation(() => {
                throw new Error('dispatch failed');
            });
            const clearReceiptError = jest.fn(() => Promise.resolve());

            // When Try again is pressed
            const outcome = await retryReceiptUpload(buildContext(buildFailedTransaction()), clearReceiptError);

            // Then the error stays, so the user still has Try again and Save
            expect(outcome).toBe('dispatchFailed');
            expect(clearReceiptError).not.toHaveBeenCalled();
        });

        it('clears the receipt error only after the retry is dispatched', async () => {
            // Given a retryable failure
            const clearReceiptError = jest.fn(() => Promise.resolve());

            // When Try again is pressed
            const outcome = await retryReceiptUpload(buildContext(buildFailedTransaction()), clearReceiptError);

            // Then the error is cleared only after requestMoney is called, so a failed dispatch can't hide the buttons
            expect(outcome).toBe('dispatched');
            expect(clearReceiptError).toHaveBeenCalledTimes(1);
            expect(jest.mocked(requestMoney).mock.invocationCallOrder.at(0)).toBeLessThan(clearReceiptError.mock.invocationCallOrder.at(0) ?? 0);
        });
    });

    describe('replaceReceipt retry', () => {
        beforeEach(() => {
            jest.mocked(resolveReceiptFile).mockResolvedValue(receiptFile);
            jest.mocked(replaceReceipt).mockReset();
            jest.mocked(requestMoney).mockReset();
        });

        it('offers a retry for a failed replaceReceipt, including on a distance expense', () => {
            // Given a failed ReplaceReceipt, once on a plain expense and once on a distance expense
            const context = buildReplaceReceiptContext();
            const distanceContext = buildReplaceReceiptContext();
            distanceContext.transaction = buildFailedTransaction({receipt: undefined, comment: {waypoints: {waypoint0: {address: 'Berlin'}}}});

            // When the view asks whether Try again can be shown
            const canRetry = canRetryReceiptUpload(context);
            const canRetryDistance = canRetryReceiptUpload(distanceContext);

            // Then it is offered for both, because replace only sends the receipt again and never touches waypoints
            expect(canRetry).toBe(true);
            expect(canRetryDistance).toBe(true);
        });

        it.each([
            ['the source is not a local file', buildReplaceReceiptContext({}, {source: 'https://example.com/receipt.jpg'})],
            ['the retry params belong to another transaction', buildReplaceReceiptContext({transactionID: '7000000000000999'})],
            ['the retry params are not valid JSON', buildReplaceReceiptContext({}, {retryParams: '{not json'})],
            ['there are no retry params', buildReplaceReceiptContext({}, {retryParams: undefined})],
        ])('offers no retry when %s', (_, context) => {
            // Given a ReplaceReceipt error that can't be replayed for the reason in the test name

            // When the view asks whether Try again can be shown
            const canRetry = canRetryReceiptUpload(context);

            // Then it is hidden, so pressing it can't do nothing or upload the receipt to the wrong expense
            expect(canRetry).toBe(false);
        });

        it('rebuilds the payload from the stored crop state and action ID, and the current policy and violations', () => {
            // Given a failed crop with an "added a receipt" action, whose stored retry params hold an old policy
            const context = buildReplaceReceiptContext({
                isSameReceipt: true,
                state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                receiptAddedReportActionID: '1234567890',
                transactionPolicy: createMock<Policy>({id: POLICY_ID, name: 'Old name'}),
            });
            const currentPolicy = createMock<Policy>({id: POLICY_ID, name: 'New name'});
            context.policyParams = {policy: currentPolicy};
            context.transactionViolations = [];

            // When the retry payload is rebuilt
            const payload = buildReplaceReceiptRetryPayload(context, receiptFile);

            // Then the crop stays a same-receipt update, the failed action is reused, and violations use the current policy
            expect(payload).toEqual(
                expect.objectContaining({
                    file: receiptFile,
                    source: 'file:///receipts/receipt.jpg',
                    isSameReceipt: true,
                    state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                    receiptAddedReportActionID: '1234567890',
                    transactionPolicy: currentPolicy,
                    transactionViolations: [],
                }),
            );
        });

        it('dispatches replaceReceipt and clears the error after it', async () => {
            // Given a retryable ReplaceReceipt failure
            const clearReceiptError = jest.fn(() => Promise.resolve());

            // When Try again is pressed
            const outcome = await retryReceiptUpload(buildReplaceReceiptContext(), clearReceiptError);

            // Then replaceReceipt is called instead of requestMoney, before the error is cleared, so the expense is updated rather than created again
            expect(outcome).toBe('dispatched');
            expect(jest.mocked(replaceReceipt)).toHaveBeenCalledTimes(1);
            expect(jest.mocked(requestMoney)).not.toHaveBeenCalled();
            expect(jest.mocked(replaceReceipt).mock.invocationCallOrder.at(0)).toBeLessThan(clearReceiptError.mock.invocationCallOrder.at(0) ?? 0);
        });
    });
});
