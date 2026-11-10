import useOnyx from '@hooks/useOnyx';

import {getSortedReportActions} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import {getAncestors, getParentReportChain} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/** Keeps only the parent reports of the given report that live in the reports collection */
function selectAncestorReports(reports: OnyxCollection<Report>, report: OnyxEntry<Report>, reportDrafts: OnyxCollection<Report>): OnyxCollection<Report> {
    const ancestorReports: OnyxCollection<Report> = {};
    for (const {reportID} of getParentReportChain(report, reports, reportDrafts)) {
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
        const ancestorReport = reports?.[reportKey];
        if (ancestorReport) {
            ancestorReports[reportKey] = ancestorReport;
        }
    }
    return ancestorReports;
}

/** Keeps only the parent report actions the given report was created from, up the chain, and the action before each one */
function selectAncestorReportActions(
    reportActions: OnyxCollection<ReportActions>,
    report: OnyxEntry<Report>,
    ancestorReports: OnyxCollection<Report>,
    reportDrafts: OnyxCollection<Report>,
): OnyxCollection<ReportActions> {
    const ancestorReportActions: OnyxCollection<ReportActions> = {};
    for (const {reportID, reportActionID} of getParentReportChain(report, ancestorReports, reportDrafts)) {
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const;
        const parentReportActions = reportActions?.[reportActionsKey];
        const ancestorReportAction = parentReportActions?.[reportActionID];
        if (!ancestorReportAction) {
            continue;
        }

        // The new marker on an ancestor also depends on the action before it, so a change to that action has to re-render too.
        const sortedReportActions = getSortedReportActions(Object.values(parentReportActions ?? {}));
        const ancestorIndex = sortedReportActions.findIndex((action) => action.reportActionID === reportActionID);
        const previousReportAction = ancestorIndex > 0 ? sortedReportActions.at(ancestorIndex - 1) : undefined;
        ancestorReportActions[reportActionsKey] = previousReportAction
            ? {[previousReportAction.reportActionID]: previousReportAction, [reportActionID]: ancestorReportAction}
            : {[reportActionID]: ancestorReportAction};
    }
    return ancestorReportActions;
}

/**
 * Fetches ancestor reports and their associated actions for a given report.
 *
 * @param report - The report for which to fetch ancestor reports and actions.
 * @param shouldExcludeAncestor - Callback to determine if an ancestor should be excluded.
 * @returns An array of ancestor reports and their associated actions.
 */

function useAncestors(report: OnyxEntry<Report>, shouldExcludeAncestorReportActionCallback: (reportAction: ReportAction, isFirstAncestor: boolean) => boolean = () => false): Ancestor[] {
    const [reportDraftCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT);

    // The selectors keep only the ancestor chain, so writes to unrelated reports and actions do not re-render the caller.
    const [ancestorReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (reports) => selectAncestorReports(reports, report, reportDraftCollection)});
    const [ancestorReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: (reportActions) => selectAncestorReportActions(reportActions, report, ancestorReports, reportDraftCollection),
    });
    return getAncestors(report, ancestorReports, reportDraftCollection, ancestorReportActions, shouldExcludeAncestorReportActionCallback);
}

export default useAncestors;
