import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {isReportPreviewAction, isSentMoneyReportAction, isTransactionThread} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type Report from '@src/types/onyx/Report';
import type ReportsAndReportAction from './types';

/**
 * Custom hook to retrieve all ancestor reports and their associated report actions for a given reportID.
 * It traverses up the report hierarchy using parentReportID and parentReportActionID.
 *
 * @param reportID - The ID of the report for which to fetch ancestor reports and actions.
 * @param includeTransactionThreads - Whether to include transaction thread.
 */

function useAncestorReportsAndReportActions(
    reportID: string,
    includeTransactionThreadReportActions = false,
): {report: OnyxEntry<Report>; ancestorReportsAndReportActions: ReportsAndReportAction[]} {
    const [ancestorReports] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            canBeMissing: false,
            selector: (allReports) => {
                const reports: OnyxCollection<OnyxEntry<Report>> = {};
                let currentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                while (currentReport) {
                    reports[`${ONYXKEYS.COLLECTION.REPORT}${currentReport.reportID}`] = currentReport;
                    currentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReport.parentReportID}`];
                }
                return reports;
            },
        },
        [reportID],
    );

    const [ancestorReportsAndReportActions] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        {
            canBeMissing: false,
            selector: (allReportActions) => {
                const reportsAndReportActions: ReportsAndReportAction[] = [];

                let {parentReportID, parentReportActionID} = ancestorReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? {parentReportID: undefined, parentReportActionID: undefined};

                while (parentReportID) {
                    const parentReport = ancestorReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
                    const parentReportAction = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`]?.[`${parentReportActionID}`];

                    if (
                        !parentReport ||
                        !parentReportAction ||
                        // We exclude ancestor reports when their parent's ReportAction is a transaction-thread action,
                        // except for sent-money and report-preview actions. ReportActionsListItemRenderer does not render
                        // the ReportActionItemParentAction when the parent (first) action is a transaction-thread (unless it's a sent-money action)
                        // or a report-preview action, so we skip those ancestors to match the renderer's behavior.
                        (!includeTransactionThreadReportActions &&
                            ((isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction)) || isReportPreviewAction(parentReportAction)))
                    ) {
                        break;
                    }

                    // `unshift` to maintain the order from the top-most ancestor down to the immediate parent.
                    reportsAndReportActions.unshift({report: parentReport, reportAction: parentReportAction});

                    /*
                    As we traverse up the report hierarchy, we need to reassign `parentReportActionID`
                    to the parent's own `parentReportActionID`. Otherwise, the same report action will be pushed repeatedly, causing
                    `ancestorReportsAndReportActions` to contain malformed data.

                    Example of malformed data, assuming we don't reassign `parentReportActionID` and Report 4 is the report with the reportID provided:
                    Report 4 -> parentReportID = "r_3", parentReportActionID = "a_3": (initially it's okay)
                    Report 3 -> parentReportID = "r_2", parentReportActionID = "a_3": (should be "a_2")
                    Report 2 -> parentReportID = "r_1", parentReportActionID = "a_3": (should be "a_1")
                    Report 1 -> parentReportID = null,  parentReportActionID = "a_3": (should be null)

                    Resulting `ancestorReportsAndReportActions`:
                    [
                        {"r_1": "a_3"},
                        {"r_2": "a_3"},
                        {"r_3": "a_3"},
                    ]
                    
                    Expected `ancestorReportsAndReportActions`:
                    [
                        {"r_1": "a_1"},
                        {"r_2": "a_2"},
                        {"r_3": "a_3"},
                    ]

                    Where in `ancestorReportsAndReportActions`:
                        - "r_1" is the Report with reportID = "r_1"
                        - "a_1" is the ReportAction with reportActionID = "a_1"

                    Problem:
                        - Every ancestor report is paired with the same report action (e.g., "a_3").
                        - The ancestor's report action does not reflect the true report-to-action relationship.

                    Expected behavior:
                        - Each ancestor report should be paired with its own corresponding `parentReportActionID`.
                        - Ensure `ancestorReportsAndReportActions` reflects the true report-to-action relationships.
                    */
                    parentReportActionID = parentReport.parentReportActionID;

                    // Without reassigning `parentReportID` to the parent's own `parentReportID`, the loop keeps checking the same valid `parentReportID`,
                    // causing an infinite loop and fails to traverses up the report hierarchy.
                    parentReportID = parentReport.parentReportID;
                }
                return reportsAndReportActions;
            },
        },
        [reportID, ancestorReports, includeTransactionThreadReportActions],
    );

    return {report: ancestorReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`], ancestorReportsAndReportActions: ancestorReportsAndReportActions ?? []};
}

export default useAncestorReportsAndReportActions;
