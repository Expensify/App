/** Shared eligibility rules for Bills, Home, Inbox, and report actions. */
import CONST from '@src/CONST';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function isBillReport(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.BILL;
}

function isBillPayReport(report: OnyxEntry<Report>, accountID: number): boolean {
    if (!report || report.isHiddenForBillReceiver) {
        return false;
    }
    return isBillReport(report) || (report.type === CONST.REPORT.TYPE.INVOICE && (report.isBillPayReport ?? (!report.billID && report.managerID === accountID)));
}

function canApproveBill(report: OnyxEntry<Report>, accountID: number): boolean {
    return isBillReport(report) && report?.managerID === accountID && report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

function canPayBill(report: OnyxEntry<Report>, policy: OnyxEntry<Policy> | null, accountID: number, email: string): boolean {
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
    if (report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED || (report.statusNum !== CONST.REPORT.STATUS_NUM.APPROVED && report.statusNum !== CONST.REPORT.STATUS_NUM.CLOSED)) {
        return false;
    }
    const reimburser = policy?.reimburser ?? policy?.achAccount?.reimburser;
    return reimburser ? reimburser === email : policy?.role === CONST.POLICY.ROLE.ADMIN;
}

export {isBillReport, isBillPayReport, canApproveBill, canPayBill};
