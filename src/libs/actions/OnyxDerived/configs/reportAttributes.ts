import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {
    generateAllReportErrors,
    generateReportName,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    hasReportViolations,
    isReportOwner,
    isSettled,
    isValidReport,
    requiresAttentionFromCurrentUser,
    shouldDisplayViolationsRBRInLHN,
} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import hasKeyTriggeredCompute from '@userActions/OnyxDerived/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributes} from '@src/types/onyx';

let isFullyComputed = false;

/**
 * This derived value is used to get the report attributes for the report.
 */

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.NVP_PREFERRED_LOCALE,
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    ],
    compute: (dependencies, {currentValue, sourceValues}) => {
        // transactions are undefined by default so it needs to be set to an empty object as default
        const [reports, preferredLocale, personalDetails, transactions = {}, transactionViolations, reportActions, ...rest] = dependencies;

        const areAllDependenciesSet = [reports, preferredLocale, personalDetails, transactions, transactionViolations, reportActions, ...rest].every(
            (dependency) => dependency !== undefined,
        );
        if (!areAllDependenciesSet) {
            return {};
        }
        // if any of those keys changed, reset the isFullyComputed flag to recompute all reports
        if (hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, sourceValues) || hasKeyTriggeredCompute(ONYXKEYS.PERSONAL_DETAILS_LIST, sourceValues)) {
            isFullyComputed = false;
        }

        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];

        // if we already computed the report attributes and there is no new reports data, return the current value
        if ((isFullyComputed && reportUpdates === undefined) || !reports) {
            return currentValue ?? {};
        }

        const dataToIterate = isFullyComputed && reportUpdates !== undefined ? reportUpdates : reports ?? {};

        const reportAttributes = Object.keys(dataToIterate).reduce<Record<string, ReportAttributes>>((acc, reportID) => {
            // source value sends partial data, so we need an entire report object to do computations
            const report = reports[reportID];

            if (!report || !isValidReport(report)) {
                return acc;
            }

            const reportActionsList = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`];
            const isReportSettled = isSettled(report);
            const isCurrentUserReportOwner = isReportOwner(report);
            const doesReportHasViolations = hasReportViolations(report.reportID);
            const hasViolationsToDisplayInLHN = shouldDisplayViolationsRBRInLHN(report, transactionViolations);
            const hasAnyViolations = hasViolationsToDisplayInLHN || (!isReportSettled && isCurrentUserReportOwner && doesReportHasViolations);
            const reportErrors = generateAllReportErrors(report, reportActionsList);
            const reportActionsErrors = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActionsList);
            const oneTransactionThreadReportID = getOneTransactionThreadReportID(report.reportID, reportActionsList);
            const parentReportAction = report.parentReportActionID ? reportActionsList?.[report.parentReportActionID] : undefined;
            const requiresAttention = requiresAttentionFromCurrentUser(report, parentReportAction);

            let brickRoadStatus;
            // if report has errors or violations, show red dot
            if (SidebarUtils.hasAnyErrorsOrViolations(report, reportActionsList, hasAnyViolations, Object.entries(reportErrors ?? {}).length > 0, oneTransactionThreadReportID)) {
                brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
            }
            // if report does not have error, check if it should show green dot
            if (brickRoadStatus !== CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && requiresAttention) {
                brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
            }

            acc[report.reportID] = {
                reportName: generateReportName(report),
                reportErrors,
                reportActionsErrors,
                hasViolationsToDisplayInLHN,
                hasAnyViolations,
                oneTransactionThreadReportID,
                brickRoadStatus,
                requiresAttention,
            };

            return acc;
        }, currentValue ?? {});

        // mark the report attributes as fully computed after first iteration to avoid unnecessary recomputations on all objects
        if (reportUpdates === undefined && Object.keys(reports ?? {}).length > 0 && !isFullyComputed) {
            isFullyComputed = true;
        }

        return reportAttributes;
    },
});
