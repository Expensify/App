import {
    isReportPreviewAction as isReportPreviewActionUtils,
    isSentMoneyReportAction as isSentMoneyReportActionUtils,
    isTransactionThread as isTransactionThreadUtils,
} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import useOnyx from './useOnyx';

type ReportAndReportAction = {
    report: Report;
    reportAction: ReportAction | undefined;
};

type ReportsAndReportActions = ReportAndReportAction[];

/**
 * Custom hook to retrieve all ancestor reports and their associated report actions for a given reportID.
 * It traverses up the report hierarchy using parentReportID and parentReportActionID.
 *
 * @param {string} reportID - The ID of the report for which to fetch ancestor reports and actions.
 * @param {boolean} includeTransactionThread - Whether to include transaction thread actions. Default is true.
 * @returns {Object} An object containing:
 *  - report: The current report object or undefined if not found.
 *  - ancestorReportsAndReportActions: An array of objects, each containing a report and its associated action (if any).
 */

function useAncestorReportAndReportActions(reportID: string, includeTransactionThread = true): {report: Report | undefined; ancestorReportsAndReportActions: ReportsAndReportActions} {
    const [ancestorReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: false,
        selector: (allReports) => {
            const reports: Record<string, Report> = {};
            if (!allReports) {
                return reports;
            }

            let currentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            while (currentReport?.parentReportID) {
                reports[currentReport.reportID] = currentReport;
                currentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${currentReport.parentReportID}`];
            }
            if (currentReport) {
                reports[currentReport.reportID] = currentReport;
            }
            return reports;
        },
    });

    const [ancestorReportsAndReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canBeMissing: false,
        selector: (allReportActions) => {
            if (!allReportActions || !ancestorReports) {
                return [];
            }

            let reportParentReportID = ancestorReports[reportID]?.parentReportID;
            let parentReportActionID = ancestorReports[reportID]?.parentReportActionID;
            const reportsAndReportActions: ReportsAndReportActions = [];

            while (reportParentReportID) {
                const parentReport = ancestorReports[reportParentReportID];
                if (!parentReport) {
                    break;
                }

                const parentReportAction = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportParentReportID}`]?.[`${parentReportActionID}`];

                // We need to reassign reportParentReportID and parentReportActionID here to avoid infinite loop in case of malformed data
                parentReportActionID = parentReport.parentReportActionID;
                reportParentReportID = parentReport?.parentReportID;

                if (includeTransactionThread || !parentReportAction) {
                    reportsAndReportActions.unshift({report: parentReport, reportAction: parentReportAction});
                    continue;
                }

                // Exclude transaction thread actions unless they are "report preview" or "sent money" actions
                const isTransactionThread = isTransactionThreadUtils(parentReportAction);
                const isReportPreviewAction = isReportPreviewActionUtils(parentReportAction);
                const isSentMoneyReportAction = isSentMoneyReportActionUtils(parentReportAction);

                if ((isTransactionThread && !isSentMoneyReportAction) || isReportPreviewAction) {
                    reportsAndReportActions.unshift({report: parentReport, reportAction: parentReportAction});
                }
            }

            return reportsAndReportActions;
        },
    });

    return {report: ancestorReports?.[reportID], ancestorReportsAndReportActions: ancestorReportsAndReportActions ?? []};
}

export type {ReportAndReportAction, ReportsAndReportActions};
export default useAncestorReportAndReportActions;
