/** Shared rules for who can approve and pay bills. */
import CONST from '@src/CONST';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {arePaymentsEnabled} from './PolicyUtils';

function isBillReport(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.BILL;
}

function isBillPayReport(report: OnyxEntry<Report>, accountID: number): boolean {
    if (!report || report.isHiddenForBillReceiver) {
        return false;
    }

    // Search results carry Auth's isBillPayReport flag. Other reports don't, so this falls back to Auth's rule that the
    // receiver of an invoice pays it through Bill Pay.
    return isBillReport(report) || (report.type === CONST.REPORT.TYPE.INVOICE && (report.isBillPayReport ?? report.managerID === accountID));
}

function canApproveBill(report: OnyxEntry<Report>, accountID: number): boolean {
    return isBillReport(report) && report?.managerID === accountID && report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

function canPayBill(report: OnyxEntry<Report>, policy: OnyxEntry<Policy> | null, accountID: number, email: string): boolean {
    // Bills and invoices store the amount owed as a negative total, so a total of zero or more leaves nothing to pay
    if (
        !isBillPayReport(report, accountID) ||
        !report ||
        report.isWaitingOnBankAccount ||
        (report.total ?? 0) >= 0 ||
        !!policy?.archivedDate ||
        policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
    ) {
        return false;
    }
    if (report.type === CONST.REPORT.TYPE.INVOICE) {
        return report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
    }
    if (!arePaymentsEnabled(policy)) {
        return false;
    }
    const isFinallyApproved =
        report.stateNum === CONST.REPORT.STATE_NUM.APPROVED && (report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED || report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED);

    // Canceling a payment on a workspace with approvals turned off leaves the bill Submitted and Closed, and it can be paid again.
    const isCanceledWithoutApproval =
        report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED && policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    if (!isFinallyApproved && !isCanceledWithoutApproval) {
        return false;
    }
    const reimburser = policy?.reimburser ?? policy?.achAccount?.reimburser;
    return reimburser ? reimburser === email : policy?.role === CONST.POLICY.ROLE.ADMIN;
}

export {isBillReport, isBillPayReport, canApproveBill, canPayBill};
