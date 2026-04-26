import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';
import type {Followup} from '@libs/ReportActionFollowupUtils';
import type {Ancestor, OptimisticReportAction} from '@libs/ReportUtils';
import {buildOptimisticAddCommentReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {Timezone} from '@src/types/onyx/PersonalDetails';
import {addComment, buildOptimisticResolvedFollowups} from '.';

/** Delay before showing pre-generated Concierge response (in milliseconds) */
const CONCIERGE_RESPONSE_DELAY_MS = 4000;

/**
 * Resolves a suggested followup by posting the selected question as a comment
 * and optimistically updating the HTML to mark the followup-list as resolved.
 * If the followup has a pre-generated response, it will be queued and displayed
 * after a short delay. The server-owned agentZeroProcessingIndicator NVP drives
 * the "Concierge is thinking..." indicator during that window.
 * @param report - The report where the action exists
 * @param notifyReportID - The report ID to notify for new actions
 * @param reportAction - The report action containing the followup-list
 * @param selectedFollowup - The followup object containing the question text and optional pre-generated response
 * @param timezoneParam - The user's timezone
 * @param ancestors - Array of ancestor reports for proper threading
 */
function resolveSuggestedFollowup(
    report: OnyxEntry<Report>,
    notifyReportID: string | undefined,
    reportAction: OnyxEntry<ReportAction>,
    selectedFollowup: Followup,
    timezoneParam: Timezone,
    currentUserAccountID: number,
    currentUserEmail: string | undefined,
    ancestors: Ancestor[] = [],
) {
    const reportID = report?.reportID;
    const reportActionID = reportAction?.reportActionID;

    if (!reportID || !reportActionID) {
        return;
    }

    const resolvedAction = buildOptimisticResolvedFollowups(reportAction);

    if (!resolvedAction) {
        return;
    }

    Log.info('[Followups] followup clicked', false, {
        event: 'followup_clicked',
        reportID,
        reportActionID,
        hasPregeneratedResponse: !!selectedFollowup.response,
    });

    // Optimistically update the HTML to mark followup-list as resolved
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [reportActionID]: resolvedAction,
    });

    if (!selectedFollowup.response) {
        addComment({report, notifyReportID: notifyReportID ?? reportID, ancestors, text: selectedFollowup.text, timezoneParam, currentUserAccountID});
        return;
    }

    // If there's a pre-generated response, queue it for delayed display.
    const optimisticConciergeReportActionID = rand64();

    // Post user's comment immediately
    addComment({
        report,
        notifyReportID: notifyReportID ?? reportID,
        ancestors,
        text: selectedFollowup.text,
        timezoneParam,
        currentUserAccountID,
        shouldPlaySound: false,
        isInSidePanel: false,
        pregeneratedResponseParams: {
            optimisticConciergeReportActionID,
            pregeneratedResponse: selectedFollowup.response,
        },
    });

    // Use the full delay as createdOffset so the Concierge response timestamp is
    // strictly after the user's comment — a 1ms offset was not enough to guarantee
    // correct sort order when both actions are queued to Onyx near-simultaneously.
    const optimisticConciergeAction = buildOptimisticAddCommentReportAction({
        text: selectedFollowup.response,
        actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
        createdOffset: CONCIERGE_RESPONSE_DELAY_MS,
        reportActionID: optimisticConciergeReportActionID,
        reportID,
        isHTML: true,
        currentUserEmail,
        currentUserAccountID,
    });

    addOptimisticConciergeActionWithDelay(reportID, optimisticConciergeAction);
}

/**
 * Queues an optimistic concierge response for delayed display.
 * Writes action to Onyx — the usePendingConciergeResponse hook
 * handles the actual delay and moves the action to REPORT_ACTIONS
 * when the time arrives, with proper lifecycle cleanup.
 */
function addOptimisticConciergeActionWithDelay(reportID: string, optimisticConciergeAction: OptimisticReportAction) {
    // The "Concierge is thinking..." indicator is driven by the server-owned
    // agentZeroProcessingIndicator NVP, so this client-local delayed response
    // must not also write REPORT_USER_IS_TYPING for Concierge.
    Onyx.set(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${reportID}`, {
        reportAction: optimisticConciergeAction.reportAction,
        displayAfter: Date.now() + CONCIERGE_RESPONSE_DELAY_MS,
    });
}

/**
 * Discards a stale pending concierge response.
 * Called when the response has been pending too long (e.g. app was killed and restarted).
 */
function discardPendingConciergeAction(reportID: string | undefined) {
    Onyx.set(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${reportID}`, null);
}

/**
 * Applies a pending concierge response by moving it to REPORT_ACTIONS
 * and clearing the pending state.
 */
function applyPendingConciergeAction(reportID: string | undefined, reportAction: ReportAction) {
    Onyx.update([
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${reportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[reportAction.reportActionID]: reportAction},
        },
    ]);
}

export {resolveSuggestedFollowup, discardPendingConciergeAction, applyPendingConciergeAction, CONCIERGE_RESPONSE_DELAY_MS};
