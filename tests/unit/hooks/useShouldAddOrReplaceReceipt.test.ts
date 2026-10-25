import {renderHook} from '@testing-library/react-native';

import useShouldAddOrReplaceReceipt from '@pages/inbox/report/ReportActionCompose/useShouldAddOrReplaceReceipt';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const ACCOUNT_ID = 1;
const MANAGER_ACCOUNT_ID = 2;
const POLICY_ID = 'policy1';
const REPORT_ID = '100';
const TRANSACTION_ID = 'txn1';

const policy: Policy = {
    id: POLICY_ID,
    name: 'Policy',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.USER,
    owner: 'owner@test.com',
    outputCurrency: CONST.CURRENCY.USD,
};

const expenseReport: Report = {
    reportID: REPORT_ID,
    policyID: POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    ownerAccountID: ACCOUNT_ID,
    managerID: MANAGER_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    participants: {
        [ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        [MANAGER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    },
};

const iouAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
    reportActionID: 'action1',
    actorAccountID: ACCOUNT_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    originalMessage: {
        IOUReportID: REPORT_ID,
        IOUTransactionID: TRANSACTION_ID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
    },
    message: [{type: 'COMMENT', html: 'USD 10.00 expense', text: 'USD 10.00 expense', isEdited: false, whisperedTo: [], isDeletedParentAction: false, deleted: ''}],
    created: '2025-01-01 12:00:00',
};

function buildTransaction(state: Receipt['state'], iouRequestType?: Transaction['iouRequestType']): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        comment: {},
        created: '2025-01-01',
        merchant: 'Merchant',
        iouRequestType,
        receipt: {source: 'https://example.com/receipt.jpg', filename: 'receipt.jpg', state},
    };
}

async function renderForTransaction(transaction: Transaction) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
    const {result} = renderHook(() => useShouldAddOrReplaceReceipt(REPORT_ID));
    await waitForBatchedUpdatesWithAct();
    return result;
}

describe('useShouldAddOrReplaceReceipt', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'submitter@test.com'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[iouAction.reportActionID]: iouAction});
        await waitForBatchedUpdatesWithAct();
    });

    it('allows replacing the receipt of a manual expense while its receipt is SCAN_READY', async () => {
        // Given a manual expense whose receipt was just replaced, which starts a backend scan the user never sees
        const transaction = buildTransaction(CONST.IOU.RECEIPT_STATE.SCAN_READY, CONST.IOU.REQUEST_TYPE.MANUAL);

        // When the composer checks whether a dropped file should go to the expense's receipt
        const result = await renderForTransaction(transaction);

        // Then a dropped file replaces the receipt instead of falling back to a new expense or an attachment
        expect(result.current.transactionID).toBe(TRANSACTION_ID);
        expect(result.current.shouldAddOrReplaceReceipt).toBe(true);
    });

    it('blocks replacing the receipt of a scan expense while its receipt is SCAN_READY', async () => {
        // Given a scan expense whose receipt is waiting to be scanned, so the user sees a scan in progress
        const transaction = buildTransaction(CONST.IOU.RECEIPT_STATE.SCAN_READY, CONST.IOU.REQUEST_TYPE.SCAN);

        // When the composer checks whether a dropped file should go to the expense's receipt
        const result = await renderForTransaction(transaction);

        // Then the receipt can't be replaced until the scan finishes
        expect(result.current.shouldAddOrReplaceReceipt).toBe(false);
    });

    it('blocks replacing the receipt while it is SCAN_READY when the expense has no iouRequestType', async () => {
        // Given an expense with no iouRequestType, which getRequestType would treat as manual
        const transaction = buildTransaction(CONST.IOU.RECEIPT_STATE.SCAN_READY);

        // When the composer checks whether a dropped file should go to the expense's receipt
        const result = await renderForTransaction(transaction);

        // Then the scan still blocks the replace, because only an explicit manual type is exempt
        expect(result.current.shouldAddOrReplaceReceipt).toBe(false);
    });

    it('allows replacing the receipt of a scan expense once its receipt is SCAN_COMPLETE', async () => {
        // Given a scan expense whose scan has finished
        const transaction = buildTransaction(CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE, CONST.IOU.REQUEST_TYPE.SCAN);

        // When the composer checks whether a dropped file should go to the expense's receipt
        const result = await renderForTransaction(transaction);

        // Then a dropped file replaces the receipt
        expect(result.current.shouldAddOrReplaceReceipt).toBe(true);
    });
});
