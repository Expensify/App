/**
 * Functionality provided by this file should be only used in OptimisticReportNames context
 */
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';
import type {UpdateContext} from './OptimisticReportNamesConnectionManager';

/** Types that can be stored in workingUpdates cache */
type WorkingUpdateValue = Report | Policy | Transaction | ReportNameValuePairs;

/** Type for the workingUpdates cache */
type WorkingUpdates = Partial<Record<OnyxKey, WorkingUpdateValue>>;

/**
 * Get report by ID, checking working updates cache first
 */
function getCachedReportByID(reportID: string, context: UpdateContext, workingUpdates: WorkingUpdates): Report | undefined {
    const key = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as OnyxKey;
    return (workingUpdates[key] as Report) ?? context.allReports[key];
}

/**
 * Get policy by ID, checking working updates cache first
 */
function getCachedPolicyByID(policyID: string | undefined, context: UpdateContext, workingUpdates: WorkingUpdates): Policy | undefined {
    if (!policyID) {
        return;
    }
    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as OnyxKey;
    return (workingUpdates[key] as Policy) ?? context.allPolicies[key];
}

/**
 * Get transaction by ID, checking working updates cache first
 */
function getCachedTransactionByID(transactionID: string, context: UpdateContext, workingUpdates: WorkingUpdates): Transaction | undefined {
    const key = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as OnyxKey;
    return (workingUpdates[key] as Transaction) ?? context.allTransactions[key];
}

/**
 * Get report name value pairs by report ID, checking working updates cache first
 */
function getCachedReportNameValuePairsByID(reportID: string, context: UpdateContext, workingUpdates: WorkingUpdates): ReportNameValuePairs | undefined {
    const key = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}` as OnyxKey;
    return (workingUpdates[key] as ReportNameValuePairs) ?? context.allReportNameValuePairs[key];
}

/**
 * Apply an Onyx update to the working updates cache
 */
function applyUpdateToCache(workingUpdates: WorkingUpdates, update: OnyxUpdate, context: UpdateContext): WorkingUpdates {
    const key = update.key as OnyxKey;

    switch (update.onyxMethod) {
        case Onyx.METHOD.SET:
            return {
                ...workingUpdates,
                [key]: update.value as WorkingUpdateValue,
            };
        case Onyx.METHOD.MERGE: {
            // Get the current value (from cache or original context)
            const currentValue = workingUpdates[key] ?? getOriginalValueByKey(key, context);
            return {
                ...workingUpdates,
                [key]: {...currentValue, ...(update.value as WorkingUpdateValue)} as WorkingUpdateValue,
            };
        }
        case Onyx.METHOD.CLEAR: {
            const {[key]: removedItem, ...rest} = workingUpdates;
            return rest as WorkingUpdates;
        }
        default: {
            // Default to MERGE for safety
            const defaultCurrentValue = workingUpdates[key] ?? getOriginalValueByKey(key, context);
            return {
                ...workingUpdates,
                [key]: {...defaultCurrentValue, ...(update.value as WorkingUpdateValue)} as WorkingUpdateValue,
            };
        }
    }
}

/**
 * Get original value by key from context collections
 */
function getOriginalValueByKey(key: string, context: UpdateContext): WorkingUpdateValue | undefined {
    if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
        return context.allReports[key];
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.POLICY)) {
        return context.allPolicies[key];
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
        return context.allTransactions[key];
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS)) {
        return context.allReportNameValuePairs[key];
    }
    return undefined;
}

export {getCachedPolicyByID, getCachedReportByID, getCachedReportNameValuePairsByID, getCachedTransactionByID, applyUpdateToCache};
export type {WorkingUpdates, WorkingUpdateValue};
