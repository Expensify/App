import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, BetaConfiguration, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type {FormulaContext} from './Formula';
import {compute} from './Formula';
import {isArchivedReport} from './ReportUtils';

type UpdateContext = {
    betas: OnyxEntry<Beta[]>;
    betaConfiguration: OnyxEntry<BetaConfiguration>;
    policies: Record<string, Policy>;
    reportNameValuePairs: Record<string, ReportNameValuePairs>;
    transactions: Record<string, Transaction>;
};

/**
 * Get the title field from report name value pairs
 */
function getTitleFieldFromRNVP(reportID: string, context: UpdateContext) {
    const key = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}` as OnyxKey;
    return context.reportNameValuePairs[key]?.expensify_text_title;
}

/**
 * Get policy by ID from the policies collection
 */
function getPolicyByID(policyID: string | undefined, context: UpdateContext): Policy | undefined {
    if (!policyID) {
        return;
    }

    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as OnyxKey;
    return context.policies[key];
}

/**
 * Check if a report should have its name automatically computed
 */
function shouldComputeReportName(report: Report, context: UpdateContext): boolean {
    if (!report) {
        return false;
    }

    if (!isValidReportType(report.type)) {
        return false;
    }

    // Only compute names for expense reports with policies that have title fields
    // Check if the report has a title field with a formula in rNVP
    const reportTitleField = getTitleFieldFromRNVP(report.reportID, context);
    return !!reportTitleField?.defaultValue;
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
 * Get all reports that are affected by changes in source values and need name recomputation
 * This analyzes which Onyx keys changed and determines which reports might be affected
 *
 * @param sourceValues - The changed Onyx keys from the derived value context
 * @param allReports - All reports in the system
 * @param reportNameValuePairs - All report name value pairs in the system
 * @returns Set of report IDs that need their names recomputed
 */
function getAffectedReportIDs(
    sourceValues: Partial<{
        [key: string]: unknown;
    }>,
    allReports: Record<string, Report>,
    reportNameValuePairs: Record<string, ReportNameValuePairs>,
): Set<string> {
    const affectedReportIDs = new Set<string>();

    // Extract updates by type
    const reportUpdates = sourceValues[ONYXKEYS.COLLECTION.REPORT] as Record<string, Report> | undefined;
    const transactionUpdates = sourceValues[ONYXKEYS.COLLECTION.TRANSACTION] as Record<string, Transaction> | undefined;
    const policyUpdates = sourceValues[ONYXKEYS.COLLECTION.POLICY] as Record<string, Policy> | undefined;
    const reportNameValuePairsUpdates = sourceValues[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS] as Record<string, ReportNameValuePairs> | undefined;

    // 1. Handle direct report updates
    if (reportUpdates) {
        for (const reportKey of Object.keys(reportUpdates)) {
            const reportID = reportKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
            const report = allReports[reportKey];

            // Only add if the report should have computed names
            if (report && shouldComputeReportNameForReport(report, reportNameValuePairs)) {
                affectedReportIDs.add(reportID);
            }
        }
    }

    // 2. Handle report name value pairs updates
    if (reportNameValuePairsUpdates) {
        for (const rnvpKey of Object.keys(reportNameValuePairsUpdates)) {
            const reportID = rnvpKey.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, '');
            const report = allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

            if (report && shouldComputeReportNameForReport(report, reportNameValuePairs)) {
                affectedReportIDs.add(reportID);
            }
        }
    }

    // 3. Handle transaction updates - find reports that use these transactions
    if (transactionUpdates) {
        for (const transactionKey of Object.keys(transactionUpdates)) {
            const transaction = transactionUpdates[transactionKey];
            if (transaction?.reportID) {
                const report = allReports[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
                if (report && shouldComputeReportNameForReport(report, reportNameValuePairs)) {
                    affectedReportIDs.add(transaction.reportID);
                }
            }
        }
    }

    // 4. Handle policy updates - find all reports under these policies
    if (policyUpdates) {
        for (const policyKey of Object.keys(policyUpdates)) {
            const policyID = policyKey.replace(ONYXKEYS.COLLECTION.POLICY, '');

            // Find all reports for this policy
            for (const reportKey of Object.keys(allReports)) {
                const report = allReports[reportKey];
                if (report?.policyID === policyID && shouldComputeReportNameForReport(report, reportNameValuePairs)) {
                    affectedReportIDs.add(report.reportID);
                }
            }
        }
    }

    return affectedReportIDs;
}

/**
 * Helper function to check if a report should have its name computed
 * This is a simplified version that works with current data (not updates)
 */
function shouldComputeReportNameForReport(report: Report, reportNameValuePairs: Record<string, ReportNameValuePairs>): boolean {
    if (!report) {
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
    const reportNameValuePair = reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];
    if (isArchivedReport(reportNameValuePair)) {
        return false;
    }

    // Only compute names for reports with title fields that have formulas
    const reportTitleField = reportNameValuePair?.expensify_text_title;
    if (!reportTitleField?.defaultValue) {
        return false;
    }

    return true;
}

/**
 * Compute a new report name if needed based on an optimistic update
 */
function computeReportName(report: Report, context: UpdateContext): string | null {
    const policy = getPolicyByID(report.policyID, context);

    if (!shouldComputeReportName(report, context)) {
        return null;
    }

    const titleField = getTitleFieldFromRNVP(report.reportID, context);

    const formula = titleField?.defaultValue;

    const formulaContext: FormulaContext = {
        report,
        policy,
    };

    return compute(formula, formulaContext);
}

export {computeReportName, shouldComputeReportName, getAffectedReportIDs, shouldComputeReportNameForReport};
export type {UpdateContext};
