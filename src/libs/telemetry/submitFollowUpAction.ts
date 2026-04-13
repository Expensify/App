/**
 * Submit follow-up action span: measures time from expense submit until the follow-up action
 * (e.g. dismiss modal and open report, dismiss modal only, navigate to search) is complete and the target screen is visible.
 * Uses submit_follow_up_action attribute to record which action was taken.
 */
import type {SpanAttributeValue} from '@sentry/core';
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
 * True when the new call is a refinement of the same submit flow (same report, same or more specific action).
 * In that case we update pending and span attributes instead of cancelling, so the second setPending call in the same flow does not drop the span.
 */
function isSameFlowUpdate(pending: NonNullable<PendingSubmitFollowUpAction>, followUpAction: SubmitFollowUpAction, reportID?: string): boolean {
    if (pending.reportID !== reportID) {
        return false;
    }
    if (pending.followUpAction === followUpAction) {
        return true;
    }
    // Refinement: we first set DISMISS_MODAL_ONLY, then dismissModalWithReport's onBeforeNavigate refines it to DISMISS_MODAL_AND_OPEN_REPORT when the report will open. Same flow — update in place instead of cancelling.
    if (pending.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY && followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT) {
        return true;
    }
    // The fast path (pre-insert) sets NAVIGATE_TO_SEARCH before createTransaction runs.
    // handleNavigateAfterExpenseCreate may later call with DISMISS_MODAL_ONLY because it
    // sees the Search page as already on top. Treat this as same-flow - keep the original.
    return pending.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH && followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY;
}

/**
 * Set the pending follow-up action before navigating (for submit-to-visible span).
 * The screen that becomes visible should call endSubmitFollowUpActionSpan when visible.
 * If there is already a pending action and the span is still running (e.g. second submit before first completes), we cancel the previous span so it is not left stuck or attributed to the wrong action.
 * Exception: when the new call is a same-flow update (same report, same or refined action), we just update pending and span attributes without cancelling.
 */
function setPendingSubmitFollowUpAction(followUpAction: SubmitFollowUpAction, reportID?: string) {
    const span = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
    const pending = pendingSubmitFollowUpAction;

    if (pending !== null && span && isSameFlowUpdate(pending, followUpAction, reportID)) {
        // Same flow: only update when the new action is a genuine refinement (e.g.
        // DISMISS_MODAL_ONLY -> DISMISS_MODAL_AND_OPEN_REPORT). When the fast path set
        // NAVIGATE_TO_SEARCH and handleNavigateAfterExpenseCreate later calls with
        // DISMISS_MODAL_ONLY (because Search is already on top), preserve the original
        // action so telemetry correctly reflects the pre-insert path.
        const isRefinement =
            pending.followUpAction !== followUpAction &&
            !(pending.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH && followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);

        if (isRefinement) {
            pendingSubmitFollowUpAction = {followUpAction, reportID};
            span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION, followUpAction);
            if (reportID !== undefined) {
                span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORT_ID, reportID);
            }
        }
        return;
    }

    if (pending !== null && span) {
        cancelSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
        pendingSubmitFollowUpAction = null;
    }

    // Only set pending when the span is still active. On the fast path the span
    // may have already been ended by SearchStaticList before createTransaction's
    // rAF fires. Setting pending without a span leaves stale state that would
    // cancel the next flow's span in the conflict check above.
    const spanAfter = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
    if (!spanAfter) {
        return;
    }

    pendingSubmitFollowUpAction = {followUpAction, reportID};
    spanAfter.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION, followUpAction);
    if (reportID !== undefined) {
        spanAfter.setAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORT_ID, reportID);
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
function endSubmitFollowUpActionSpan(followUpAction: SubmitFollowUpAction, reportID?: string, extraAttributes?: Record<string, SpanAttributeValue>) {
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
    const attributes: Record<string, SpanAttributeValue> = {
        [CONST.TELEMETRY.ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION]: followUpAction,
        ...extraAttributes,
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
