import {getReasonAndReportActionThatRequiresAttention} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const approverAccountID = 173;
const approverEmail = 'approver@receiver.com';
const submittedBill = createMock<Report>({
    reportID: '9001',
    type: CONST.REPORT.TYPE.BILL,
    managerID: approverAccountID,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    total: -1250,
});

function getBadge(report: Report, accountID: number, email: string) {
    return getReasonAndReportActionThatRequiresAttention({
        optionOrReport: report,
        currentUserLogin: email,
        currentUserAccountID: accountID,
        transactionViolations: undefined,
        reportMetadata: undefined,
        policies: {},
        allReportActions: {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {}},
    });
}

describe('Bill Pay green dot', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('shows Approve on a submitted bill for its approver', () => {
        // Given a submitted bill, which has no parent chat to carry a report preview badge
        // Then the approver sees the Approve green dot on the bill itself
        expect(getBadge(submittedBill, approverAccountID, approverEmail)).toEqual({
            reason: CONST.REQUIRES_ATTENTION_REASONS.IS_WAITING_FOR_ASSIGNEE_TO_COMPLETE_ACTION,
            actionBadge: CONST.REPORT.ACTION_BADGE.APPROVE,
        });
    });

    it('shows no Approve dot to other users or after approval', () => {
        expect(getBadge(submittedBill, 172, 'bob@receiver.com')?.actionBadge).toBeUndefined();
        expect(getBadge({...submittedBill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}, approverAccountID, approverEmail)?.actionBadge).not.toBe(
            CONST.REPORT.ACTION_BADGE.APPROVE,
        );
    });
});
