/**
 * Follows the payments of a Search bulk pay click, so the reports left unpaid because the bank account needs global
 * reimbursements are listed in one modal once every payment has a response. Those are the reports the client skipped
 * before paying and the ones the backend rejected. Writes go through the SequentialQueue, so Search can't wait for the
 * responses itself. GlobalReimbursementPayError reports each one here instead.
 *
 * The clicks are kept in memory, because only the tab that sends the requests gets their responses.
 */
import type {EnableGlobalReimbursementsModal} from '@src/types/onyx';

import {showEnableGlobalReimbursementsModal} from './App';

type BulkPay = {
    /** The bank account every expense report of the click is paid from */
    bankAccount: EnableGlobalReimbursementsModal;

    /** The names of the reports whose payment has no response yet, keyed by reportID */
    pendingReportNames: Map<string, string>;
    unpaidReportNames: string[];
    hasPaidReports: boolean;
};

type BulkPayParams = Pick<BulkPay, 'bankAccount' | 'pendingReportNames' | 'hasPaidReports'> & {
    /** The names of the reports the client didn't pay because the bank account needs global reimbursements */
    skippedReportNames: string[];
};

type PaymentOutcome = {
    isPaid: boolean;

    /** Whether the backend rejected the payment because the bank account needs global reimbursements */
    needsGlobalReimbursements: boolean;
};

// Each click is followed on its own, so one whose payment never gets a response doesn't hold back the clicks after it
const bulkPays = new Set<BulkPay>();

function showUnpaidReportsIfSettled(bulkPay: BulkPay) {
    if (bulkPay.pendingReportNames.size > 0) {
        return;
    }
    bulkPays.delete(bulkPay);

    const {bankAccount, unpaidReportNames, hasPaidReports} = bulkPay;
    if (unpaidReportNames.length === 0) {
        return;
    }

    // Nothing was paid, so there is nothing to list next to the unpaid reports. Open the intro directly, the same way paying a single report does
    const {accountNumber, ...introData} = bankAccount;
    showEnableGlobalReimbursementsModal(hasPaidReports ? {...bankAccount, unpaidReportNames} : {...introData, isPayingMultipleReports: unpaidReportNames.length > 1});
}

/** Starts following a bulk pay click. Call it before sending the payments, so no response is missed. */
function followGlobalReimbursementsBulkPay({bankAccount, pendingReportNames, skippedReportNames, hasPaidReports}: BulkPayParams) {
    // A report can't be paid again while its payment is in flight, so an earlier click that still waits for one of these reports never got its response.
    // Forget it, or the response of this click would settle that one instead.
    for (const earlierBulkPay of bulkPays) {
        if ([...pendingReportNames.keys()].some((reportID) => earlierBulkPay.pendingReportNames.has(reportID))) {
            bulkPays.delete(earlierBulkPay);
        }
    }

    const bulkPay = {bankAccount, pendingReportNames: new Map(pendingReportNames), unpaidReportNames: [...skippedReportNames], hasPaidReports};
    bulkPays.add(bulkPay);
    showUnpaidReportsIfSettled(bulkPay);
}

/**
 * Records the response of a payment.
 *
 * @returns whether the payment belongs to a bulk pay click, which then lists the report itself if it was rejected
 */
function settleGlobalReimbursementsBulkPayReport(reportID: string, {isPaid, needsGlobalReimbursements}: PaymentOutcome): boolean {
    for (const bulkPay of bulkPays) {
        const reportName = bulkPay.pendingReportNames.get(reportID);
        if (reportName === undefined) {
            continue;
        }
        bulkPay.pendingReportNames.delete(reportID);
        bulkPay.hasPaidReports ||= isPaid;
        if (needsGlobalReimbursements) {
            bulkPay.unpaidReportNames.push(reportName);
        }
        showUnpaidReportsIfSettled(bulkPay);
        return true;
    }
    return false;
}

export {followGlobalReimbursementsBulkPay, settleGlobalReimbursementsBulkPayReport};
