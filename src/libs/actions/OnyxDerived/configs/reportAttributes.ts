import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {
    generateReportName,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getAllReportErrors,
    hasReportViolations,
    isReportOwner,
    isSettled,
    shouldDisplayViolationsRBRInLHN,
} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributes} from '@src/types/onyx';

/**
 * This derived value is used to get the report attributes for the report.
 * Dependency on ONYXKEYS.PERSONAL_DETAILS_LIST is to ensure that the report attributes are generated after the personal details are available.
 */

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.PERSONAL_DETAILS_LIST, ONYXKEYS.NVP_PREFERRED_LOCALE, ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS],
    compute: ([reports, personalDetails, preferredLocale, reportActions, transactionViolations], {currentValue, sourceValues}) => {
        if (!reports || !personalDetails || !preferredLocale) {
            return {};
        }

        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];

        return Object.values(reportUpdates ?? reports).reduce<Record<string, ReportAttributes>>(
            (acc, report) => {
                if (!report) {
                    return acc;
                }

                const reportActionsList = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`];
                const isReportSettled = isSettled(report);
                const isCurrentUserReportOwner = isReportOwner(report);
                const doesReportHasViolations = hasReportViolations(report.reportID);
                const hasViolationsToDisplayInLHN = shouldDisplayViolationsRBRInLHN(report, transactionViolations);
                const hasAnyViolations = hasViolationsToDisplayInLHN || (!isReportSettled && isCurrentUserReportOwner && doesReportHasViolations);
                const reportErrors = getAllReportErrors(report, {});
                const reportActionsErrors = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActionsList);
                const oneTransactionThreadReportID = getOneTransactionThreadReportID(report.reportID, reportActionsList);

                acc[report.reportID] = {
                    reportName: generateReportName(report),
                    reportErrors,
                    reportActionsErrors,
                    hasViolationsToDisplayInLHN,
                    hasAnyViolations,
                    oneTransactionThreadReportID,
                };

                return acc;
            },
            reportUpdates && currentValue ? currentValue : {},
        );
    },
});
