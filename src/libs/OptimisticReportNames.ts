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
import {applyUpdateToCache, getCachedPolicyByID, getCachedReportByID, getCachedReportNameValuePairsByID, getCachedTransactionByID} from './OptimisticReportNamesCache';
import type {WorkingUpdates} from './OptimisticReportNamesCache';
import type {UpdateContext} from './OptimisticReportNamesConnectionManager';
import Permissions from './Permissions';
import {isArchivedReport} from './ReportUtils';

const UPDATE_TYPES = {
    REPORT: 'report',
    TRANSACTION: 'transaction',
    POLICY: 'policy',
    REPORT_NAME_VALUE_PAIRS: 'reportNameValuePairs',
} as const;

type UpdateType = (typeof UPDATE_TYPES)[keyof typeof UPDATE_TYPES];

/**
 * Get the title field from report name value pairs
 */
function getTitleFieldFromRNVP(reportID: string, context: UpdateContext, workingUpdates: WorkingUpdates) {
    const reportNameValuePairs = getCachedReportNameValuePairsByID(reportID, context, workingUpdates);
    return reportNameValuePairs?.expensify_text_title;
}

/**
 * Get the object type from an Onyx key
 */
function determineObjectTypeByKey(key: string): UpdateType | 'unknown' {
    if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
        return UPDATE_TYPES.REPORT;
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.POLICY)) {
        return UPDATE_TYPES.POLICY;
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
        return UPDATE_TYPES.TRANSACTION;
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS)) {
        return UPDATE_TYPES.REPORT_NAME_VALUE_PAIRS;
    }

    return 'unknown';
}

/**
 * Extract report ID from an Onyx key
 */
function getReportIDFromKey(key: string): string {
    return key.replace(ONYXKEYS.COLLECTION.REPORT, '').replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, '');
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
 * Get policy by ID from the policies collection
 */
function getPolicyByID(policyID: string | undefined, context: UpdateContext, workingUpdates: WorkingUpdates): Policy | undefined {
    if (!policyID) {
        return;
    }
    return getCachedPolicyByID(policyID, context, workingUpdates);
}

/**
 * Get transaction by ID from the transactions collection
 */
function getTransactionByID(transactionID: string, context: UpdateContext, workingUpdates: WorkingUpdates): Transaction | undefined {
    return getCachedTransactionByID(transactionID, context, workingUpdates);
}

/**
 * Get all reports associated with a policy ID
 */
function getReportsForNameComputation(policyID: string, allReports: Record<string, Report>, context: UpdateContext): Report[] {
    if (policyID === CONST.POLICY.ID_FAKE) {
        return [];
    }
    return Object.values(allReports).filter((report) => {
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

        // Filter by isArchived - exclude archived reports
        const reportNameValuePairs = context.allReportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
        if (isArchivedReport(reportNameValuePairs)) {
            return false;
        }

        return true;
    });
}

/**
 * Get the report associated with a transaction ID
 */
function getReportIDByTransactionID(transactionID: string, context: UpdateContext, workingUpdates: WorkingUpdates): string | undefined {
    if (!transactionID) {
        return undefined;
    }

    const transaction = getTransactionByID(transactionID, context, workingUpdates);

    if (!transaction?.reportID) {
        return undefined;
    }

    return transaction.reportID;
}

/**
 * Generate the Onyx key for a report
 */
