import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import Timing from './actions/Timing';
import {compute, FORMULA_PART_TYPES, parse} from './Formula';
import type {FormulaContext} from './Formula';
import Log from './Log';
import type {UpdateContext} from './OptimisticReportNamesConnectionManager';
import Performance from './Performance';
import Permissions from './Permissions';
import {getTitleReportField, isArchivedReport} from './ReportUtils';

/**
 * Get the object type from an Onyx key
 */
function determineObjectTypeByKey(key: string): 'report' | 'policy' | 'transaction' | 'unknown' {
    if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
        return 'report';
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.POLICY)) {
        return 'policy';
    }
    if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
        return 'transaction';
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
 * Get report by ID from the reports collection
 */
function getReportByID(reportID: string, allReports: Record<string, Report>): Report | undefined {
    return allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
}

/**
 * Get policy by ID from the policies collection
 */
function getPolicyByID(policyID: string | undefined, allPolicies: Record<string, Policy>): Policy | undefined {
    if (!policyID) {
        return;
    }
    return allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
}

/**
 * Get transaction by ID from the transactions collection
 */
function getTransactionByID(transactionID: string, allTransactions: Record<string, Transaction>): Transaction | undefined {
    return allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
}

/**
 * Get all reports associated with a policy ID
 */
function getReportsByPolicyID(policyID: string, allReports: Record<string, Report>, context: UpdateContext): Report[] {
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
function getReportByTransactionID(transactionID: string, context: UpdateContext): Report | undefined {
    if (!transactionID) {
        return undefined;
    }

    const transaction = getTransactionByID(transactionID, context.allTransactions);

    if (!transaction?.reportID) {
        return undefined;
    }

    // Get the report using the transaction's reportID from context
    return getReportByID(transaction.reportID, context.allReports);
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
function shouldComputeReportName(report: Report, policy: Policy | undefined): boolean {
    // Only compute names for expense reports with policies that have title fields
    if (!report || !policy) {
        return false;
    }

    // Check if the report is an expense report
    if (!isValidReportType(report.type)) {
        return false;
    }

    // Check if the policy has a title field with a formula
    const titleField = getTitleReportField(policy.fieldList ?? {});
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
function computeReportNameIfNeeded(report: Report | undefined, incomingUpdate: OnyxUpdate, context: UpdateContext): string | null {
    Performance.markStart(CONST.TIMING.COMPUTE_REPORT_NAME);
    Timing.start(CONST.TIMING.COMPUTE_REPORT_NAME);

    const {allPolicies} = context;

    // If no report is provided, extract it from the update (for new reports)
    const targetReport = report ?? (incomingUpdate.value as Report);

    if (!targetReport) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return null;
    }

    const policy = getPolicyByID(targetReport.policyID, allPolicies);

    if (!shouldComputeReportName(targetReport, policy)) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return null;
    }

    const titleField = getTitleReportField(policy?.fieldList ?? {});
    if (!titleField?.defaultValue) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return null;
    }

    // Quick check: see if the update might affect the report name
    const updateType = determineObjectTypeByKey(incomingUpdate.key);
    const formula = titleField.defaultValue;
    const formulaParts = parse(formula);

    let transaction: Transaction | undefined;
    if (updateType === 'transaction') {
        transaction = getTransactionByID((incomingUpdate.value as Transaction).transactionID, context.allTransactions);
    }

    // Check if any formula part might be affected by this update
    const isAffected = formulaParts.some((part) => {
        if (part.type === FORMULA_PART_TYPES.REPORT) {
            // Checking if the formula part is affected in this manner works, but it could certainly be more precise.
            // For example, a policy update only affects the part if the formula in the policy changed, or if the report part references a field on the policy.
            // However, if we run into performance problems, this would be a good place to optimize.
            return updateType === 'report' || updateType === 'transaction' || updateType === 'policy';
        }
        if (part.type === FORMULA_PART_TYPES.FIELD) {
            return updateType === 'report';
        }
        return false;
    });

    if (!isAffected) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return null;
    }

    // Build context with the updated data
    const updatedReport =
        updateType === 'report' && targetReport.reportID === getReportIDFromKey(incomingUpdate.key) ? {...targetReport, ...(incomingUpdate.value as Partial<Report>)} : targetReport;

    const updatedPolicy = updateType === 'policy' && targetReport.policyID === getPolicyIDFromKey(incomingUpdate.key) ? {...(policy ?? {}), ...(incomingUpdate.value as Policy)} : policy;

    const updatedTransaction = updateType === 'transaction' ? {...(transaction ?? {}), ...(incomingUpdate.value as Transaction)} : undefined;

    // Compute the new name
    const formulaContext: FormulaContext = {
        report: updatedReport,
        policy: updatedPolicy,
        transaction: updatedTransaction,
    };

    const newName = compute(formula, formulaContext);

    // Only return an update if the name actually changed
    if (newName && newName !== targetReport.reportName) {
        Log.info('[OptimisticReportNames] Report name computed', false, {
            reportID: targetReport.reportID,
            oldName: targetReport.reportName,
            newName,
            formula,
            updateType,
            isNewReport: !report,
        });

        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return newName;
    }

    Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
    Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
    return null;
}

