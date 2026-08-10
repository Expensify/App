import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

/*
 * Sequential phases partitioning `ManualSendMessageVisible`, so a slow send can be attributed to a stage:
 *
 *   Submit      build the optimistic action, enqueue the write
 *   Propagate   Onyx applies the write, derived values recompute, React schedules
 *   Commit      the rows render, then React commits
 *   Paint       from the commit until the platform reports the row's layout
 *
 * Keyed on the sent message's own `reportActionID`, marked by components that already receive it, so
 * nothing guesses which row the sent message is. `activeSpans` is the registry: a phase exists iff
 * `getSpan` finds it, so every function here no-ops once the parent is cancelled. Parented to
 * `ManualSendMessageVisible` only, never the effect-anchored `ManualSendMessage`, which is being retired.
 */

/** Each phase ends where the next begins, so their durations sum to the parent. */
type SendMessagePhase = ValueOf<typeof CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE>;

function getPhaseSpanID(reportActionID: string, phase: SendMessagePhase) {
    return `${phase}_${reportActionID}`;
}

function isPhaseRunning(reportActionID: string, phase: SendMessagePhase) {
    return !!getSpan(getPhaseSpanID(reportActionID, phase));
}

/** Hot-path guard: one reference compare, no allocation. Only a message just sent is still optimistic. */
function isPendingSend(pendingAction: PendingAction | undefined) {
    return pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
}

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

function endSendMessagePhase(reportActionID: string | undefined, phase: SendMessagePhase) {
    if (!reportActionID) {
        return;
    }
    endSpan(getPhaseSpanID(reportActionID, phase));
}

/**
 * Closes `Propagate`, opens `Commit`. Called from the list item's render body, not an effect, because an
 * effect only fires once the render it measures has finished. Idempotent, so a discarded concurrent render
 * or a recycled cell is harmless.
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
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.COMMIT);
}

/**
 * Closes `Commit`, opens `Paint`. **Must** be called from a layout effect: React runs those synchronously
 * during the commit, before the browser lays out or paints. A passive effect is scheduled with no paint
 * guarantee and drifts by an unknown amount, inflating `Commit`.
 *
 * Ends `Propagate` too, for the case where the row mark never fired. Leaving it open would have
 * `endSendMessagePhases` cancel it later with a duration running past the render it should end at; the
 * absent `Commit` records the missed boundary instead.
 */
function markSendMessageCommitted(reportActionID: string | undefined) {
    if (!reportActionID || !getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`)) {
        return;
    }
    if (!isPhaseRunning(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE) && !isPhaseRunning(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.COMMIT)) {
        return;
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.COMMIT);
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PAINT);
}

/**
 * Closes every phase immediately before the parent ends, since Sentry drops descendants still running when
 * their parent does. Only `Paint` should still be open; the loop is a backstop, and cancels rather than ends
 * because a phase arriving open never reached its real boundary.
 */
function endSendMessagePhases(reportActionID: string | undefined) {
    if (!reportActionID || !getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`)) {
        return;
    }
    for (const phase of Object.values(CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE)) {
        if (phase === CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PAINT) {
            continue;
        }
        cancelSpan(getPhaseSpanID(reportActionID, phase));
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PAINT);
}

export {startSendMessagePhase, endSendMessagePhase, markSendMessageRowRendered, markSendMessageCommitted, endSendMessagePhases};
