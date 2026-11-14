import {
    isActionableReportMentionWhisper,
    isActionableWhisperRequiringWritePermission,
    isActionOfType,
    isConciergeCategoryOptions,
    shouldReportActionBeVisible,
} from '@libs/ReportActionsUtils';
import {isSupportTicket} from '@libs/ReportUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Returns true if the action's visibility depends on runtime context that can't be cached,
 * such as write permissions, policy settings, or sibling actions.
 */
function shouldSkipCachingAction(action: ReportAction): boolean {
    if (isActionableReportMentionWhisper(action)) {
        return false;
    }
    return isActionableWhisperRequiringWritePermission(action) || isConciergeCategoryOptions(action) || isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED);
}

/**
 * Builds a report's action-visibility map (keyed by `reportActionID`) from its full set of report
 * actions. Rebuilding the whole map rather than updating individual entries keeps deletions correct:
 * a removed action is absent from `reportActions`, so it drops out of the result.
 */
function computeReportVisibility(
    reportID: string,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    currentUserEmail: string | undefined,
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
        if (isActionableReportMentionWhisper(action)) {
            // Write permission is still checked at runtime in isReportActionVisible, so pass true here to run the remaining visibility checks (deleted, resolved, targeted, room-creation permission) against the snapshot.
            reportVisibility[action.reportActionID] = shouldReportActionBeVisible(
                action,
                actionID,
                true,
                currentUserAccountID,
                reportID,
                isSupportTicketReport,
                reportActions,
                report,
                policy,
                currentUserEmail,
            );
            continue;
        }
        // A replacement ticket has its own active survey, so the original ticket's survey is stale.
        if (isReplacedSupportTicket && isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY)) {
            reportVisibility[action.reportActionID] = false;
            continue;
        }
        reportVisibility[action.reportActionID] = shouldReportActionBeVisible(action, actionID, undefined, currentUserAccountID, reportID, isSupportTicketReport);
    }

    return reportVisibility;
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS,
    // Note: REPORT dependency is needed both to trigger recompute when reports change
    // (for UNREPORTED_TRANSACTION/MOVED_TRANSACTION visibility) AND to provide the current
    // report collection to the visibility check, avoiding stale data from global connections.
    // SESSION dependency is needed for whisper targeting when user changes.
    // POLICY dependency is needed so room-creation whispers recompute when a workspace member's role changes.
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.SESSION, ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.POLICY],
    compute: ([allReportActions, session, allReports, allReportNameValuePairs, allPolicies], {sourceValues, currentValue, triggeredKeys}): VisibleReportActionsDerivedValue => {
        if (!allReportActions) {
            return {};
        }

        const currentUserAccountID = session?.accountID;
        const currentUserEmail = session?.email;
        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS];
        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];
        const reportNameValuePairsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS];
        const policyUpdates = sourceValues?.[ONYXKEYS.COLLECTION.POLICY];

        // A report only changes its own actions' visibility, through its support ticket type, so only changed reports are recomputed.
        // SESSION is read from triggeredKeys so a session cleared to `undefined` still forces a full recompute.
        const isIncremental = !!(reportActionsUpdates ?? reportUpdates ?? reportNameValuePairsUpdates ?? policyUpdates) && !triggeredKeys?.has(ONYXKEYS.SESSION) && !!currentValue;

        const changedPolicyIDs = policyUpdates ? new Set(Object.keys(policyUpdates).map((key) => key.replace(ONYXKEYS.COLLECTION.POLICY, ''))) : undefined;
        const policyChangedReportIDs =
            isIncremental && changedPolicyIDs && changedPolicyIDs.size > 0
                ? Object.keys(allReportActions)
                      .map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, ''))
                      .filter((reportID) => {
                          const policyID = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.policyID;
                          return !!policyID && changedPolicyIDs.has(policyID);
                      })
                : [];

        const result: VisibleReportActionsDerivedValue = isIncremental ? {...currentValue} : {};
        const reportIDsToProcess = isIncremental
            ? new Set([
                  ...Object.keys(reportActionsUpdates ?? {}).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '')),
                  ...Object.keys(reportUpdates ?? {}).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT, '')),
                  ...Object.keys(reportNameValuePairsUpdates ?? {})
                      .map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ''))
                      .filter((reportID) => isSupportTicket(allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`])),
                  ...policyChangedReportIDs,
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
            const policy = report?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] : undefined;
            const isSupportTicketReport = isSupportTicket(report);
            const isReplacedSupportTicket = isSupportTicketReport && !!allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`]?.reopenedAsReportID;
            result[reportID] = computeReportVisibility(reportID, report, policy, currentUserEmail, reportActions, currentUserAccountID, isSupportTicketReport, isReplacedSupportTicket);
        }

        return result;
    },
});
