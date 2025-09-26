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

/**
 * Checks whether the given value can be merged. It has to be an object, but not an array, RegExp or Date.
 * Based on react-native-onyx's isMergeableObject function.
 */
function isMergeableObject(value: unknown): value is Record<string, unknown> {
    const isNonNullObject = value != null && typeof value === 'object';
    return isNonNullObject && !(value instanceof RegExp) && !(value instanceof Date) && !Array.isArray(value);
}

/**
 * Deeply merges two objects using the same algorithm as react-native-onyx.
 * This is based on Onyx's internal fastMerge function.
 */
function deepMerge(target: Record<string, unknown> | undefined, change: Record<string, unknown> | undefined): Record<string, unknown> {
    // Handle null/undefined cases
    if (!change) {
        return target ?? {};
    }
    if (!target) {
        return change;
    }

    // Arrays and non-objects should replace, not merge
    if (Array.isArray(change) || typeof change !== 'object') {
        return change;
    }

    const result = {...target};

    // Merge source properties into target
    Object.keys(change).forEach((key) => {
        const sourceValue = change[key];
        const targetValue = target[key];

        if (sourceValue === undefined) {
            return;
        }

        // If source value is null, it should replace the target value
        if (sourceValue === null) {
            result[key] = null;
            return;
        }

        // If both values are mergeable objects, recursively merge them
        if (isMergeableObject(targetValue) && isMergeableObject(sourceValue)) {
            result[key] = deepMerge(targetValue, sourceValue);
            return;
        }

        // Otherwise, source value replaces target value
        result[key] = sourceValue;
    });

    return result;
}

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
        case Onyx.METHOD.MERGE_COLLECTION: {
            // Handle collection merge operations - merge data into multiple collection items
            // The value object contains full Onyx keys (e.g., report_123) as keys, not just item IDs
            const collectionData = update.value as Record<string, WorkingUpdateValue>;

            if (!collectionData || typeof collectionData !== 'object') {
                return workingUpdates;
            }

            const updatedCache = {...workingUpdates};

            // Iterate through each item in the collection data
            Object.entries(collectionData).forEach(([fullKey, itemValue]) => {
                const onyxKey = fullKey as OnyxKey;
                const currentValue = updatedCache[onyxKey] ?? getOriginalValueByKey(fullKey, context);

                // Merge the item value with existing data
                updatedCache[onyxKey] = deepMerge(currentValue as Record<string, unknown>, itemValue as Record<string, unknown>) as WorkingUpdateValue;
            });

            return updatedCache;
        }

        case Onyx.METHOD.SET_COLLECTION: {
            // Handle collection set operations - replace data in multiple collection items
            // The value object contains full Onyx keys (e.g., report_123) as keys, not just item IDs
            const collectionData = update.value as Record<string, WorkingUpdateValue>;

            if (!collectionData || typeof collectionData !== 'object') {
                return workingUpdates;
            }

            const collectionKey = update.key as string;
            const updatedCache = {...workingUpdates};

            // First, remove all existing keys for this collection from the cache
            Object.keys(updatedCache).forEach((objectKey) => {
                if (!objectKey.startsWith(collectionKey)) {
                    return;
                }
                delete updatedCache[objectKey as OnyxKey];
            });

            // Then, set the new values for the collection
            Object.entries(collectionData).forEach(([fullKey, itemValue]) => {
                const onyxKey = fullKey as OnyxKey;
                // Set the item value directly, replacing existing data
                updatedCache[onyxKey] = itemValue;
            });

            return updatedCache;
        }

        case Onyx.METHOD.MULTI_SET: {
            // Handle multi-set operations - set multiple individual keys across collections
            const multiSetData = update.value as Record<string, unknown>;

            if (!multiSetData || typeof multiSetData !== 'object') {
                return workingUpdates;
            }

            const updatedCache = {...workingUpdates};

            // Iterate through each key-value pair in the multi-set data
            Object.entries(multiSetData).forEach(([fullKey, itemValue]) => {
                const onyxKey = fullKey as OnyxKey;

                // Only cache values that are relevant to our working updates
                // Check if the key matches our supported collections
                const isRelevantKey =
                    fullKey.startsWith(ONYXKEYS.COLLECTION.REPORT) ||
                    fullKey.startsWith(ONYXKEYS.COLLECTION.POLICY) ||
                    fullKey.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) ||
                    fullKey.startsWith(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

                if (isRelevantKey && itemValue != null) {
                    updatedCache[onyxKey] = itemValue as WorkingUpdateValue;
                }
            });

            return updatedCache;
        }
        case Onyx.METHOD.MERGE:
        default: {
            // Get the current value (from cache or original context)
            const currentValue = workingUpdates[key] ?? getOriginalValueByKey(key, context);
            return {
                ...workingUpdates,
                [key]: deepMerge(currentValue as Record<string, unknown>, update.value as Record<string, unknown>) as WorkingUpdateValue,
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

export {getCachedPolicyByID, getCachedReportByID, getCachedReportNameValuePairsByID, getCachedTransactionByID, applyUpdateToCache, deepMerge};
export type {WorkingUpdates, WorkingUpdateValue};
