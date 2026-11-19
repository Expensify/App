/**
 * Report predicates that read only the report object and the current user's account ID. This file never imports ReportUtils,
 * so modules whose graph reaches ReportUtils (like TransactionUtils/violations) can use them without an import cycle.
 * ReportUtils keeps wrapper functions with the same names, so `import {isSettled} from '@libs/ReportUtils'` keeps working.
 */
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Returns true if report is still being processed
 */
function isProcessingReport(report: OnyxEntry<Report>): boolean {
    return report?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

function isIOUReport(report: OnyxInputOrEntry<Report> | null): boolean {
    return report?.type === CONST.REPORT.TYPE.IOU;
}

function isInvoiceReport(report: OnyxInputOrEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.INVOICE;
}

/**
 * Checks if the supplied report is an expense report in Open state and status.
 */
function isOpenExpenseReport(report: OnyxInputOrEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.EXPENSE && report?.stateNum === CONST.REPORT.STATE_NUM.OPEN && report?.statusNum === CONST.REPORT.STATUS_NUM.OPEN;
}

/**
 * Whether the Money Request report is settled.
 */
function isSettled(report: OnyxInputOrEntry<Report> | undefined): boolean {
    if (!report) {
        return false;
    }

    if (isEmptyObject(report)) {
        return false;
    }

    // In case the payment is scheduled and we are waiting for the payee to set up their wallet,
    // consider the report as paid as well.
    if (report.isWaitingOnBankAccount && report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED) {
        return false;
    }

    return report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
}

/**
 * Checks if the given user is the submitter of the report.
 */
function isCurrentUserSubmitter(report: OnyxEntry<Report>, currentUserAccountID: number | undefined): boolean {
    return !!report && report.ownerAccountID === currentUserAccountID;
}

/**
 * Checks if the given user is the manager of the supplied report.
 */
function isReportManager(report: OnyxEntry<Report>, currentUserAccountID: number | undefined): boolean {
    return !!(report && report.managerID === currentUserAccountID);
}

export {isProcessingReport, isIOUReport, isInvoiceReport, isOpenExpenseReport, isSettled, isCurrentUserSubmitter, isReportManager};
