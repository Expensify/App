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
import type {Policy, ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';

import {shallowEqual} from 'fast-equals';

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

/** What a report's visibility map was last computed from. */
type ReportVisibilityInputs = {
    reportActions: ReportActions;
    isSupportTicketReport: boolean;
    isReplacedSupportTicket: boolean;
    /** Mention whispers depend on the report's policy, so moving the report to another policy checks them again. */
    policyID: string | undefined;
};

/**
 * The inputs of each report's last visibility map. An action's visibility depends only on the action, the current user,
 * and these report states, so other report writes, like a new lastReadTime, skip the report, and a new message reuses the
 * visibility of every action object that didn't change instead of checking all of them again.
 */
const visibilityInputsByReportID = new Map<string, ReportVisibilityInputs>();

/**
 * Builds a report's action-visibility map (keyed by `reportActionID`) from its full set of report
 * actions. Rebuilding the whole map rather than updating individual entries keeps deletions correct:
 * a removed action is absent from `reportActions`, so it drops out of the result.
 */
function computeReportVisibility(
    policy: OnyxEntry<Policy>,
    currentUserEmail: string | undefined,
    reportActions: ReportActions,
    currentUserAccountID: number | undefined,
    isSupportTicketReport: boolean,
    isReplacedSupportTicket: boolean,
    previousInputs: ReportVisibilityInputs | undefined,
    previousReportVisibility: Record<string, boolean> | undefined,
): Record<string, boolean> {
    const reportVisibility: Record<string, boolean> = {};
    const reusableActions =
        previousReportVisibility && previousInputs?.isSupportTicketReport === isSupportTicketReport && previousInputs.isReplacedSupportTicket === isReplacedSupportTicket
            ? previousInputs.reportActions
            : undefined;

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
            reportVisibility[action.reportActionID] = shouldReportActionBeVisible(action, actionID, true, currentUserAccountID, undefined, false, undefined, policy, currentUserEmail);
            continue;
        }
        // A replacement ticket has its own active survey, so the original ticket's survey is stale.
        if (isReplacedSupportTicket && isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY)) {
            reportVisibility[action.reportActionID] = false;
            continue;
        }
        // Onyx keeps the object of every action a write didn't touch, so an unchanged action keeps its visibility.
        const previousVisibility = reusableActions?.[actionID] === action ? previousReportVisibility?.[actionID] : undefined;
        reportVisibility[action.reportActionID] = previousVisibility ?? shouldReportActionBeVisible(action, actionID, undefined, currentUserAccountID, undefined, isSupportTicketReport);
    }

    return reportVisibility;
}

/**
 * Updates cached visibility only for `ACTIONABLE_REPORT_MENTION_WHISPER` entries on a report when
 * only its policy changed, avoiding a full recompute of every action on the policy.
 */
