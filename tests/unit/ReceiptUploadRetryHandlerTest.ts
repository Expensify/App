import buildRetryPayload, {canBuildRetryPayload} from '@libs/ReceiptUploadRetryHandler/buildRetryPayload';
import type {ReceiptRetryContext} from '@libs/ReceiptUploadRetryHandler/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const TRANSACTION_ID = '7000000000000001';
const IOU_REPORT_ID = '8000000000000001';
const CHAT_REPORT_ID = '9000000000000001';
const POLICY_ID = 'A0000000000000001';

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

function buildContext(transaction: Transaction): ReceiptRetryContext {
    return {
        receiptError: {
            error: CONST.IOU.RECEIPT_ERROR,
            source: 'file:///receipts/receipt.jpg',
            filename: 'receipt.jpg',
            action: CONST.IOU.ACTION_PARAMS.MONEY_REQUEST,
        },
        transaction,
        iouReport: {reportID: IOU_REPORT_ID, chatReportID: CHAT_REPORT_ID, policyID: POLICY_ID, type: CONST.REPORT.TYPE.EXPENSE} as Report,
        policyParams: {},
        betas: [],
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

    it('offers no retry for a distance expense, whose waypoints the transaction alone cannot restore', () => {
        const transaction = buildFailedTransaction({comment: {waypoints: {waypoint0: {address: 'Berlin'}}}});
        expect(canBuildRetryPayload(buildContext(transaction))).toBe(false);
    });
});
