import {renderHook} from '@testing-library/react-native';

import useShouldAddOrReplaceReceipt from '@pages/inbox/report/ReportActionCompose/useShouldAddOrReplaceReceipt';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('useShouldAddOrReplaceReceipt', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should stop offering to replace the receipt once the parent report actions show the report was forwarded since the last submit', async () => {
        // Given a corporate policy where the current user submits to the approver who manages their submitted expense report
        const currentUserAccountID = 201;
        const currentUserEmail = 'submitter@vikings.net';
        const approverAccountID = 202;
        const approverEmail = 'approver@vikings.net';
        const policyID = 'receipt-forwarded-policy';
        const policy: Policy = {
            id: policyID,
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.USER,
            name: 'Corporate policy',
            owner: '',
            outputCurrency: CONST.CURRENCY.USD,
            employeeList: {
                [currentUserEmail]: {email: currentUserEmail, role: CONST.POLICY.ROLE.USER, submitsTo: approverEmail},
            },
        };
        const expenseReport: Report = {
            ...createRandomReport(203, undefined),
            reportID: 'receipt-forwarded-report',
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID,
            ownerAccountID: currentUserAccountID,
            managerID: approverAccountID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };
        const transaction: Transaction = {
            ...createRandomTransaction(204),
            transactionID: 'receipt-forwarded-transaction',
            reportID: expenseReport.reportID,
            managedCard: false,
        };
        const moneyRequestAction: ReportAction = {
            ...createRandomReportAction(205),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            reportID: expenseReport.reportID,
            actorAccountID: currentUserAccountID,
            originalMessage: {
                IOUTransactionID: transaction.transactionID,
                IOUReportID: expenseReport.reportID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 100,
                currency: CONST.CURRENCY.USD,
            },
        };
        const submittedAction: ReportAction = {
            ...createRandomReportAction(206),
            actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            created: '2026-04-21 17:00:00',
        };
        const forwardedAction: ReportAction = {
            ...createRandomReportAction(207),
            actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
            created: '2026-04-21 17:10:00',
        };
        // The composer is open on the expense's transaction thread, so the IOU action lives in the parent report's actions
        const transactionThread: Report = {
            ...createRandomReport(208, undefined),
            reportID: 'receipt-forwarded-thread',
            policyID,
            parentReportID: expenseReport.reportID,
            parentReportActionID: moneyRequestAction.reportActionID,
        };

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [currentUserAccountID]: {accountID: currentUserAccountID, login: currentUserEmail},
            [approverAccountID]: {accountID: approverAccountID, login: approverEmail},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`, transactionThread);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
            [moneyRequestAction.reportActionID]: moneyRequestAction,
            [submittedAction.reportActionID]: submittedAction,
        });
        await waitForBatchedUpdates();

        // When rendering the hook for the transaction thread
        const {result, rerender} = renderHook(() => useShouldAddOrReplaceReceipt(transactionThread.reportID));
        await waitForBatchedUpdates();

        // Then the submitter can still replace the receipt because the parent report actions show no forward since the last submit
        expect(result.current.transactionID).toBe(transaction.transactionID);
        expect(result.current.shouldAddOrReplaceReceipt).toBe(true);

        // When the report is forwarded after the last submit
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
            [forwardedAction.reportActionID]: forwardedAction,
        });
        await waitForBatchedUpdates();
        rerender(undefined);

        // Then the hook picks the forward up from the parent report actions it subscribes to and stops offering to replace the receipt
        expect(result.current.shouldAddOrReplaceReceipt).toBe(false);
    });
});