/**
 * Update optimistic report names based on incoming updates
 * This is the main middleware function that processes optimistic data
 */
function updateOptimisticReportNamesFromUpdates(updates: OnyxUpdate[], context: UpdateContext): OnyxUpdate[] {
    Performance.markStart(CONST.TIMING.UPDATE_OPTIMISTIC_REPORT_NAMES);
    Timing.start(CONST.TIMING.UPDATE_OPTIMISTIC_REPORT_NAMES);

    const {betas, allReports, betaConfiguration} = context;

    // Check if the feature is enabled
    if (!Permissions.isBetaEnabled(CONST.BETAS.AUTH_AUTO_REPORT_TITLE, betas, betaConfiguration)) {
        Performance.markEnd(CONST.TIMING.UPDATE_OPTIMISTIC_REPORT_NAMES);
        Timing.end(CONST.TIMING.UPDATE_OPTIMISTIC_REPORT_NAMES);
        return updates;
    }

    Log.info('[OptimisticReportNames] Processing optimistic updates for report names', false, {
        updatesCount: updates.length,
    });

    const additionalUpdates: OnyxUpdate[] = [];

    for (const update of updates) {
        const objectType = determineObjectTypeByKey(update.key);

        switch (objectType) {
            case 'report': {
                const reportID = getReportIDFromKey(update.key);
                const report = getReportByID(reportID, allReports);

                // Handle both existing and new reports with the same function
                const reportNameUpdate = computeReportNameIfNeeded(report, update, context);

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
                const policyID = getPolicyIDFromKey(update.key);
                const affectedReports = getReportsByPolicyID(policyID, allReports, context);
                for (const report of affectedReports) {
                    const reportNameUpdate = computeReportNameIfNeeded(report, update, context);

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
                let report: Report | undefined;
                const transactionUpdate = update.value as Partial<Transaction>;
                if (transactionUpdate.reportID) {
                    report = getReportByID(transactionUpdate.reportID, allReports);
                } else {
                    report = getReportByTransactionID(getTransactionIDFromKey(update.key), context);
                }

                if (report) {
                    const reportNameUpdate = computeReportNameIfNeeded(report, update, context);

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
        totalUpdatesReturned: updates.length + additionalUpdates.length,
    });

    Performance.markEnd(CONST.TIMING.UPDATE_OPTIMISTIC_REPORT_NAMES);
    Timing.end(CONST.TIMING.UPDATE_OPTIMISTIC_REPORT_NAMES);

    return updates.concat(additionalUpdates);
}

export {updateOptimisticReportNamesFromUpdates, computeReportNameIfNeeded, shouldComputeReportName, getReportByTransactionID};
export type {UpdateContext};
