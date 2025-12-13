import type {OnyxUpdate} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type {FormulaContext} from './Formula';
import {compute, FORMULA_PART_TYPES, parse, requiresBackendComputation} from './Formula';
import Log from './Log';
import type {UpdateContext} from './OptimisticReportNamesConnectionManager';
import {getTitleReportField} from './ReportUtils';

type ReportNameUpdate = {
    name: string | undefined;
    isPending?: boolean;
};

/**
 * Temporary function to get the title field from a policy. Eventually we want to move this to report name value pairs.
 * @param policyId
 * @param context
 */
function getTitleFieldFromPolicy(policyId: string | undefined, context: UpdateContext) {
    if (!policyId) {
        return;
    }

    const policy = context.allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyId}`];
    if (!policy || !policy.fieldList) {
        return;
    }

    return getTitleReportField(policy.fieldList);
}

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
    // Check if the report has a title field with a formula in policy
    const policyTitleField = getTitleFieldFromPolicy(report.policyID, context);
    if (!policyTitleField?.defaultValue) {
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
function computeReportNameIfNeeded(report: Report | undefined, incomingUpdate: OnyxUpdate, context: UpdateContext): ReportNameUpdate | null {
    const {allPolicies, isOffline} = context;

    // If no report is provided, extract it from the update (for new reports)
    const targetReport = report ?? (incomingUpdate.value as Report);

    if (!targetReport) {
        return null;
    }

    const policy = getPolicyByID(targetReport.policyID, allPolicies);

    if (!shouldComputeReportName(targetReport, context)) {
        return null;
    }

    const titleField = getTitleFieldFromPolicy(targetReport.policyID, context);

    // Quick check: see if the update might affect the report name
    const updateType = determineObjectTypeByKey(incomingUpdate.key);
    const formula = titleField?.defaultValue;
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
        allTransactions: context.allTransactions,
    };

    // When we cannot properly compute the formula (e.g., currency conversion requires exchange rates),
    // computing while online causes flickering between incorrect optimistic values and correct backend values.
    // Return null to skip optimistic updates and let the backend provide the accurate result.
    if (requiresBackendComputation(formulaParts, formulaContext)) {
        if (!isOffline) {
            return null;
        }

        return {
            name: targetReport.reportName,
            isPending: true,
        };
    }

    const newName = compute(formula, formulaContext);

    // Only return an update if the name actually changed
    if (newName && newName !== targetReport.reportName) {
        Log.info('[OptimisticReportNames] Report name computed', false, {
            updateType,
            isNewReport: !report,
        });

        return {
            name: newName,
        };
    }

    return null;
}

export {computeReportNameIfNeeded, getReportByTransactionID, shouldComputeReportName};
export type {UpdateContext};
