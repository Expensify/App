import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

/*
 * Sequential phases of a send, so a slow `ManualSendMessageVisible` can be attributed to a stage instead
 * of reading as one opaque duration:
 *
 *   Submit          build the optimistic action, hand the write to Onyx and the queue
 *   Propagate       Onyx merge, derived recomputes, React scheduling, the list's own render work
 *   RowRender       the sent message's own subtree, list item down to its text fragment
 *   CommitAndPaint  the remaining rows, the React commit, layout
 *
 * Every boundary is keyed on the sent message's own `reportActionID` and marked by a component that
 * already receives it, so nothing guesses which row the sent message is.
 *
 * No registry: `activeSpans` is one. A phase exists iff `getSpan` finds it, which also makes every
 * function here self-healing: once the parent is cancelled, later calls for that send are no-ops.
 *
 * Phases hang off `ManualSendMessageVisible` only, never the effect-anchored `ManualSendMessage`, which is
 * being retired once the two anchors have been compared.
 */

/** Phases in the order they run. Each ends where the next begins, so their durations sum to the parent. */
type SendMessagePhase = ValueOf<typeof CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE>;

function getPhaseSpanID(reportActionID: string, phase: SendMessagePhase) {
    return `${phase}_${reportActionID}`;
}

function isPhaseRunning(reportActionID: string, phase: SendMessagePhase) {
    return !!getSpan(getPhaseSpanID(reportActionID, phase));
}

/**
 * Cheapest test that can rule a row out, for the marks that run once per row per list render: only a
 * message the user just sent can be a pending send, and it stays optimistic until the server confirms it.
 * One reference compare, no string built, no map touched.
 */
function isPendingSend(pendingAction: PendingAction | undefined) {
    return pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
}

/**
 * Start `phase` as a child of this send's span. No-op when the send has no span, either never started
 * (user was scrolled up) or since cancelled.
 */
function startSendMessagePhase(reportActionID: string | undefined, phase: SendMessagePhase) {
    if (!reportActionID) {
        return;
    }
    // Load-bearing, not defensive: `startInactiveSpan` falls back to the scope's active span when
    // `parentSpan` is undefined, which would nest the phase under an unrelated transaction.
    const parentSpan = getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`);
    if (!parentSpan) {
        return;
    }
    startSpan(getPhaseSpanID(reportActionID, phase), {name: phase, op: phase, parentSpan});
}

/** End `phase` for this send. No-op if it isn't running. */
function endSendMessagePhase(reportActionID: string | undefined, phase: SendMessagePhase) {
    if (!reportActionID) {
        return;
    }
    endSpan(getPhaseSpanID(reportActionID, phase));
}

/**
 * The sent row has started rendering, so the cascade the write set off is done. Closes `Propagate`, opens
 * `RowRender`.
 *
 * Called from the list item's render body, not an effect, because an effect only fires once the render it
 * is measuring has finished. Idempotent, since the guard is false once `Propagate` is closed, which is what
 * makes a discarded concurrent render or a recycled cell harmless.
 */
function markSendMessageRowRendered(reportAction: Pick<ReportAction, 'reportActionID' | 'pendingAction'>) {
    if (!isPendingSend(reportAction.pendingAction)) {
        return;
    }
    const {reportActionID} = reportAction;
    if (!isPhaseRunning(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE)) {
        return;
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.ROW_RENDER);
}

/**
 * The message text is rendering, at the bottom of the row's subtree. Closes `RowRender`, opens
 * `CommitAndPaint`. Called from `TextCommentFragment`'s render body, the component that also ends the
 * parent span, so it is on the path for every measured send.
 *
 * Only one of the two phases can be open, so one `end` call is always a no-op, but ending `Propagate` is
 * not duplication. If the row mark never fired, `Propagate` is the open one, and leaving it would have
 * `endSendMessagePhases` cancel it at `t4` with a duration running past the render it should end at. The
 * absent `RowRender` is what records the missed boundary instead. Happens on paths reaching
 * `ReportActionItem` outside `ReportActionsListItemRenderer`, most plausibly search results
 * (`ChatListItem`), since `addActions` calls `buildOptimisticSnapshotData`.
 *
 * Runs per text fragment per render with no `pendingAction` in scope, so it rules out on the parent span:
 * one lookup, and no phase can be open without it.
 */
function markSendMessageContentRendered(reportActionID: string | undefined) {
    if (!reportActionID || !getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`)) {
        return;
    }
    if (!isPhaseRunning(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE) && !isPhaseRunning(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.ROW_RENDER)) {
        return;
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.ROW_RENDER);
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.COMMIT_AND_PAINT);
}

/**
 * Close every phase immediately before the parent span ends, since Sentry drops descendants still running
 * when their parent ends.
 *
 * Only `CommitAndPaint` should still be open here, since the marks above close the earlier ones during the
 * render preceding this layout. The loop is a backstop, and cancels rather than ends because a phase
 * arriving open never reached its real boundary, so its duration would be a lie.
 *
 * Runs from `onLayout`, which fires for every message that lays out, so it rules out on the parent lookup
 * its caller needs anyway instead of probing all four phases.
 */
function endSendMessagePhases(reportActionID: string | undefined) {
    if (!reportActionID || !getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`)) {
        return;
    }
    for (const phase of Object.values(CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE)) {
        if (phase === CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.COMMIT_AND_PAINT) {
            continue;
        }
        cancelSpan(getPhaseSpanID(reportActionID, phase));
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.COMMIT_AND_PAINT);
}

export {startSendMessagePhase, endSendMessagePhase, markSendMessageRowRendered, markSendMessageContentRendered, endSendMessagePhases};
export type {SendMessagePhase};
