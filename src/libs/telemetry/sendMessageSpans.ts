import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

type SendMessagePhase = ValueOf<typeof CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE>;

let activeSend: {reportActionID: string; parentSpanID: string} | undefined;

function getParentSpanID(reportActionID: string) {
    return `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`;
}

function getPhaseSpanID(reportActionID: string, phase: SendMessagePhase) {
    return `${phase}_${reportActionID}`;
}

function isPhaseRunning(reportActionID: string, phase: SendMessagePhase) {
    return !!getSpan(getPhaseSpanID(reportActionID, phase));
}

function getActiveSendMessageSpan() {
    if (!activeSend) {
        return undefined;
    }
    const parentSpan = getSpan(activeSend.parentSpanID);
    if (!parentSpan) {
        activeSend = undefined;
        return undefined;
    }
    return parentSpan;
}

function isSendInFlight(reportActionID: string) {
    return activeSend?.reportActionID === reportActionID;
}

function clearActiveSend(reportActionID: string) {
    if (!isSendInFlight(reportActionID)) {
        return;
    }
    activeSend = undefined;
}

function startSendMessagePhase(reportActionID: string | undefined, phase: SendMessagePhase) {
    if (!reportActionID) {
        return;
    }
    // `startInactiveSpan` with an undefined `parentSpan` falls back to the scope's active span, which would nest the phase under an unrelated transaction.
    const parentSpanID = getParentSpanID(reportActionID);
    const parentSpan = getSpan(parentSpanID);
    if (!parentSpan) {
        return;
    }
    startSpan(getPhaseSpanID(reportActionID, phase), {name: phase, op: phase, parentSpan});
    activeSend = {reportActionID, parentSpanID};
}

function endSendMessagePhase(reportActionID: string | undefined, phase: SendMessagePhase) {
    if (!reportActionID) {
        return;
    }
    endSpan(getPhaseSpanID(reportActionID, phase));
}

// Call from a layout effect. React runs those inside the commit, before layout; a passive effect has no such guarantee.
function markSendMessageCommitted(reportActionID: string | undefined) {
    if (!reportActionID || !isSendInFlight(reportActionID) || !isPhaseRunning(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE)) {
        return;
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.PROPAGATE);
    startSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT);
}

// Call before ending the parent. Sentry drops a child still running when its parent ends.
function endSendMessagePhases(reportActionID: string | undefined) {
    if (!reportActionID || !isSendInFlight(reportActionID) || !getSpan(getParentSpanID(reportActionID))) {
        return;
    }
    for (const phase of Object.values(CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE)) {
        if (phase === CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT) {
            continue;
        }
        cancelSpan(getPhaseSpanID(reportActionID, phase));
    }
    endSendMessagePhase(reportActionID, CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.POST_COMMIT);
    clearActiveSend(reportActionID);
}

// Call before cancelling the parent. Sentry drops a child still running when its parent ends.
function cancelSendMessagePhases(parentSpanID: string | undefined) {
    const parentPrefix = `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_`;
    if (!parentSpanID?.startsWith(parentPrefix)) {
        return;
    }
    const reportActionID = parentSpanID.slice(parentPrefix.length);
    for (const phase of Object.values(CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE)) {
        cancelSpan(getPhaseSpanID(reportActionID, phase));
    }
    clearActiveSend(reportActionID);
}

export {startSendMessagePhase, markSendMessageCommitted, endSendMessagePhases, cancelSendMessagePhases, getActiveSendMessageSpan};
