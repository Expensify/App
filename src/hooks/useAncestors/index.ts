import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getIOUActionForReportID, isCurrentActionUnread} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';

/**
 * Traverses up the report hierarchy with the `parentReportID` until the root report,
 * then returns the ancestor reports and their associated actions based on `parentReportActionID`.
 *
 * @param report - The report for which to fetch ancestor reports and actions.
 * @param reportCollection - Collection of reports.
 * @param reportDraftCollection - Collection of report drafts.
 * @param reportActionsCollection - Collection of report actions.
 * @param shouldExcludeAncestorReportActionCallback - Callback to determine if an ancestor should be excluded. Check shouldExcludeAncestorReportAction in ReportUtils.ts for implementation.
 * @returns An array of ancestor reports and their associated actions.
 */
function getAncestors(
    report: OnyxEntry<Report>,
    reportCollection: OnyxCollection<Report>,
    reportDraftCollection: OnyxCollection<Report>,
    reportActionsCollection: OnyxCollection<ReportActions>,
    shouldExcludeAncestorReportActionCallback: (reportAction: ReportAction, isFirstAncestor: boolean) => boolean = () => false,
): Ancestor[] {
    const ancestors: Ancestor[] = [];
    let currentReport = report;

    // Traverse up the report hierarchy until currentReport has no parent
    while (currentReport?.parentReportID && currentReport?.parentReportActionID) {
        const currentReportAction = reportActionsCollection?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentReport.parentReportID}`]?.[`${currentReport.parentReportActionID}`];
        if (!currentReportAction) {
            return ancestors;
        }

        // As we traverse up the report hierarchy, we need to reassign `currentReport`
        // to the parent's own report.
        currentReport =
            reportCollection?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReport.parentReportID}`] ??
            reportDraftCollection?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${currentReport.parentReportID}`];
        if (!currentReport || shouldExcludeAncestorReportActionCallback(currentReportAction, ancestors.length === 0)) {
            return ancestors;
        }
        // To maintain the order from the top-most ancestor down to the immediate parent
        // we `unshift` (push) each ancestor to the start of the array.
        ancestors.unshift({
            report: currentReport,
            reportAction: currentReportAction,
            shouldDisplayNewMarker: isCurrentActionUnread(currentReport, currentReportAction),
        });
    }

    return ancestors;
}

/**
 * Fetches ancestor reports and their associated actions for a given report.
 *
 * @param report - The report for which to fetch ancestor reports and actions.
 * @param shouldExcludeAncestor - Callback to determine if an ancestor should be excluded.
 * @returns An array of ancestor reports and their associated actions.
 */

function useAncestors(report: OnyxEntry<Report>, shouldExcludeAncestorReportActionCallback: (reportAction: ReportAction, isFirstAncestor: boolean) => boolean = () => false): Ancestor[] {
    const [reportCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportDraftCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT, {canBeMissing: true});
    const [reportActionsCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    return getAncestors(report, reportCollection, reportDraftCollection, reportActionsCollection, shouldExcludeAncestorReportActionCallback);
}

export default useAncestors;
