/**
 * Decides which selected reports a bulk bank payment leaves out because nothing on them is owed.
 */
import CONST from '@src/CONST';
import type {LastPaymentMethod, Policy, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {getLastPolicyPaymentMethod, getPolicyFromSearchSnapshot, getReportFromSearchSnapshot, getReportType} from './actions/Search';
import {isBankPayBlockedBySpend, isIOUReport} from './ReportUtils';

type GetBankPaySkippedReportsParams = {
    /** The reports behind the selection, which repeat when several expenses of one report are selected */
    reportIDs: Array<string | undefined>;

    /** The payment method picked. Each report falls back to its workspace's last one when none was picked */
    paymentMethod: PaymentMethodType | undefined;

    /** Whether the payment is an ABA file, a bank payment even though it's sent as paid elsewhere */
    isABAPayment: boolean;

    searchData: SearchResultDataType | undefined;
    allReports: OnyxCollection<Report>;
    policies: OnyxCollection<Policy> | undefined;
    personalPolicyID: OnyxEntry<string>;
    lastPaymentMethods: OnyxEntry<LastPaymentMethod>;
};

/** Whether a bank payment leaves a selected report out because nothing on it is owed, judged by the report's own workspace */
function isSelectedReportBankPayBlocked(report: OnyxEntry<Report>, searchData: SearchResultDataType | undefined, policies: OnyxCollection<Policy> | undefined): boolean {
    return !!report && isBankPayBlockedBySpend(report, getPolicyFromSearchSnapshot(report.policyID, searchData, policies));
}

/** Returns the selected reports a bank payment leaves out, keyed by reportID. Marking as paid leaves none out */
function getBankPaySkippedReports({
    reportIDs,
    paymentMethod,
    isABAPayment,
    searchData,
    allReports,
    policies,
    personalPolicyID,
    lastPaymentMethods,
}: GetBankPaySkippedReportsParams): Map<string, Report> {
    const skippedReports = new Map<string, Report>();
    for (const reportID of new Set(reportIDs)) {
        const report = reportID ? getReportFromSearchSnapshot(reportID, searchData, allReports) : undefined;
        if (!reportID || !report) {
            continue;
        }
        const reportPaymentMethod = paymentMethod ?? getLastPolicyPaymentMethod(report.policyID, personalPolicyID, lastPaymentMethods, getReportType(report), isIOUReport(reportID));
        if (!isABAPayment && (!reportPaymentMethod || reportPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE)) {
            continue;
        }
        if (isSelectedReportBankPayBlocked(report, searchData, policies)) {
            skippedReports.set(reportID, report);
        }
    }
    return skippedReports;
}

export {getBankPaySkippedReports, isSelectedReportBankPayBlocked};
