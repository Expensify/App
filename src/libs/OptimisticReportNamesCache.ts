import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';
import type {UpdateContext} from './OptimisticReportNamesConnectionManager';

/** Types that can be stored in workingUpdates cache */
type WorkingUpdateValue = Report | Policy | Transaction | ReportNameValuePairs;

/** Type for the workingUpdates cache */
type WorkingUpdates = Record<string, WorkingUpdateValue>;

/**
 * Get report by ID, checking working updates cache first
 */
function getCachedReportByID(reportID: string, context: UpdateContext, workingUpdates: WorkingUpdates): Report | undefined {
    const key = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
    return (workingUpdates[key] as Report) ?? context.allReports[key];
}

/**
 * Get policy by ID, checking working updates cache first
 */
function getCachedPolicyByID(policyID: string | undefined, context: UpdateContext, workingUpdates: WorkingUpdates): Policy | undefined {
    if (!policyID) {
        return;
    }
    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
    return (workingUpdates[key] as Policy) ?? context.allPolicies[key];
}

/**
 * Get transaction by ID, checking working updates cache first
 */
function getCachedTransactionByID(transactionID: string, context: UpdateContext, workingUpdates: WorkingUpdates): Transaction | undefined {
    const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
    return (workingUpdates[key] as Transaction) ?? context.allTransactions[key];
}

/**
 * Get report name value pairs by report ID, checking working updates cache first
 */
function getCachedReportNameValuePairsByID(reportID: string, context: UpdateContext, workingUpdates: WorkingUpdates): ReportNameValuePairs | undefined {
    const key = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`;
    return (workingUpdates[key] as ReportNameValuePairs) ?? context.allReportNameValuePairs[key];
}

export {getCachedPolicyByID, getCachedReportByID, getCachedReportNameValuePairsByID, getCachedTransactionByID};
export type {WorkingUpdates, WorkingUpdateValue};
