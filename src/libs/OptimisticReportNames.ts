import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type {FormulaContext} from './Formula';
import {compute, FORMULA_PART_TYPES, parse} from './Formula';
import Log from './Log';
import type {WorkingUpdates, WorkingUpdateValue} from './OptimisticReportNamesCache';
import {getCachedPolicyByID, getCachedReportByID, getCachedReportNameValuePairsByID, getCachedTransactionByID} from './OptimisticReportNamesCache';
import type {UpdateContext} from './OptimisticReportNamesConnectionManager';
import Permissions from './Permissions';
import {isArchivedReport} from './ReportUtils';

/**
 * Get the object type from an Onyx key
 */
function determineObjectTypeByKey(key: string): 'report' | 'policy' | 'transaction' | 'reportNameValuePairs' | 'unknown' {
    if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
        return 'report';
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.POLICY)) {
        return 'policy';
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
        return 'transaction';
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS)) {
        return 'reportNameValuePairs';
    }
    return 'unknown';
}

/**
 * Extract report ID from an Onyx key
 */
function getReportIDFromKey(key: string): string {
    return key.replace(ONYXKEYS.COLLECTION.REPORT, '');
}

/**
 * Extract policy ID from an Onyx key
 */
function getPolicyIDFromKey(key: string): string {
    return key.replace(ONYXKEYS.COLLECTION.POLICY, '');
}

/**
 * Extract transaction ID from an Onyx key
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- this will be used in near future
function getTransactionIDFromKey(key: string): string {
    return key.replace(ONYXKEYS.COLLECTION.TRANSACTION, '');
}

/**
 * Extract report ID from a report name value pairs Onyx key
 */
function getReportIDFromRNVPKey(key: string): string {
    return key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, '');
}

/**
 * Generate the Onyx key for a report
 */