function getReportKey(reportID: string): OnyxKey {
    return `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as OnyxKey;
}

/**
 * Check if a report should have its name automatically computed
 */
function shouldComputeReportName(report: Report, context: UpdateContext, workingUpdates: WorkingUpdates): boolean {
    if (!report) {
        return false;
    }

    if (!isValidReportType(report.type)) {
        return false;
    }

    // Only compute names for expense reports with policies that have title fields
    // Check if the report has a title field with a formula in rNVP
    const reportTitleField = getTitleFieldFromRNVP(report.reportID, context, workingUpdates);
    if (!reportTitleField?.defaultValue) {
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
function computeReportNameIfNeeded(reportID: string, context: UpdateContext, incomingUpdate: OnyxUpdate, workingUpdates: WorkingUpdates): string | null {
    const targetReport = getCachedReportByID(reportID, context, workingUpdates);
    const updateType = determineObjectTypeByKey(incomingUpdate.key);

    if (!targetReport) {
        return null;
    }

    const policy = getPolicyByID(targetReport.policyID, context, workingUpdates);

    if (!shouldComputeReportName(targetReport, context, workingUpdates)) {
        return null;
    }

    const titleField = getTitleFieldFromRNVP(targetReport.reportID, context, workingUpdates);

    // Quick check: see if the update might affect the report name
    const formula = titleField?.defaultValue;
    const formulaParts = parse(formula);

    let transaction: Transaction | undefined;
    if (updateType === UPDATE_TYPES.TRANSACTION) {
        transaction = getTransactionByID(getTransactionIDFromKey(incomingUpdate.key), context, workingUpdates);
    }

    // Check if any formula part might be affected by this update
    const isAffected = formulaParts.some((part) => {
        if (part.type === FORMULA_PART_TYPES.REPORT) {
            // Checking if the formula part is affected in this manner works, but it could certainly be more precise.
            // For example, a policy update only affects the part if the formula in the policy changed, or if the report part references a field on the policy.
            // However, if we run into performance problems, this would be a good place to optimize.
            return updateType === UPDATE_TYPES.REPORT || updateType === UPDATE_TYPES.TRANSACTION || updateType === UPDATE_TYPES.POLICY || updateType === UPDATE_TYPES.REPORT_NAME_VALUE_PAIRS;
        }
        if (part.type === FORMULA_PART_TYPES.FIELD) {
            return updateType === UPDATE_TYPES.REPORT || updateType === UPDATE_TYPES.REPORT_NAME_VALUE_PAIRS;
        }
        return false;
    });

    if (!isAffected) {
        return null;
    }

    // Compute the new name
    const formulaContext: FormulaContext = {
        report: targetReport,
        policy,
        transaction,
        workingUpdates,
        updateContext: context,
    };

    const newName = compute(formula, formulaContext);

    // Only return an update if the name actually changed
    if (newName && newName !== targetReport.reportName) {
        Log.info('[OptimisticReportNames] Report name computed', false, {
            updateType,
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
    if (!Permissions.isBetaEnabled(CONST.BETAS.CUSTOM_REPORT_NAMES, betas, betaConfiguration)) {
        return updates;
    }

    Log.info('[OptimisticReportNames] Processing optimistic updates for report names', false, {
        updatesCount: updates.length,
    });

    const additionalUpdates: OnyxUpdate[] = [];
    let workingUpdates: WorkingUpdates = {};
    const affectedReports = new Map<
        string,
        {
            update: OnyxUpdate;
        }
    >();

    for (const update of updates) {
        const objectType = determineObjectTypeByKey(update.key);
        workingUpdates = applyUpdateToCache(workingUpdates, update, context);

        switch (objectType) {
            case 'report': {
                const reportID = getReportIDFromKey(update.key);
                affectedReports.set(reportID, {
                    update,
                });
                break;
            }

            case 'policy': {
                const policyID = getPolicyIDFromKey(update.key);
                const reports = getReportsForNameComputation(policyID, allReports, context);
                for (const report of reports) {
                    affectedReports.set(report.reportID, {update});
                }
                break;
            }

            case 'transaction': {
                let reportID: string | undefined;
                const transactionUpdate = update.value as Partial<Transaction>;

                if (transactionUpdate.reportID) {
                    reportID = transactionUpdate.reportID;
                } else {
                    reportID = getReportIDByTransactionID(getTransactionIDFromKey(update.key), context, workingUpdates);
                }
                if (reportID) {
                    affectedReports.set(reportID, {update});
                }
                break;
            }
            case 'reportNameValuePairs': {
                const reportID = getReportIDFromKey(update.key);

                if (reportID) {
                    affectedReports.set(reportID, {update});
                }
                break;
            }

            default:
                continue;
        }
    }

    for (const [reportID, {update}] of affectedReports) {
        const reportNameUpdate = computeReportNameIfNeeded(reportID, context, update, workingUpdates);

        if (reportNameUpdate) {
            additionalUpdates.push({
                key: getReportKey(reportID),
                onyxMethod: Onyx.METHOD.MERGE,
                value: {
                    reportName: reportNameUpdate,
                },
            });
        }
    }

    Log.info('[OptimisticReportNames] Processing completed', false, {
        additionalUpdatesCount: additionalUpdates.length,
    });

    return updates.concat(additionalUpdates);
}

export {computeReportNameIfNeeded, shouldComputeReportName, updateOptimisticReportNamesFromUpdates};
export type {UpdateContext};
