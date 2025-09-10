import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';
import type {UpdateContext} from './OptimisticReportNamesConnectionManager';

/**
 * Get report by ID, checking working updates cache first
 */
function getCachedReportByID(reportID: string, context: UpdateContext, workingUpdates: Record<string, any>): Report | undefined {
    const key = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
    return workingUpdates[key] ?? context.allReports[key];
}

/**
 * Get policy by ID, checking working updates cache first
 */
function getCachedPolicyByID(policyID: string | undefined, context: UpdateContext, workingUpdates: Record<string, any>): Policy | undefined {
    if (!policyID) {
        return;
    }
    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
    return workingUpdates[key] ?? context.allPolicies[key];
}

/**
 * Get transaction by ID, checking working updates cache first
 */
function getCachedTransactionByID(transactionID: string, context: UpdateContext, workingUpdates: Record<string, any>): Transaction | undefined {
    const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
    return workingUpdates[key] ?? context.allTransactions[key];
}

/**
 * Get report name value pairs by report ID, checking working updates cache first
 */
function getCachedReportNameValuePairsByID(reportID: string, context: UpdateContext, workingUpdates: Record<string, any>): ReportNameValuePairs | undefined {
    const key = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`;
    return workingUpdates[key] ?? context.allReportNameValuePairs[key];
}

export {getCachedReportByID, getCachedPolicyByID, getCachedTransactionByID, getCachedReportNameValuePairsByID};