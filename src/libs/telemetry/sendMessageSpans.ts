import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

/*
 * Sub-spans that break a send down into stages, so a slow `ManualSendMessageVisible` can be attributed to
 * one of them instead of reading as a single opaque duration: building the optimistic action, enqueueing
 * the API write, the async Onyx/derived-value cascade, and the React render.
 *
 * There is no registry here — `activeSpans` already is one. A phase exists iff `getSpan` finds it, which
 * is also what makes every function below self-healing: once the parent is cancelled (report-actions
 * skeleton, navigating away, backgrounding), every later call for that send is a no-op.
 *
 * Phases hang off `ManualSendMessageVisible` only, never the effect-anchored `ManualSendMessage`. That
 * span is being retired once the two anchors have been compared in Sentry, and leaving it untouched keeps
 * the comparison clean.
 */

/**
 * Phases of a send, in the order they run. Each one ends where the next begins, so together they
 * partition the parent span and their durations sum to it.
 */
type SendMessagePhase = ValueOf<typeof CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE>;

function getPhaseSpanID(reportActionID: string, phase: SendMessagePhase) {
    return `${phase}_${reportActionID}`;
}

/**
 * Start `phase` as a child of this send's span. No-op when the send has no span — either it was never
 * started (the user was scrolled up) or it has since been cancelled.
 */
function startSendMessagePhase(reportActionID: string | undefined, phase: SendMessagePhase) {
    if (!reportActionID) {
        return;
    }
    // Guarding on the parent is required, not just defensive: `startInactiveSpan` falls back to whatever
    // span is active on the scope when `parentSpan` is undefined, which would nest the phase under an
    // unrelated transaction.
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
 * The sent action has reached React: the async cascade is over and we are now rendering it. Closes
 * `Propagate` and opens `RenderCommit`.
 *
 * Called from two render bodies, and has to be, because neither one alone covers every send:
 *
 * - `ReportActionsList`, with the newest action it is about to render. This is the boundary we want, since
 *   it separates the Onyx cascade from the whole list render. But it misses expense and invoice reports
 *   (those render through `MoneyRequestReportActionsList`), and it misses sends where something else sits
 *   at index 0 — a Concierge synthetic draft, an optimistic Concierge reply, an incoming whisper.
 * - `TextCommentFragment`, with its own action. This is the backstop: it is the component that ends the
 *   parent span, so it is on the path for every send in every list. It fires late (the list render is
 *   already underway), which shows up as a `RenderCommit` of only a millisecond or two — that is the
 *   signal that the list-level mark missed and the render cost landed in `Propagate` instead.
 *
 * Whichever fires first wins: the `getSpan` check below is false once `Propagate` has been closed, so
 * later calls — including every subsequent re-render — are no-ops.
 */
function markSendMessageRendered(reportActionID: string | undefined) {
    if (!reportActionID || !getSpan(getPhaseSpanID(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE))) {
        return;
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.RENDER_COMMIT);
}

/**
 * Close every phase of this send, immediately before its parent span ends. Sentry drops descendants that
 * are still running when the parent ends, so anything left open has to be closed here to survive.
 *
 * Only the last phase reaches this point legitimately. Any earlier phase still running never reached its
 * own end, so it is cancelled rather than ended — and that is the interesting case: a cancelled
 * `Propagate` means the message never made it into the report-actions list at all (a skeleton swallowed
 * it), which a single opaque span could not tell apart from a slow render.
 */
function endSendMessagePhases(reportActionID: string | undefined) {
    if (!reportActionID) {
        return;
    }
    for (const phase of Object.values(CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE)) {
        if (phase === CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.RENDER_COMMIT) {
            continue;
        }
        cancelSpan(getPhaseSpanID(reportActionID, phase));
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.RENDER_COMMIT);
}

export {startSendMessagePhase, endSendMessagePhase, markSendMessageRendered, endSendMessagePhases};
export type {SendMessagePhase};
