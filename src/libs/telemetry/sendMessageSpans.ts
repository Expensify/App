// Lifecycle for the Propagate and PostCommit child spans of ManualSendMessageVisible. Keyed by reportActionID, and every function no-ops unless the parent span is active.

import CONST from '@src/CONST';

import type {StartSpanOptions} from '@sentry/core';
import type {ValueOf} from 'type-fest';

import {cancelSpan, endSpan, getSpan, startSpan} from './activeSpans';

type SendMessagePhase = ValueOf<typeof CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE>;

const SEND_MESSAGE_VISIBLE_PREFIX = `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_`;

// For each message that was sent but is not on screen yet, the reportID where it will show up, keyed by parent span id.
// This is usually the chat the user typed in, but a Concierge respond-in-thread reply shows up in the new thread instead.
const visibleReportIDBySpanID = new Map<string, string>();

function getSendMessageVisibleSpanID(reportActionID: string) {
    return `${SEND_MESSAGE_VISIBLE_PREFIX}${reportActionID}`;
}

function getSendMessageVisibleSpan(reportActionID: string) {
    return getSpan(getSendMessageVisibleSpanID(reportActionID));
}

function startSendMessageVisibleSpan(reportActionID: string, visibleReportID: string, options: StartSpanOptions) {
    const spanID = getSendMessageVisibleSpanID(reportActionID);
    if (!startSpan(spanID, options)) {
        return;
    }
    visibleReportIDBySpanID.set(spanID, visibleReportID);
}

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
    const parentSpan = getSendMessageVisibleSpan(reportActionID);
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
    if (!reportActionID || !getSendMessageVisibleSpan(reportActionID)) {
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

// Call from the sent row's onLayout. Ends the remaining phase before the parent and drops the parent's report entry.
function endSendMessageVisibleSpan(reportActionID: string) {
    endSendMessagePhases(reportActionID);
    const spanID = getSendMessageVisibleSpanID(reportActionID);
    endSpan(spanID);
    visibleReportIDBySpanID.delete(spanID);
}

// Call before cancelling the parent. Sentry drops descendants that have not ended when the root span does.
function cancelSendMessagePhases(parentSpanID: string | undefined) {
    if (!parentSpanID?.startsWith(SEND_MESSAGE_VISIBLE_PREFIX)) {
        return;
    }
    const reportActionID = parentSpanID.slice(SEND_MESSAGE_VISIBLE_PREFIX.length);
    for (const phase of Object.values(CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE)) {
        cancelSpan(getPhaseSpanID(reportActionID, phase));
    }
}

// Call when a report screen goes away. Only sends that render in that report are cancelled, so a send handed off to a Concierge thread survives the switch to the thread.
function cancelSendMessageSpansForReport(reportID: string | undefined) {
    if (!reportID) {
        return;
    }
    for (const [spanID, visibleReportID] of visibleReportIDBySpanID) {
        if (!getSpan(spanID)) {
            visibleReportIDBySpanID.delete(spanID);
            continue;
        }
        if (visibleReportID !== reportID) {
            continue;
        }
        cancelSendMessagePhases(spanID);
        cancelSpan(spanID);
        visibleReportIDBySpanID.delete(spanID);
    }
}

export {startSendMessageVisibleSpan, startSendMessagePhase, markSendMessageCommitted, endSendMessageVisibleSpan, cancelSendMessagePhases, cancelSendMessageSpansForReport};
