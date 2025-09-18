import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {isCurrentActionUnread, isReportPreviewAction, isSentMoneyReportAction, isTransactionThread, isTripPreview} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type Report from '@src/types/onyx/Report';

/**
 * Traverses up the report hierarchy using `parentReportID` then returns the ancestor reports
 * and their associated actions based on `parentReportActionID`.
 *
 * @param report - The report for which to fetch ancestor reports and actions.
 * @param includeTransactionThreads - Whether to include transaction thread.
 */

function useAncestors(report: OnyxEntry<Report>, includeTransactionThreads = false): Ancestor[] {
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

            if (
                !parentReport ||
                !parentReportAction ||
                // We exclude trip preview actions as we don't want to display trip summary for threads,
                (isTripPreview(parentReportAction) && ancestors.length > 0) ||
                // We exclude ancestor reports when their parent's ReportAction is a transaction-thread action,
                // except for sent-money and report-preview actions. ReportActionsListItemRenderer does not render
                // the ReportActionItemParentAction when the parent (first) action is a transaction-thread (unless it's a sent-money action)
                // or a report-preview action, so we skip those ancestors to match the renderer's behavior.
                (!includeTransactionThreads && ((isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction)) || isReportPreviewAction(parentReportAction)))
            ) {
                break;
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

            Resulting `ancestors`:
            [
                {"r_1": "a_3"},
                {"r_2": "a_3"},
                {"r_3": "a_3"},
            ]
            
            Expected `ancestors`:
            [
                {"r_1": "a_1"},
                {"r_2": "a_2"},
                {"r_3": "a_3"},
            ]

            Where in `ancestors`:
                - "r_1" is the Report with reportID = "r_1"
                - "a_1" is the ReportAction with reportActionID = "a_1"

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
    }, [report, reportCollection, reportDraftCollection, reportActionsCollection, includeTransactionThreads]);
}

export default useAncestors;
