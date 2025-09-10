import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isReportPreviewAction, isSentMoneyReportAction, isTransactionThread} from '@libs/ReportActionsUtils';
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
 * @param reportID - The ID of the report for which to fetch ancestor reports and actions.
 * @param includeTransactionThreadReportActions - Whether to include transaction-thread actions. Default is true.
 */

function useAncestorReportAndReportActions(
    reportID: string,
    includeTransactionThreadReportActions = true,
): {report: Report | undefined; ancestorReportsAndReportActions: ReportsAndReportActions} {
    const [ancestorReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: false,
        selector: (allReports) => {
            const reports: OnyxCollection<OnyxEntry<Report>> = {};
            if (!allReports) {
                return reports;
            }

            let currentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            while (currentReport?.parentReportID) {
                reports[`${ONYXKEYS.COLLECTION.REPORT}${currentReport.reportID}`] = currentReport;
                currentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${currentReport.parentReportID}`];
            }
            if (currentReport) {
                reports[`${ONYXKEYS.COLLECTION.REPORT}${currentReport.reportID}`] = currentReport;
            }
            return reports;
        },
    });

    const [ancestorReportsAndReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canBeMissing: false,
        selector: (allReportActions) => {
            const reportsAndReportActions: ReportsAndReportActions = [];

            let {parentReportID, parentReportActionID} = ancestorReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? {parentReportID: undefined, parentReportActionID: undefined};

            while (parentReportID) {
                const parentReport = ancestorReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
                if (!parentReport) {
                    break;
                }

                const parentReportAction = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`]?.[`${parentReportActionID}`];

                // Without reassigning `parentReportID` to the parent's own `parentReportID`, the loop keeps checking the same valid `parentReportID`,
                // causing an infinite loop and fails to traverses up the report hierarchy.
                parentReportID = parentReport.parentReportID;

                /*
                Besides `parentReportID`, as we traverse up the report hierarchy, we also need to reassign `parentReportActionID`
                to the parent's own `parentReportActionID`. Otherwise, the same report action will be pushed repeatedly, causing
                `ancestorReportsAndReportActions` to contain malformed data.

                Example of malformed data:
                Report 3 -> parentReportID = "r_2", parentReportActionID = "a_1"
                Report 2 -> parentReportID = "r_1", parentReportActionID = "a_1"
                Report 1 -> parentReportID = null,  parentReportActionID = "a_1"

                Resulting `ancestorReportsAndReportActions`:
                [
                    {"r_1": "a_1"},
                    {"r_2": "a_1"},
                    {"r_3": "a_1"},
                ]

                Where:
                    - "r_1" is the Report with reportID = "r_1"
                    - "a_1" is the ReportAction with reportActionID = "a_1"

                Problem:
                    - Every ancestor report is paired with the same report action (e.g., "a_1").
                    - The ancestor's report action does not reflect the true report-to-action relationship.

                Expected behavior:
                    - Each ancestor report should be paired with its own corresponding `parentReportActionID`.
                    - Ensure `ancestorReportsAndReportActions` reflects the true report-to-action relationships.
                */
                parentReportActionID = parentReport.parentReportActionID;

                // When transaction-thread actions are included, we insert the parent report and its action without checking the action type.
                // We also insert it if the `parentReportAction` is undefined.
                if (includeTransactionThreadReportActions || !parentReportAction) {
                    reportsAndReportActions.unshift({report: parentReport, reportAction: parentReportAction});
                }

                // We exclude ancestor reports when their parent's ReportAction is a transaction-thread action,
                // except for sent-money and report-preview actions. ReportActionsListItemRenderer does not render
                // the ReportActionItemParentAction when the parent (first) action is a transaction-thread (unless it's a sent-money action)
                // or a report-preview action, so we skip those ancestors to match the renderer's behavior.
                const shouldIncludAncestorReportAndReportAction =
                    (!isTransactionThread(parentReportAction) || isSentMoneyReportAction(parentReportAction)) && !isReportPreviewAction(parentReportAction);
                if (shouldIncludAncestorReportAndReportAction) {
                    reportsAndReportActions.unshift({report: parentReport, reportAction: parentReportAction});
                }
            }
            return reportsAndReportActions;
        },
    });

    return {report: ancestorReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`], ancestorReportsAndReportActions: ancestorReportsAndReportActions ?? []};
}

export type {ReportAndReportAction, ReportsAndReportActions};
export default useAncestorReportAndReportActions;
