import shouldShowPushNotification from '@libs/Notification/PushNotification/shouldShowPushNotification';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';

import {shouldShowReportActionNotification} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {PushPayload} from '@ua/react-native-airship';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = '10';
const TRANSACTION_THREAD_REPORT_ID = '20';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {getTopmostReportId: jest.fn(() => '10')},
}));
jest.mock('@userActions/Report', () => ({
    shouldShowReportActionNotification: jest.fn(() => true),
}));

function buildPushPayload(): PushPayload {
    return createMock<PushPayload>({
        extras: {payload: {type: 'reportComment', reportID: Number(TRANSACTION_THREAD_REPORT_ID), reportActionID: '1', title: '', subtitle: ''}},
    });
}

describe('shouldShowPushNotification', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue(TRANSACTION_THREAD_REPORT_ID);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('passes the expense thread of the open report when single-expense reports use the expense view', async () => {
        // Given single-expense reports use the expense view, which shows the expense thread's comments
        await Onyx.set(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW, CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.EXPENSE);
        await waitForBatchedUpdates();

        // When a push notification arrives for a comment on that expense thread
        shouldShowPushNotification(buildPushPayload());

        // Then the thread counts as part of the open report, so its comment doesn't notify while the report is open
        expect(shouldShowReportActionNotification).toHaveBeenCalledWith(TRANSACTION_THREAD_REPORT_ID, TRANSACTION_THREAD_REPORT_ID, expect.any(Number), null, true);
    });

    it('leaves the expense thread out when single-expense reports use the table view', async () => {
        // Given single-expense reports use the table view, which doesn't show the expense thread's comments
        await Onyx.set(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW, CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE);
        await waitForBatchedUpdates();

        // When a push notification arrives for a comment on that expense thread
        shouldShowPushNotification(buildPushPayload());

        // Then the thread isn't treated as part of the open report, so its comment can still notify
        expect(shouldShowReportActionNotification).toHaveBeenCalledWith(TRANSACTION_THREAD_REPORT_ID, undefined, expect.any(Number), null, true);
    });

    it('keeps the expense thread for a "Pay someone" report in the table view', async () => {
        // Given the table view is on, but the open report is a "Pay someone" report, which always uses the expense view
        const sentMoneyAction = createMock<ReportAction>({
            reportActionID: '100',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY, IOUDetails: {amount: 100, currency: CONST.CURRENCY.USD, comment: ''}, amount: 100, currency: CONST.CURRENCY.USD},
        });
        await Onyx.set(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW, CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[sentMoneyAction.reportActionID]: sentMoneyAction});
        await waitForBatchedUpdates();

        // When a push notification arrives for a comment on that expense thread
        shouldShowPushNotification(buildPushPayload());

        // Then the thread still counts as part of the open report, as it does in the expense view
        expect(shouldShowReportActionNotification).toHaveBeenCalledWith(TRANSACTION_THREAD_REPORT_ID, TRANSACTION_THREAD_REPORT_ID, expect.any(Number), null, true);
    });
});
