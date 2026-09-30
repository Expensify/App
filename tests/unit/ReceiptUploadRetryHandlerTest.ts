import retryReceiptUpload from '@libs/ReceiptUploadRetryHandler';
import buildRetryPayload, {canBuildRetryPayload} from '@libs/ReceiptUploadRetryHandler/buildRetryPayload';
import resolveReceiptFile from '@libs/ReceiptUploadRetryHandler/resolveReceiptFile';
import type {ReceiptRetryContext} from '@libs/ReceiptUploadRetryHandler/types';

import {requestMoney} from '@userActions/IOU/TrackExpense';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ReceiptUploadRetryHandler/resolveReceiptFile', () => ({__esModule: true, default: jest.fn()}));
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
    };
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
        const payload = buildRetryPayload(buildContext(buildFailedTransaction()), receiptFile);
        expect(payload?.optimisticTransactionID).toBe(TRANSACTION_ID);
    });

    it('offers a retry for a failed expense as the create path really leaves it, with no participants and a manual request type', () => {
        expect(canBuildRetryPayload(buildContext(buildFailedTransaction()))).toBe(true);
    });

    it('reuses the IOU report action and transaction thread, so the retry does not add a second expense to the report', () => {
        const payload = buildRetryPayload(buildContext(buildFailedTransaction()), receiptFile);
        expect(payload?.currentReportActionID).toBe(IOU_ACTION_ID);
        expect(payload?.existingTransactionThreadReportID).toBe(THREAD_REPORT_ID);
    });

    it('offers no retry for a distance expense, whose waypoints the transaction alone cannot restore', () => {
        const transaction = buildFailedTransaction({comment: {waypoints: {waypoint0: {address: 'Berlin'}}}});
        expect(canBuildRetryPayload(buildContext(transaction))).toBe(false);
    });

    it('offers no retry for a replaceReceipt failure, which is not the create call the handler rebuilds', () => {
        expect(canBuildRetryPayload(buildContext(buildFailedTransaction(), {action: CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT}))).toBe(false);
    });

    it('offers no retry for a trackExpense failure, whose convert-and-submit path the handler does not replay', () => {
        expect(canBuildRetryPayload(buildContext(buildFailedTransaction(), {action: CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE}))).toBe(false);
    });

    it('offers no retry for the report-creation fallback error, which carries no action to replay', () => {
        expect(canBuildRetryPayload(buildContext(buildFailedTransaction(), {action: undefined}))).toBe(false);
    });

    it('offers no retry once the receipt source is no longer a local file, so there is nothing left on the device to resend', () => {
        expect(canBuildRetryPayload(buildContext(buildFailedTransaction(), {source: 'https://example.com/receipt.jpg'}))).toBe(false);
    });

    describe('retryReceiptUpload', () => {
        beforeEach(() => {
            jest.mocked(resolveReceiptFile).mockResolvedValue(receiptFile);
            jest.mocked(requestMoney).mockReset();
        });

        it('keeps the receipt error when the dispatch throws, so Try again and Save stay available', async () => {
            jest.mocked(requestMoney).mockImplementation(() => {
                throw new Error('dispatch failed');
            });
            const clearReceiptError = jest.fn(() => Promise.resolve());

            const outcome = await retryReceiptUpload(buildContext(buildFailedTransaction()), clearReceiptError);

            expect(outcome).toBe('dispatchFailed');
            expect(clearReceiptError).not.toHaveBeenCalled();
        });

        it('clears the receipt error only after the retry is dispatched', async () => {
            const clearReceiptError = jest.fn(() => Promise.resolve());

            const outcome = await retryReceiptUpload(buildContext(buildFailedTransaction()), clearReceiptError);

            expect(outcome).toBe('dispatched');
            expect(clearReceiptError).toHaveBeenCalledTimes(1);
            expect(jest.mocked(requestMoney).mock.invocationCallOrder.at(0)).toBeLessThan(clearReceiptError.mock.invocationCallOrder.at(0) ?? 0);
        });
    });
});