function getReportKey(reportID: string): OnyxKey {
    return `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as OnyxKey;
}

/**
 * Apply an Onyx update to the working updates cache
 */
function applyUpdateToCache(workingUpdates: WorkingUpdates, update: OnyxUpdate, context: UpdateContext): void {
    const key = update.key;

    switch (update.onyxMethod) {
        case Onyx.METHOD.SET:
            workingUpdates[key] = update.value as WorkingUpdateValue;
            break;
        case Onyx.METHOD.MERGE:
            // Get the current value (from cache or original context)
            const currentValue = workingUpdates[key] ?? getOriginalValueByKey(key, context);
            workingUpdates[key] = {...currentValue, ...(update.value as WorkingUpdateValue)} as WorkingUpdateValue;
            break;
        case Onyx.METHOD.CLEAR:
            delete workingUpdates[key];
            break;
        default:
            // Default to MERGE for safety
            const defaultCurrentValue = workingUpdates[key] ?? getOriginalValueByKey(key, context);
            workingUpdates[key] = {...defaultCurrentValue, ...(update.value as WorkingUpdateValue)} as WorkingUpdateValue;
            break;
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

/**
 * Get all reports associated with a policy ID
 */
function getReportsForNameComputation(policyID: string, allReports: Record<string, Report>, context: UpdateContext, workingUpdates: WorkingUpdates): Report[] {
    if (policyID === CONST.POLICY.ID_FAKE) {
        return [];
    }

    return Object.values(allReports)
        .map((originalReport) => {
            // Get cached report data if available
            return getCachedReportByID(originalReport.reportID, context, workingUpdates) ?? originalReport;
        })
        .filter((report) => {
            if (report?.policyID !== policyID) {
                return false;
            }

            // Filter by type - only reports that support custom names
            if (!isValidReportType(report.type)) {
                return false;
            }

            // Filter by state - exclude reports in high states (like approved or higher)
            const stateThreshold = CONST.REPORT.STATE_NUM.APPROVED;
            if (report.stateNum && report.stateNum > stateThreshold) {
                return false;
            }

            // Filter by isArchived - exclude archived reports using cached RNVP data
            const reportNameValuePairs = getCachedReportNameValuePairsByID(report.reportID, context, workingUpdates);
            if (isArchivedReport(reportNameValuePairs)) {
                return false;
            }

            return true;
        });
}

/**
 * Get the title field from report name value pairs
 */
function getTitleFieldFromRNVP(reportID: string, context: UpdateContext, workingUpdates: WorkingUpdates) {
    const reportNameValuePairs = getCachedReportNameValuePairsByID(reportID, context, workingUpdates);
    return reportNameValuePairs?.[CONST.REPORT.REPORT_TITLE_FIELD];
}

/**
 * Get the report associated with a transaction ID
 */
function getReportByTransactionID(transactionID: string, context: UpdateContext, workingUpdates: WorkingUpdates): Report | undefined {
    if (!transactionID) {
        return undefined;
    }

    const transaction = getCachedTransactionByID(transactionID, context, workingUpdates);

    if (!transaction?.reportID) {
        return undefined;
    }

    // Get the report using the transaction's reportID from context
    return getCachedReportByID(transaction.reportID, context, workingUpdates);
}

/**
 * Check if a report should have its name automatically computed
 */
function shouldComputeReportName(report: Report, policy: Policy | undefined, context: UpdateContext, workingUpdates: WorkingUpdates): boolean {
    // Only compute names for expense reports with policies that have title fields
    if (!report || !policy) {
        return false;
    }

    if (!isValidReportType(report.type)) {
        return false;
    }

    // Check if the report has text_title in rNVP - its presence indicates auto-generated names are allowed
    // If text_title is missing, it means the report was manually renamed and should preserve its custom name
    const titleField = getTitleFieldFromRNVP(report.reportID, context, workingUpdates);
    if (!titleField?.defaultValue) {
        return false;
    }
    return true;
}

function isValidReportType(reportType?: string): boolean {
    if (!reportType) {
        return false;
    }
    return (
        reportType === CONST.REPORT.TYPE.EXPENSE ||
        reportType === CONST.REPORT.TYPE.INVOICE ||
        reportType === CONST.REPORT.UNSUPPORTED_TYPE.BILL ||
        reportType === CONST.REPORT.UNSUPPORTED_TYPE.PAYCHECK ||
        reportType === 'trip'
    );
}

/**
 * Compute a new report name if needed based on an optimistic update
 */
function computeReportNameIfNeeded(report: Report | undefined, incomingUpdate: OnyxUpdate, context: UpdateContext, workingUpdates: WorkingUpdates): string | null {
    // If no report is provided, extract it from the update (for new reports)
    const targetReport = report ?? (incomingUpdate.value as Report);

    if (!targetReport) {
        return null;
    }

    const policy = getCachedPolicyByID(targetReport.policyID, context, workingUpdates);

    if (!shouldComputeReportName(targetReport, policy, context, workingUpdates)) {
        return null;
    }

    const titleField = getTitleFieldFromRNVP(targetReport.reportID, context, workingUpdates);
    if (!titleField?.defaultValue) {
        return null;
    }

    const updateType = determineObjectTypeByKey(incomingUpdate.key);
    const formula = titleField.defaultValue;
    const formulaParts = parse(formula);

    // Check if any formula part might be affected by this update
    const isAffected = formulaParts.some((part) => {
        if (part.type === FORMULA_PART_TYPES.REPORT) {
            // Checking if the formula part is affected in this manner works, but it could certainly be more precise.
            // For example, a policy update only affects the part if the formula in the policy changed, or if the report part references a field on the policy.
            // However, if we run into performance problems, this would be a good place to optimize.
            return updateType === 'report' || updateType === 'transaction' || updateType === 'policy' || updateType === 'reportNameValuePairs';
        }
        if (part.type === FORMULA_PART_TYPES.FIELD) {
            return updateType === 'report' || updateType === 'reportNameValuePairs';
        }
        return false;
    });

    if (!isAffected) {
        return null;
    }

    // Build context using cached data (which already includes the current update)
    const formulaContext: FormulaContext = {
        report: getCachedReportByID(targetReport.reportID, context, workingUpdates) ?? targetReport,
        policy: getCachedPolicyByID(targetReport.policyID, context, workingUpdates),
        transaction: updateType === 'transaction' ? getCachedTransactionByID((incomingUpdate.value as Transaction).transactionID, context, workingUpdates) : undefined,
    };

    const newName = compute(formula, formulaContext, workingUpdates, context);

    // Only return an update if the name actually changed
    if (newName && newName !== targetReport.reportName) {
        Log.info('[OptimisticReportNames] Report name computed', false, {
            updateType,
            isNewReport: !report,
        });

        return newName;
    }

    return null;
}

/**
 * Update optimistic report names based on incoming updates
 * This is the main middleware function that processes optimistic data
 */
function updateOptimisticReportNamesFromUpdates(updates: OnyxUpdate[], context: UpdateContext): OnyxUpdate[] {
    const {betas, allReports, betaConfiguration} = context;

    // Check if the feature is enabled
    if (!Permissions.isBetaEnabled(CONST.BETAS.AUTH_AUTO_REPORT_TITLE, betas, betaConfiguration)) {
        return updates;
    }

    Log.info('[OptimisticReportNames] Processing optimistic updates for report names', false, {
        updatesCount: updates.length,
    });

    const additionalUpdates: OnyxUpdate[] = [];
    const workingUpdates: WorkingUpdates = {};

    for (const update of updates) {
        const objectType = determineObjectTypeByKey(update.key);

        switch (objectType) {
            case 'report': {
                // Apply this update to the working cache FIRST
                // so all subsequent cached lookups will include this update
                applyUpdateToCache(workingUpdates, update, context);
                const reportID = getReportIDFromKey(update.key);
                const report = getCachedReportByID(reportID, context, workingUpdates);

                // Handle both existing and new reports with the same function
                const reportNameUpdate = computeReportNameIfNeeded(report, update, context, workingUpdates);

                if (reportNameUpdate) {
                    additionalUpdates.push({
                        key: getReportKey(reportID),
                        onyxMethod: Onyx.METHOD.MERGE,
                        value: {
                            reportName: reportNameUpdate,
                        },
                    });
                }
                break;
            }

            case 'policy': {
                // Apply this update to the working cache FIRST
                // so all subsequent cached lookups will include this update
                applyUpdateToCache(workingUpdates, update, context);
                const policyID = getPolicyIDFromKey(update.key);
                const affectedReports = getReportsForNameComputation(policyID, allReports, context, workingUpdates);
                for (const report of affectedReports) {
                    const reportNameUpdate = computeReportNameIfNeeded(report, update, context, workingUpdates);

                    if (reportNameUpdate) {
                        additionalUpdates.push({
                            key: getReportKey(report.reportID),
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                reportName: reportNameUpdate,
                            },
                        });
                    }
                }
                break;
            }

            case 'transaction': {
                // Apply this update to the working cache FIRST
                // so all subsequent cached lookups will include this update
                applyUpdateToCache(workingUpdates, update, context);
                let report: Report | undefined;
                const transactionUpdate = update.value as Partial<Transaction>;
                if (transactionUpdate.reportID) {
                    report = getCachedReportByID(transactionUpdate.reportID, context, workingUpdates);
                } else {
                    report = getReportByTransactionID(getTransactionIDFromKey(update.key), context, workingUpdates);
                }

                if (report) {
                    const reportNameUpdate = computeReportNameIfNeeded(report, update, context, workingUpdates);

                    if (reportNameUpdate) {
                        additionalUpdates.push({
                            key: getReportKey(report.reportID),
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                reportName: reportNameUpdate,
                            },
                        });
                    }
                }
                break;
            }

            case 'reportNameValuePairs': {
                // Apply this update to the working cache FIRST
                // so all subsequent cached lookups will include this update
                applyUpdateToCache(workingUpdates, update, context);
                const reportID = getReportIDFromRNVPKey(update.key);
                const report = getCachedReportByID(reportID, context, workingUpdates);

                if (report) {
                    const reportNameUpdate = computeReportNameIfNeeded(report, update, context, workingUpdates);

                    if (reportNameUpdate) {
                        additionalUpdates.push({
                            key: getReportKey(report.reportID),
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: {
                                reportName: reportNameUpdate,
                            },
                        });
                    }
                }
                break;
            }

            default:
                continue;
        }
    }

    Log.info('[OptimisticReportNames] Processing completed', false, {
        additionalUpdatesCount: additionalUpdates.length,
    });

    return updates.concat(additionalUpdates);
}

export {computeReportNameIfNeeded, getReportByTransactionID, shouldComputeReportName, updateOptimisticReportNamesFromUpdates};
export type {UpdateContext};
