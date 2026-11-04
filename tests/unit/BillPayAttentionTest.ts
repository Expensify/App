import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getReasonAndReportActionThatRequiresAttention} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportNameValuePairs, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const approverAccountID = 173;
const approverEmail = 'approver@receiver.com';
const policy: Policy = createMock<Policy>({
    id: 'billPolicy',
    name: 'Bills',
    type: CONST.POLICY.TYPE.CORPORATE,
    role: CONST.POLICY.ROLE.USER,
    owner: 'owner@receiver.com',
    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
    outputCurrency: CONST.CURRENCY.USD,
});
const submittedBill = createMock<Report>({
    reportID: '9001',
    type: CONST.REPORT.TYPE.BILL,
    policyID: policy.id,
    ownerAccountID: 172,
    managerID: approverAccountID,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    total: -1250,
    currency: CONST.CURRENCY.USD,
});
const billTransaction = createMock<Transaction>({
    transactionID: '9002',
    reportID: submittedBill.reportID,
    amount: -1250,
    currency: CONST.CURRENCY.USD,
    merchant: 'Vendor',
    created: '2026-11-01',
});

function getBadge(report: Report, accountID: number, email: string, reportPolicy: Policy = policy, reportNameValuePairs?: ReportNameValuePairs) {
    return getReasonAndReportActionThatRequiresAttention({
        optionOrReport: report,
        reportNameValuePairs,
        currentUserLogin: email,
        currentUserAccountID: accountID,
        transactionViolations: undefined,
        reportMetadata: undefined,
        policies: {[`${ONYXKEYS.COLLECTION.POLICY}${reportPolicy.id}`]: reportPolicy},
        allReportActions: {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {}},
    });
}

function getPrimaryAction(report: Report, reportPolicy: Policy, transaction: Transaction) {
    return getReportPrimaryAction({
        report,
        currentUserAccountID: approverAccountID,
        currentUserLogin: approverEmail,
        policy: reportPolicy,
        ownerLogin: 'bob@receiver.com',
        reportTransactions: [transaction],
        violations: {},
        bankAccountList: {},
        chatReport: undefined,
        isChatReportArchived: false,
        rules: undefined,
    });
}

describe('Bill Pay green dot', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${billTransaction.transactionID}`, billTransaction);
        await waitForBatchedUpdates();
    });

    it('shows Approve on a submitted bill for its approver', () => {
        // Given a submitted bill, which has no parent chat to carry a report preview badge
        // When the Inbox checks whether the bill needs the approver's attention
        // Then the approver sees the Approve green dot on the bill itself
        expect(getBadge(submittedBill, approverAccountID, approverEmail)).toEqual({
            reason: CONST.REQUIRES_ATTENTION_REASONS.IS_WAITING_FOR_ASSIGNEE_TO_COMPLETE_ACTION,
            actionBadge: CONST.REPORT.ACTION_BADGE.APPROVE,
        });
    });

    it('shows no Approve dot to other users or after approval', () => {
        // Given the same submitted bill
        // When another user checks it, or the approver checks it after approving it
        // Then neither sees the Approve green dot, because only the approver of a submitted bill must act
        expect(getBadge(submittedBill, 172, 'bob@receiver.com')?.actionBadge).toBeUndefined();
        expect(getBadge({...submittedBill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}, approverAccountID, approverEmail)?.actionBadge).not.toBe(
            CONST.REPORT.ACTION_BADGE.APPROVE,
        );
    });

    it.each([
        ['approvals are on', policy, billTransaction, true],
        ['approvals are off', {...policy, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL}, billTransaction, false],
        [
            'a receipt is scanning',
            policy,
            {...billTransaction, amount: 0, merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING, source: 'receipt.jpg'}},
            false,
        ],
        ['every expense is on hold', policy, {...billTransaction, comment: {hold: '1'}}, false],
    ] as const)('shows the Approve dot only when the header shows Approve, when %s', async (_, reportPolicy, transaction, shouldShowApprove) => {
        // Given a submitted bill whose policy and expense decide whether the approver can approve it now
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        await waitForBatchedUpdates();

        // When the Inbox computes the bill's green dot and the report header computes its primary action
        const badge = getBadge(submittedBill, approverAccountID, approverEmail, reportPolicy)?.actionBadge;
        const primaryAction = getPrimaryAction(submittedBill, reportPolicy, transaction);

        // Then both agree, so the approver never gets a green dot for a bill they can't approve
        expect(badge === CONST.REPORT.ACTION_BADGE.APPROVE).toBe(shouldShowApprove);
        expect(primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE).toBe(shouldShowApprove);
    });

    it('shows Pay on an approved bill for its payer', () => {
        // Given an approved bill on a policy that pays bills, with the current user as its owner
        const paymentPolicy: Policy = {...policy, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES};
        const approvedBill: Report = {...submittedBill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};

        // When the Inbox checks whether the bill needs the payer's attention
        // Then the owner sees the Pay green dot on the bill itself, because a bill has no parent chat to carry a report preview badge
        expect(getBadge(approvedBill, 172, 'bob@receiver.com', paymentPolicy)).toEqual({
            reason: CONST.REQUIRES_ATTENTION_REASONS.IS_WAITING_FOR_ASSIGNEE_TO_COMPLETE_ACTION,
            actionBadge: CONST.REPORT.ACTION_BADGE.PAY,
        });
    });

    it('shows no Pay dot to users who cannot pay, or after payment', () => {
        // Given the same approved bill
        const paymentPolicy: Policy = {...policy, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES};
        const approvedBill: Report = {...submittedBill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};

        // When a member who isn't a payer checks it, or the owner checks it after paying it
        // Then neither sees the Pay green dot
        expect(getBadge(approvedBill, approverAccountID, approverEmail, paymentPolicy)?.actionBadge).not.toBe(CONST.REPORT.ACTION_BADGE.PAY);
        expect(getBadge({...approvedBill, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}, 172, 'bob@receiver.com', paymentPolicy)?.actionBadge).not.toBe(CONST.REPORT.ACTION_BADGE.PAY);
    });

    it('shows no Pay dot on a bill whose linked invoice was deleted', () => {
        // Given an approved bill that its owner can pay, with name value pairs that have no invoiceID
        const paymentPolicy: Policy = {...policy, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES};
        const approvedBill: Report = {...submittedBill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};

        // When the Inbox checks whether the bill needs the owner's attention
        // Then only the linked bill gets the Pay dot, matching the header, which hides Pay on the unlinked bill
        expect(getBadge(approvedBill, 172, 'bob@receiver.com', paymentPolicy, {})?.actionBadge).not.toBe(CONST.REPORT.ACTION_BADGE.PAY);
        expect(getBadge(approvedBill, 172, 'bob@receiver.com', paymentPolicy, {invoiceID: 4321})?.actionBadge).toBe(CONST.REPORT.ACTION_BADGE.PAY);
    });
});
