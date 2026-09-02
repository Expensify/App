import {renderHook} from '@testing-library/react-native';

import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';

describe('useShowNotFoundPageInIOUStep', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    it('should return false for report approver/manager', async () => {
        // Given an expense report and current user as the approver
        const currentUserAccountID = 123;
        const iouReport: Report = {
            ...createRandomReport(0, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
        };
        const moneyRequestAction: ReportAction = {
            ...createRandomReportAction(3),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            reportID: iouReport.reportID,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
        };
        const transactionThread: Report = {
            ...createRandomReport(1, undefined),
            parentReportID: iouReport.reportID,
            parentReportActionID: moneyRequestAction.reportActionID,
        };
        const transaction: Transaction = {
            ...createRandomTransaction(3),
            reportID: iouReport.reportID,
        };
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.parentReportID}`, {
            [moneyRequestAction.reportActionID]: moneyRequestAction,
        });

        // Then not found page should not be shown when editing the expense
        const {result} = renderHook(() => useShowNotFoundPageInIOUStep(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.CREATE, undefined, transactionThread, transaction));
        expect(result.current).toBe(false);
    });

    it('should show the not found page for the submitter when the report was forwarded since the last submit', async () => {
        // Given a corporate policy where the current user submits to an approver, and a submitted expense report owned by the current user
        const currentUserAccountID = 124;
        const currentUserEmail = 'submitter@vikings.net';
        const approverAccountID = 125;
        const approverEmail = 'approver@vikings.net';
        const policyID = 'forwarded-hook-policy';
        const policy = {
            id: policyID,
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.USER,
            name: 'Corporate policy',
            owner: '',
            outputCurrency: 'USD',
            employeeList: {
                [currentUserEmail]: {
                    email: currentUserEmail,
                    role: CONST.POLICY.ROLE.USER,
                    submitsTo: approverEmail,
                },
            },
        };
        const iouReport: Report = {
            ...createRandomReport(10, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID,
            ownerAccountID: currentUserAccountID,
            managerID: approverAccountID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };
        const moneyRequestAction: ReportAction = {
            ...createRandomReportAction(11),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            reportID: iouReport.reportID,
            actorAccountID: currentUserAccountID,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
        };
        const submittedAction: ReportAction = {
            ...createRandomReportAction(12),
            actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            created: '2026-04-21 17:00:00',
        };
        const forwardedAction: ReportAction = {
            ...createRandomReportAction(13),
            actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
            created: '2026-04-21 17:10:00',
        };
        const transactionThread: Report = {
            ...createRandomReport(14, undefined),
            policyID,
            parentReportID: iouReport.reportID,
            parentReportActionID: moneyRequestAction.reportActionID,
        };
        const transaction: Transaction = {
            ...createRandomTransaction(15),
            reportID: iouReport.reportID,
        };

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [currentUserAccountID]: {accountID: currentUserAccountID, login: currentUserEmail},
            [approverAccountID]: {accountID: approverAccountID, login: approverEmail},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`, {
            [moneyRequestAction.reportActionID]: moneyRequestAction,
            [submittedAction.reportActionID]: submittedAction,
        });

        // Then the submitter can still edit while the report has not been forwarded, so no not-found page
        const {result, rerender} = renderHook(() => useShowNotFoundPageInIOUStep(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.CREATE, undefined, transactionThread, transaction));
        expect(result.current).toBe(false);

        // When the report is forwarded after the last submit, the submitter loses edit access and the not-found page is shown
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`, {
            [forwardedAction.reportActionID]: forwardedAction,
        });
        rerender(undefined);
        expect(result.current).toBe(true);
    });
});
