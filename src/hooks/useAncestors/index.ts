import useOnyx from '@hooks/useOnyx';

import type {Ancestor} from '@libs/ReportUtils';
import {getAncestors} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/**
 * Fetches ancestor reports and their associated actions for a given report.
 *
 * @param report - The report for which to fetch ancestor reports and actions.
 * @param shouldExcludeAncestor - Callback to determine if an ancestor should be excluded.
 * @returns An array of ancestor reports and their associated actions.
 */
function useAncestors(report: OnyxEntry<Report>, shouldExcludeAncestorReportActionCallback: (reportAction: ReportAction, isFirstAncestor: boolean) => boolean = () => false): Ancestor[] {
    const [reportDraftCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT);
    // Only the reports and actions on the report's parent chain matter, so a write to any other report or action doesn't
    // re-render the caller. A report without a parent selects nothing at all.
    const [ancestorReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (reports) => selectAncestorReports(report, reports, reportDraftCollection)});
    const [ancestorReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: (reportActions) => selectAncestorReportActions(report, ancestorReports, reportDraftCollection, reportActions),
    });
    return getAncestors(report, ancestorReports, reportDraftCollection, ancestorReportActions, shouldExcludeAncestorReportActionCallback);
}

/** Walks the parent chain like getAncestors and calls visit with the key of each parent, until it reaches the top or a cycle. */
function walkParentChain(
    report: OnyxEntry<Report>,
    getParentReport: (parentReportID: string) => OnyxEntry<Report>,
    visit: (parentReportID: string, parentReportActionID: string | undefined) => void,
) {
    const visitedReportIDs = new Set<string>();
    let currentReport = report;
    while (currentReport?.parentReportID && !visitedReportIDs.has(currentReport.parentReportID)) {
        visitedReportIDs.add(currentReport.parentReportID);
        visit(currentReport.parentReportID, currentReport.parentReportActionID);
        currentReport = getParentReport(currentReport.parentReportID);
    }
}

/** The reports on the parent chain of the report. getAncestors reads only these, falling back to a draft when the report is missing. */
function selectAncestorReports(report: OnyxEntry<Report>, reports: OnyxCollection<Report>, reportDrafts: OnyxCollection<Report>): OnyxCollection<Report> {
    const ancestorReports: OnyxCollection<Report> = {};
    const getParentReport = (parentReportID: string) => reports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`] ?? reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${parentReportID}`];
    walkParentChain(report, getParentReport, (parentReportID) => {
        const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
        if (parentReport) {
            ancestorReports[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`] = parentReport;
        }
    });
    return ancestorReports;
}

/** The parent actions on the parent chain of the report, the only actions getAncestors reads. */
function selectAncestorReportActions(
    report: OnyxEntry<Report>,
    ancestorReports: OnyxCollection<Report>,
    reportDrafts: OnyxCollection<Report>,
    reportActions: OnyxCollection<ReportActions>,
): OnyxCollection<ReportActions> {
    const ancestorReportActions: OnyxCollection<ReportActions> = {};
    const getParentReport = (parentReportID: string) =>
        ancestorReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`] ?? reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${parentReportID}`];
    walkParentChain(report, getParentReport, (parentReportID, parentReportActionID) => {
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}` as const;
        const parentReportAction = parentReportActionID ? reportActions?.[reportActionsKey]?.[parentReportActionID] : undefined;
        if (parentReportActionID && parentReportAction) {
            ancestorReportActions[reportActionsKey] = {[parentReportActionID]: parentReportAction};
        }
    });
    return ancestorReportActions;
}

export default useAncestors;
