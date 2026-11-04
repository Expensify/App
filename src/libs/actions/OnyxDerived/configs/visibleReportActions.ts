import {isActionableWhisperRequiringWritePermission, isActionOfType, isConciergeCategoryOptions, isNewDotPaymentAction, shouldReportActionBeVisible} from '@libs/ReportActionsUtils';
import {isSupportTicket} from '@libs/ReportUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

/**
 * Returns true if the action's visibility depends on runtime context that can't be cached,
 * such as write permissions, policy settings, the type of its report, or sibling actions.
 */
function shouldSkipCachingAction(action: ReportAction): boolean {
    return (
        isActionableWhisperRequiringWritePermission(action) ||
        isConciergeCategoryOptions(action) ||
        isNewDotPaymentAction(action) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)
    );
}

/**
 * Builds a report's action-visibility map (keyed by `reportActionID`) from its full set of report
 * actions. Rebuilding the whole map rather than updating individual entries keeps deletions correct:
 * a removed action is absent from `reportActions`, so it drops out of the result.
 */
function computeReportVisibility(
    reportActions: ReportActions,
    currentUserAccountID: number | undefined,
    isSupportTicketReport: boolean,
    isReplacedSupportTicket: boolean,
): Record<string, boolean> {
    const reportVisibility: Record<string, boolean> = {};

    for (const [actionID, action] of Object.entries(reportActions)) {
        if (!action) {
            continue;
        }
        // Skip deprecated keys (e.g. sequenceNumber-keyed duplicates) so they
        // cannot overwrite the canonical entry's visibility with false.
        if (actionID !== action.reportActionID) {
            continue;
        }
        if (shouldSkipCachingAction(action)) {
            continue;
        }
        // A replacement ticket has its own active survey, so the original ticket's survey is stale.
        if (isReplacedSupportTicket && isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY)) {
            reportVisibility[action.reportActionID] = false;
            continue;
        }
        reportVisibility[action.reportActionID] = shouldReportActionBeVisible(action, actionID, undefined, currentUserAccountID, undefined, isSupportTicketReport);
    }

    return reportVisibility;
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS,
    // Note: REPORT dependency is needed both to trigger recompute when reports change
    // (for UNREPORTED_TRANSACTION/MOVED_TRANSACTION visibility) AND to provide the current
    // report collection to the visibility check, avoiding stale data from global connections.
    // SESSION dependency is needed for whisper targeting when user changes.
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.SESSION, ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS],
    compute: ([allReportActions, session, allReports, allReportNameValuePairs], {sourceValues, currentValue, triggeredKeys}): VisibleReportActionsDerivedValue => {
        if (!allReportActions) {
            return {};
        }

        const currentUserAccountID = session?.accountID;
        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS];
        const reportNameValuePairsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS];

        // Recompute only the reports whose actions or NVPs changed when we have a usable delta.
        // Otherwise recompute everything: on first load, when there's no delta, or on a SESSION or
        // REPORT change. SESSION is checked via triggeredKeys, not sourceValues, so a session cleared
        // to `undefined` still forces the full recompute.
        const isIncremental =
            !!(reportActionsUpdates ?? reportNameValuePairsUpdates) && !triggeredKeys?.has(ONYXKEYS.SESSION) && !triggeredKeys?.has(ONYXKEYS.COLLECTION.REPORT) && !!currentValue;

        const result: VisibleReportActionsDerivedValue = isIncremental ? {...currentValue} : {};
        const reportIDsToProcess = isIncremental
            ? new Set([
                  ...Object.keys(reportActionsUpdates ?? {}).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '')),
                  ...Object.keys(reportNameValuePairsUpdates ?? {})
                      .map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ''))
                      .filter((reportID) => isSupportTicket(allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`])),
              ])
            : new Set(Object.keys(allReportActions).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '')));

        for (const reportID of reportIDsToProcess) {
            const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
            const reportActions = allReportActions[reportActionsKey];

            // The member was removed entirely — drop the report from the result.
            if (!reportActions) {
                delete result[reportID];
                continue;
            }

            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const isSupportTicketReport = isSupportTicket(report);
            const isReplacedSupportTicket = isSupportTicketReport && !!allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`]?.reopenedAsReportID;
            result[reportID] = computeReportVisibility(reportActions, currentUserAccountID, isSupportTicketReport, isReplacedSupportTicket);
        }

        return result;
    },
});
