/**
 * Submit follow-up action span: measures time from expense submit until the follow-up action
 * (e.g. dismiss modal and open report, navigate to search, pop RHP) is complete and the target screen is visible.
 * Uses submit_follow_up_action attribute to record which action was taken.
 */
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import {cancelSpan, endSpanWithAttributes, getSpan} from './activeSpans';

type SubmitFollowUpAction = ValueOf<typeof CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION>;

type PendingSubmitFollowUpAction = {
    followUpAction: SubmitFollowUpAction;
    reportID?: string;
} | null;

let pendingSubmitFollowUpAction: PendingSubmitFollowUpAction = null;

/**
 * Set the pending follow-up action before navigating (for submit-to-visible span).
 * The screen that becomes visible should call endSubmitFollowUpActionSpan when visible.
 * If there is already a pending action and the span is still running (e.g. second submit before first completes), we cancel the previous span so it is not left stuck or attributed to the wrong action.
 */
function setPendingSubmitFollowUpAction(followUpAction: SubmitFollowUpAction, reportID?: string) {
    if (pendingSubmitFollowUpAction !== null && getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE)) {
        cancelSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
        pendingSubmitFollowUpAction = null;
    }
    pendingSubmitFollowUpAction = {followUpAction, reportID};
    // Set the attribute on the span immediately so it is present when the transaction is serialized.
    // When navigating away (e.g. to Search), the confirmation transaction can end and the SDK may cancel our span before the destination screen mounts to call endSubmitFollowUpActionSpan.
    const span = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
    if (span) {
        span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION, followUpAction);
        if (reportID !== undefined) {
            span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORT_ID, reportID);
        }
    }
}

/**
 * Clear the pending follow-up action (e.g. when the span is ended or cancelled).
 */
function clearPendingSubmitFollowUpAction() {
    pendingSubmitFollowUpAction = null;
}

/**
 * Read the current pending follow-up action (for screens to check if they should end the span).
 * Not reactive; call from within a callback (e.g. useFocusEffect, onLayout).
 */
function getPendingSubmitFollowUpAction(): PendingSubmitFollowUpAction {
    return pendingSubmitFollowUpAction;
}

/**
 * End the submit-to-visible span and clear the pending action. Call from each screen when its main content is visible (e.g. onLayout).
 * Only ends the span if the passed followUpAction matches the current pending action (avoids races and wrong attribution).
 */
function endSubmitFollowUpActionSpan(followUpAction: SubmitFollowUpAction, reportID?: string) {
    if (!getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE)) {
        return;
    }
    const pending = pendingSubmitFollowUpAction;
    if (!pending || pending.followUpAction !== followUpAction) {
        return;
    }
    if (pending.reportID !== undefined && pending.reportID !== reportID) {
        return;
    }
    const attributes: Record<string, string> = {
        [CONST.TELEMETRY.ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION]: followUpAction,
    };
    if (reportID !== undefined) {
        attributes[CONST.TELEMETRY.ATTRIBUTE_REPORT_ID] = reportID;
    }
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE, attributes);
    clearPendingSubmitFollowUpAction();
}

/**
 * Cancel the submit-to-visible span and clear the pending follow-up action.
 */
function cancelSubmitFollowUpActionSpan() {
    cancelSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
    clearPendingSubmitFollowUpAction();
}

export {endSubmitFollowUpActionSpan, setPendingSubmitFollowUpAction, getPendingSubmitFollowUpAction, cancelSubmitFollowUpActionSpan};
export type {SubmitFollowUpAction};
