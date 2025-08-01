import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Beta from '@src/types/onyx/Beta';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import Timing from './actions/Timing';
import * as Formula from './Formula';
import Log from './Log';
import Performance from './Performance';
import Permissions from './Permissions';
import * as ReportUtils from './ReportUtils';

type UpdateContext = {
    betas: OnyxEntry<Beta[]>;
    allReports: Record<string, Report>;
    allPolicies: Record<string, Policy>;
};

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
function getPolicyByID(policyID: string, allPolicies: Record<string, Policy>): Policy | undefined {
    return allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
}

/**
 * Get all reports associated with a policy ID
 */
function getReportsByPolicyID(policyID: string, allReports: Record<string, Report>): Report[] {
    return Object.values(allReports).filter((report) => report?.policyID === policyID);
}

/**
 * Get the report associated with a transaction ID
 */
function getReportByTransactionID(transactionID: string, allReports: Record<string, Report>): Report | undefined {
    // This is a simplified version - in reality, we'd need to look up the transaction
    // and get its reportID, but for now we'll return undefined
    // TODO: Implement proper transaction -> report lookup
    return undefined;
}

/**
 * Generate the Onyx key for a report
 */
function getReportKey(reportID: string): string {
    return `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
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
    if (!ReportUtils.isExpenseReport(report)) {
        return false;
    }

    // Check if the policy has a title field with a formula
    const titleField = ReportUtils.getTitleReportField(policy.fieldList ?? {});
    if (!titleField?.defaultValue) {
        return false;
    }

    // Check if the formula contains formula parts
    return Formula.isFormula(titleField.defaultValue);
}

/**
 * Compute a report name for a new report being created
 * This handles the case where the report doesn't exist in context yet
 */
function computeNameForNewReport(update: OnyxUpdate, context: UpdateContext): {reportName: string} | null {
    Performance.markStart(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
    Timing.start(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);

    Log.info('[OptimisticReportNames] Computing name for new report', false, {
        updateKey: update.key,
        reportID: (update.value as Report)?.reportID,
    });

    const {allPolicies} = context;

    // Extract the new report data from the update
    const newReport = update.value as Report;
    if (!newReport?.policyID) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
        return null;
    }

    const policy = getPolicyByID(newReport.policyID, allPolicies);
    if (!shouldComputeReportName(newReport, policy)) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
        return null;
    }

    const titleField = ReportUtils.getTitleReportField(policy?.fieldList ?? {});
    if (!titleField?.defaultValue) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
        return null;
    }

    // Build context for formula computation
    const formulaContext: Formula.FormulaContext = {
        report: newReport,
        policy,
    };

    const newName = Formula.compute(titleField.defaultValue, formulaContext);

    if (newName && newName !== newReport.reportName) {
        Log.info('[OptimisticReportNames] New report name computed successfully', false, {
            reportID: newReport.reportID,
            oldName: newReport.reportName,
            newName,
            formula: titleField.defaultValue,
        });

        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
        return {reportName: newName};
    }

    Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
    Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME_FOR_NEW_REPORT);
    return null;
}

/**
 * Compute a new report name if needed based on an optimistic update
 */
function computeReportNameIfNeeded(
    report: Report,
    incomingUpdate: OnyxUpdate,
    context: UpdateContext,
): {
    reportName: string;
} | null {
    Performance.markStart(CONST.TIMING.COMPUTE_REPORT_NAME);
    Timing.start(CONST.TIMING.COMPUTE_REPORT_NAME);

    const {allPolicies} = context;

    const policy = getPolicyByID(report.policyID ?? '', allPolicies);
    if (!shouldComputeReportName(report, policy)) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return null;
    }

    const titleField = ReportUtils.getTitleReportField(policy?.fieldList ?? {});
    if (!titleField?.defaultValue) {
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return null;
    }

    // Quick check: see if the update might affect the report name
    const updateType = determineObjectTypeByKey(incomingUpdate.key);
    const formula = titleField.defaultValue;
    const formulaParts = Formula.parse(formula);

    // Check if any formula part might be affected by this update
    const isAffected = formulaParts.some((part) => {
        if (part.type === Formula.FORMULA_PART_TYPES.REPORT) {
            return updateType === 'report' || updateType === 'transaction';
        }
        if (part.type === Formula.FORMULA_PART_TYPES.FIELD) {
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
    const updatedReport = updateType === 'report' && report.reportID === getReportIDFromKey(incomingUpdate.key) ? {...report, ...incomingUpdate.value} : report;

    const updatedPolicy = updateType === 'policy' && report.policyID === getPolicyIDFromKey(incomingUpdate.key) ? {...policy, ...incomingUpdate.value} : policy;

    // Compute the new name
    const formulaContext: Formula.FormulaContext = {
        report: updatedReport,
        policy: updatedPolicy,
    };

    const newName = Formula.compute(formula, formulaContext);

    // Only return an update if the name actually changed
    if (newName && newName !== report.reportName) {
        Log.info('[OptimisticReportNames] Report name computed for existing report', false, {
            reportID: report.reportID,
            oldName: report.reportName,
            newName,
            formula,
            updateType,
        });

        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return {reportName: newName};
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

    Log.info('[OptimisticReportNames] Processing optimistic updates for report names', false, {
        updatesCount: updates.length,
        hasReports: Object.keys(context.allReports).length > 0,
        hasPolicies: Object.keys(context.allPolicies).length > 0,
    });

    const {betas, allReports} = context;

    // Check if the feature is enabled
    // TODO: change this condition later (implemented only for testing purposes)
    if (false && !Permissions.canUseAuthAutoReportTitles(betas)) {
        Performance.markEnd(CONST.TIMING.UPDATE_OPTIMISTIC_REPORT_NAMES);
        Timing.end(CONST.TIMING.UPDATE_OPTIMISTIC_REPORT_NAMES);
        return updates;
    }

    const additionalUpdates: OnyxUpdate[] = [];

    for (const update of updates) {
        const objectType = determineObjectTypeByKey(update.key);
        let affectedReports: Report[] = [];

        switch (objectType) {
            case 'report': {
                const reportID = getReportIDFromKey(update.key);
                const report = getReportByID(reportID, allReports);

                // Special handling for new reports (SET method means new report creation)
                if (!report && update.onyxMethod === Onyx.METHOD.SET) {
                    Log.info('[OptimisticReportNames] Detected new report creation', false, {
                        reportID,
                        updateKey: update.key,
                    });
                    const reportNameUpdate = computeNameForNewReport(update, context);

                    if (reportNameUpdate) {
                        additionalUpdates.push({
                            key: getReportKey(reportID),
                            onyxMethod: Onyx.METHOD.MERGE,
                            value: reportNameUpdate,
                        });
                    }
                    continue; // Skip the normal processing for this update
                }

                if (report) {
                    affectedReports = [report];
                }
                break;
            }

            case 'policy': {
                const policyID = getPolicyIDFromKey(update.key);
                affectedReports = getReportsByPolicyID(policyID, allReports);
                break;
            }

            case 'transaction': {
                const transactionID = getTransactionIDFromKey(update.key);
                const report = getReportByTransactionID(transactionID, allReports);
                if (report) {
                    affectedReports = [report];
                }
                break;
            }

            default:
                continue;
        }

        for (const report of affectedReports) {
            const reportNameUpdate = computeReportNameIfNeeded(report, update, context);

            if (reportNameUpdate) {
                additionalUpdates.push({
                    key: getReportKey(report.reportID),
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: reportNameUpdate,
                });
            }
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

/**
 * Initialize the context needed for report name computation
 * This should be called before processing optimistic updates
 */
function createUpdateContext(): Promise<UpdateContext> {
    return new Promise((resolve) => {
        // Get all the data we need from Onyx
        const connectionID = Onyx.connect({
            key: ONYXKEYS.BETAS,
            callback: (betas) => {
                Onyx.disconnect(connectionID);

                // Also get reports and policies
                const reportsConnectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        Onyx.disconnect(reportsConnectionID);

                        const policiesConnectionID = Onyx.connect({
                            key: ONYXKEYS.COLLECTION.POLICY,
                            waitForCollectionCallback: true,
                            callback: (allPolicies) => {
                                Onyx.disconnect(policiesConnectionID);

                                resolve({
                                    betas,
                                    allReports: allReports ?? {},
                                    allPolicies: allPolicies ?? {},
                                });
                            },
                        });
                    },
                });
            },
        });
    });
}

export {updateOptimisticReportNamesFromUpdates, computeReportNameIfNeeded, computeNameForNewReport, createUpdateContext, shouldComputeReportName};

export type {UpdateContext};
