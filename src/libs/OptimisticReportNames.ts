import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import Timing from './actions/Timing';
import * as Formula from './Formula';
import Log from './Log';
import {getUpdateContextAsync} from './OptimisticReportNamesConnectionManager';
import type {UpdateContext} from './OptimisticReportNamesConnectionManager';
import Performance from './Performance';
import Permissions from './Permissions';
import * as ReportUtils from './ReportUtils';

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
        if (ReportUtils.isArchivedReport(ReportUtils.getReportNameValuePairs(report?.reportID))) {
            return false;
        }

        return true;
    });
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
    if (!isValidReportType(report.type)) {
        return false;
    }

    // Check if the policy has a title field with a formula
    const titleField = ReportUtils.getTitleReportField(policy.fieldList ?? {});
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

    const policy = getPolicyByID(targetReport.policyID ?? '', allPolicies);
    if (!shouldComputeReportName(targetReport, policy)) {
        console.log('morwa cancel');
        Performance.markEnd(CONST.TIMING.COMPUTE_REPORT_NAME);
        Timing.end(CONST.TIMING.COMPUTE_REPORT_NAME);
        return null;
    }
    console.log('morwa continue');

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
            return updateType === 'report' || updateType === 'transaction' || updateType === 'policy';
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
    const updatedReport = updateType === 'report' && targetReport.reportID === getReportIDFromKey(incomingUpdate.key) ? {...targetReport, ...incomingUpdate.value} : targetReport;

    const updatedPolicy = updateType === 'policy' && targetReport.policyID === getPolicyIDFromKey(incomingUpdate.key) ? {...policy, ...incomingUpdate.value} : policy;

    // Compute the new name
    const formulaContext: Formula.FormulaContext = {
        report: updatedReport,
        policy: updatedPolicy,
    };

    const newName = Formula.compute(formula, formulaContext);

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

    Log.info('[OptimisticReportNames] Processing optimistic updates for report names', false, {
        updatesCount: updates.length,
        hasReports: Object.keys(context.allReports).length > 0,
        hasPolicies: Object.keys(context.allPolicies).length > 0,
    });

    const {betas, allReports} = context;

    // Check if the feature is enabled
    if (!Permissions.canUseCustomReportNames(betas)) {
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
                    value: {
                        reportName: reportNameUpdate,
                    },
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
 * Creates update context for optimistic report name processing.
 * This should be called before processing optimistic updates
 */
function createUpdateContext(): Promise<UpdateContext> {
    return getUpdateContextAsync();
}

export {updateOptimisticReportNamesFromUpdates, computeReportNameIfNeeded, createUpdateContext, shouldComputeReportName};
