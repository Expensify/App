// Lifecycle for the Propagate and PostCommit child spans of ManualSendMessageVisible. Keyed by reportActionID, and every function no-ops unless the parent span is active.

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

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
    // `startInactiveSpan` with an undefined `parentSpan` falls back to the scope's active span, which would nest the phase under an unrelated transaction.
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

// Call from a layout effect. React runs those inside the commit, before layout. A passive effect has no such guarantee.
function markSendMessageCommitted(reportActionID: string | undefined) {
    if (!reportActionID || !isPhaseRunning(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE)) {
        return;
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT);
}

// Call before ending the parent. Sentry drops descendants that have not ended when the root span does.
function endSendMessagePhases(reportActionID: string | undefined) {
    if (!reportActionID || !getSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`)) {
        return;
    }
    for (const phase of Object.values(CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE)) {
        if (phase === CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT) {
            continue;
        }
        cancelSpan(getPhaseSpanID(reportActionID, phase));
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT);
}

// Call before cancelling the parent. Sentry drops descendants that have not ended when the root span does.
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

export {startSendMessagePhase, markSendMessageCommitted, endSendMessagePhases, cancelSendMessagePhases};