function updateReportMentionWhispersVisibility(
    policy: OnyxEntry<Policy>,
    currentUserEmail: string | undefined,
    reportActions: ReportActions,
    currentUserAccountID: number | undefined,
    currentReportVisibility: Record<string, boolean> | undefined,
): Record<string, boolean> | undefined {
    let nextReportVisibility = currentReportVisibility;

    for (const [actionID, action] of Object.entries(reportActions)) {
        if (!action || actionID !== action.reportActionID || !isActionableReportMentionWhisper(action)) {
            continue;
        }
        const isVisible = shouldReportActionBeVisible(action, actionID, true, currentUserAccountID, undefined, false, undefined, policy, currentUserEmail);
        if (nextReportVisibility?.[action.reportActionID] === isVisible) {
            continue;
        }
        if (!nextReportVisibility || nextReportVisibility === currentReportVisibility) {
            nextReportVisibility = {...currentReportVisibility};
        }
        nextReportVisibility[action.reportActionID] = isVisible;
    }

    return nextReportVisibility;
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS,
    // Note: REPORT dependency is needed both to trigger recompute when reports change
    // (for UNREPORTED_TRANSACTION/MOVED_TRANSACTION visibility) AND to provide the current
    // report collection to the visibility check, avoiding stale data from global connections.
    // SESSION dependency is needed for whisper targeting when user changes.
    // POLICY dependency is needed so room-creation whispers recompute when a policy member's role changes.
    dependencies: [ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.SESSION, ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.POLICY],
    compute: ([allReportActions, session, allReports, allReportNameValuePairs, allPolicies], {sourceValues, currentValue, triggeredKeys}): VisibleReportActionsDerivedValue => {
        if (!allReportActions) {
            visibilityInputsByReportID.clear();
            return {};
        }

        const currentUserAccountID = session?.accountID;
        const currentUserEmail = session?.email;
        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS];
        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];
        const reportNameValuePairsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS];
        const policyUpdates = sourceValues?.[ONYXKEYS.COLLECTION.POLICY];

        // A report only changes its own actions' visibility, through its support ticket type or its policy, so only changed reports are recomputed.
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
        if (!isIncremental) {
            visibilityInputsByReportID.clear();
        }
        const reportIDsToProcess = isIncremental
            ? new Set([
                  ...Object.keys(reportActionsUpdates ?? {}).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '')),
                  ...Object.keys(reportUpdates ?? {})
                      .map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT, ''))
                      .filter((reportID) => {
                          const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                          const previousInputs = visibilityInputsByReportID.get(reportID);
                          return previousInputs?.isSupportTicketReport !== isSupportTicket(report) || previousInputs?.policyID !== report?.policyID;
                      }),
                  ...Object.keys(reportNameValuePairsUpdates ?? {})
                      .map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ''))
                      .filter((reportID) => isSupportTicket(allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`])),
              ])
            : new Set(Object.keys(allReportActions).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '')));

        let hasChanged = !isIncremental;
        for (const reportID of reportIDsToProcess) {
            const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
            const reportActions = allReportActions[reportActionsKey];

            // The member was removed entirely — drop the report from the result.
            if (!reportActions) {
                hasChanged ||= reportID in result;
                delete result[reportID];
                visibilityInputsByReportID.delete(reportID);
                continue;
            }

            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const policy = report?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] : undefined;
            const isSupportTicketReport = isSupportTicket(report);
            const isReplacedSupportTicket = isSupportTicketReport && !!allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`]?.reopenedAsReportID;
            const previousReportVisibility = currentValue?.[reportID];
            const reportVisibility = computeReportVisibility(
                policy,
                currentUserEmail,
                reportActions,
                currentUserAccountID,
                isSupportTicketReport,
                isReplacedSupportTicket,
                visibilityInputsByReportID.get(reportID),
                previousReportVisibility,
            );
            visibilityInputsByReportID.set(reportID, {reportActions, isSupportTicketReport, isReplacedSupportTicket, policyID: report?.policyID});

            // Keep the previous map when nothing changed, so selectors scoped to this report see the same reference.
            if (previousReportVisibility && shallowEqual(previousReportVisibility, reportVisibility)) {
                result[reportID] = previousReportVisibility;
                continue;
            }
            result[reportID] = reportVisibility;
            hasChanged = true;
        }

        for (const reportID of policyChangedReportIDs) {
            if (reportIDsToProcess.has(reportID)) {
                continue;
            }
            const reportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
            if (!reportActions) {
                continue;
            }
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const policy = report?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] : undefined;
            const nextReportVisibility = updateReportMentionWhispersVisibility(policy, currentUserEmail, reportActions, currentUserAccountID, result[reportID]);
            if (nextReportVisibility && nextReportVisibility !== result[reportID]) {
                result[reportID] = nextReportVisibility;
                hasChanged = true;
            }
        }

        // Most writes, like a new lastReadTime, change no visibility. Returning the same value skips the write and its notifications.
        return !hasChanged && currentValue ? currentValue : result;
    },
});
