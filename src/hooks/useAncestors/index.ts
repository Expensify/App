import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {isCurrentActionUnread} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

/**
 * Traverses up the report hierarchy from `parentReportID` until it finds the root report,
 * then returns the ancestor reports and their associated actions based on `parentReportActionID`.
 *
 * @param report - The report for which to fetch ancestor reports and actions.
 * @param excludeAncestorCallback - Callback to determine if an ancestor should be excluded.
 */

function useAncestors(report: OnyxEntry<Report>, excludeAncestorCallback: (parentReportAction: ReportAction, ancestors: Ancestor[]) => boolean = () => false): Ancestor[] {
    const [reportCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportDraftCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT, {canBeMissing: true});
    const [reportActionsCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    return useMemo(() => {
        const ancestors: Ancestor[] = [];
        if (!report || !reportActionsCollection || !(reportCollection ?? reportDraftCollection)) {
            return ancestors;
        }
        let {parentReportID, parentReportActionID} = report;

        // Traverse up the report hierarchy to collect ancestor reports and their associated report actions.
        while (parentReportID && parentReportActionID) {
            const parentReport = reportCollection?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`] ?? reportDraftCollection?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${parentReportID}`];
            const parentReportAction = reportActionsCollection[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`]?.[`${parentReportActionID}`];
            if (!parentReport || !parentReportAction || excludeAncestorCallback(parentReportAction, ancestors)) {
                return ancestors;
            }

            // To maintain the order from the top-most ancestor down to the immediate parent
            // we `unshift` (push) each ancestor to the start of the array.
            ancestors.unshift({
                report: parentReport,
                reportAction: parentReportAction,
                shouldDisplayNewMarker: isCurrentActionUnread(parentReport, parentReportAction),
            });

            /*
            As we traverse up the report hierarchy, we need to reassign `parentReportActionID`
            to the parent's own `parentReportActionID`. Otherwise, the same report action will be pushed repeatedly, causing
            `ancestors` to contain malformed data.

            Example of malformed data, assuming we don't reassign `parentReportActionID` and Report 4 is the report with the reportID provided:
            Report 4 -> parentReportID = "r_3", parentReportActionID = "a_3": (initially it's okay)
            Report 3 -> parentReportID = "r_2", parentReportActionID = "a_3": (should be "a_2")
            Report 2 -> parentReportID = "r_1", parentReportActionID = "a_3": (should be "a_1")
            Report 1 -> parentReportID = null,  parentReportActionID = "a_3": (should be null)

            `ancestors` result (and expecated result in parentheses):
            [
                {"pr_1": "pa_3"} (should be {"pr_1": "pa_1"}),
                {"pr_2": "pa_3"} (should be {"pr_2": "pa_2"}),
                {"pr_3": "pa_3"} (should be {"pr_3": "pa_3"}),
            ]

            Where in `ancestors`:
                - "pr_1" is the Report with reportID = "r_1"
                - "pa_1" is the ReportAction with reportActionID = "a_1"
                - and so on...

            Expected behavior:
                - Each ancestor report should be paired with its own corresponding `parentReportActionID`.
                - Ensure `ancestors` reflects the true report-to-action relationships.
            */
            parentReportActionID = parentReport.parentReportActionID;

            // Without reassigning `parentReportID` to the parent's own `parentReportID`, the loop keeps checking the same valid `parentReportID`,
            // causing an infinite loop and fails to traverses up the report hierarchy.
            parentReportID = parentReport.parentReportID;
        }
        return ancestors;
    }, [report, reportCollection, reportDraftCollection, reportActionsCollection]);
}

export default useAncestors;
