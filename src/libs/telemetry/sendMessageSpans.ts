import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

/*
 * Sequential phases partitioning `ManualSendMessageVisible`, so a slow send can be attributed to a stage:
 *
 *   Submit      build the optimistic action, enqueue the write
 *   Propagate   Onyx applies the write, derived values recompute, React renders and commits the row
 *   Paint       from React's commit until the platform reports the row's layout
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
 * Closes `Propagate`, opens `Paint`. **Must** be called from a layout effect: React runs those synchronously
 * during the commit, before the browser lays out or paints. A passive effect is scheduled with no paint
 * guarantee and drifts by an unknown amount, moving the boundary into `Paint`.
 *
 * Guarding on `Propagate` also covers the parent, since cancelling the parent closes the phases with it.
 */
function markSendMessageCommitted(reportActionID: string | undefined) {
    if (!reportActionID || !isPhaseRunning(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE)) {
        return;
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
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

/**
 * Cancel every phase of the send `parentSpanID` identifies. Must run before the parent is cancelled, or the
 * phases outlive the span they partition. A phase can already be open, since the submit runs synchronously
 * after the parent starts.
 */
function cancelSendMessagePhases(parentSpanID: string | undefined) {
    const parentPrefix = `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_`;
    if (!parentSpanID?.startsWith(parentPrefix)) {
        return;
    }
    const reportActionID = parentSpanID.slice(parentPrefix.length);
    for (const phase of Object.values(CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE)) {
        cancelSpan(getPhaseSpanID(reportActionID, phase));
    }
}

export {startSendMessagePhase, endSendMessagePhase, markSendMessageCommitted, endSendMessagePhases, cancelSendMessagePhases};
