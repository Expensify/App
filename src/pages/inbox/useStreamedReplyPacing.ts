import useAccountIDToNameMap from '@hooks/useAccountIDToNameMap';
import useOnyx from '@hooks/useOnyx';

import {getReportChannelName} from '@libs/actions/Report';
import {ACCELERATED_REMAINING_MS, easeOut, getRevealDurationMS, MIN_TRICKLE_TOKEN_COUNT, TICK_INTERVAL_MS, TRICKLE_HARD_CAP_MS} from '@libs/ConciergeRevealUtils';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import type {StreamedReplyEvent, StreamedReplyEventsEvent} from '@libs/Pusher/types';
import stripFollowupListFromHtml from '@libs/ReportActionFollowupUtils/stripFollowupListFromHtml';
import tokenizeForReveal from '@libs/ReportActionFollowupUtils/tokenizeForReveal';
import {getReportActionHtml} from '@libs/ReportActionsUtils';
import Visibility from '@libs/Visibility';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {Dispatch, SetStateAction} from 'react';

import {useEffect, useRef, useState} from 'react';

import type {StreamedReply} from './streamedReplyState';

import {applyStreamedReplyEvent, STREAMED_REPLY_STATUS, getCachedReply, getNextVisibleStreamedReplyMarkdown, setCachedReply} from './streamedReplyState';

type MutableRef<T> = {
    current: T;
};

type PusherReplyPaceRefs = {
    completedPusherReplyEventRef: MutableRef<StreamedReplyEvent | null>;
    finalRenderedHTMLRevealDurationRef: MutableRef<number>;
    finalRenderedHTMLRevealIntervalRef: MutableRef<ReturnType<typeof setInterval> | null>;
    finalRenderedHTMLRevealLastStageRef: MutableRef<number>;
    finalRenderedHTMLRevealStartedAtRef: MutableRef<number>;
    finalRenderedHTMLRevealTokensRef: MutableRef<string[]>;
    lastPaceTickTimeRef: MutableRef<number>;
    latestPusherReplyEventRef: MutableRef<StreamedReplyEvent | null>;
    pusherPaceIntervalRef: MutableRef<ReturnType<typeof setInterval> | null>;
    terminalPusherReplyEventRef: MutableRef<StreamedReplyEvent | null>;
    queuedPusherReplyEventsRef: MutableRef<StreamedReplyEvent[]>;
    visibleBodyMarkdownRef: MutableRef<string>;
    visibleSourceMarkdownRef: MutableRef<string>;
    visibleSourceOffsetRef: MutableRef<number>;
};

type PusherReplyPacingRuntime = PusherReplyPaceRefs & {
    accountIDToNameRef: MutableRef<Record<string, string>>;
    completedReportActionIDsRef: MutableRef<Set<string>>;
    currentReplyRef: MutableRef<StreamedReply | null>;
    isGroupPolicyReport: boolean;
    reportID: string;
    setReply: Dispatch<SetStateAction<StreamedReply | null>>;
    visibleSequenceRef: MutableRef<number>;
};

const PUSHER_REPLY_PACE_INTERVAL_MS = 10;
const PUSHER_REPLY_EVENT_TYPES = [
    Pusher.TYPE.CONCIERGE_DRAFT_STARTED,
    Pusher.TYPE.CONCIERGE_DRAFT_UPDATED,
    Pusher.TYPE.CONCIERGE_DRAFT_COMPLETED,
    Pusher.TYPE.CONCIERGE_DRAFT_FAILED,
    Pusher.TYPE.CONCIERGE_DRAFT_CLEARED,
] as const;

function buildPusherReplyEventFromCachedReply(
    reportID: string,
    reply: StreamedReply | null,
    status: StreamedReplyEvent['status'] = STREAMED_REPLY_STATUS.UPDATED,
): StreamedReplyEvent | null {
    if (!reply?.pusherTargetBodyMarkdown && !reply?.pusherTargetFinalRenderedHTML) {
        return null;
    }

    return {
        reportID,
        reportActionID: reply.reportAction.reportActionID,
        streamSessionID: reply.streamSessionID,
        sequence: reply.pusherTargetSequence ?? 0,
        status,
        created: reply.reportAction.created,
        bodyMarkdown: reply.pusherTargetBodyMarkdown,
        finalRenderedHTML: reply.pusherTargetFinalRenderedHTML,
        terminalReason: reply.terminalReason,
    };
}

function stopPusherReplyPace(runtime: PusherReplyPaceRefs) {
    const {pusherPaceIntervalRef} = runtime;

    if (!pusherPaceIntervalRef.current) {
        return;
    }

    clearInterval(pusherPaceIntervalRef.current);
    pusherPaceIntervalRef.current = null;
}

function stopFinalRenderedHTMLReveal(runtime: PusherReplyPaceRefs) {
    const {finalRenderedHTMLRevealIntervalRef} = runtime;

    if (!finalRenderedHTMLRevealIntervalRef.current) {
        return;
    }

    clearInterval(finalRenderedHTMLRevealIntervalRef.current);
    finalRenderedHTMLRevealIntervalRef.current = null;
}

function resetPusherReplyPace(runtime: PusherReplyPaceRefs) {
    const {
        completedPusherReplyEventRef,
        finalRenderedHTMLRevealDurationRef,
        finalRenderedHTMLRevealLastStageRef,
        finalRenderedHTMLRevealStartedAtRef,
        finalRenderedHTMLRevealTokensRef,
        lastPaceTickTimeRef,
        latestPusherReplyEventRef,
        queuedPusherReplyEventsRef,
        terminalPusherReplyEventRef,
        visibleBodyMarkdownRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;

    stopPusherReplyPace(runtime);
    stopFinalRenderedHTMLReveal(runtime);
    latestPusherReplyEventRef.current = null;
    queuedPusherReplyEventsRef.current = [];
    completedPusherReplyEventRef.current = null;
    terminalPusherReplyEventRef.current = null;
    finalRenderedHTMLRevealDurationRef.current = 0;
    finalRenderedHTMLRevealTokensRef.current = [];
    finalRenderedHTMLRevealStartedAtRef.current = 0;
    finalRenderedHTMLRevealLastStageRef.current = 0;
    visibleBodyMarkdownRef.current = '';
    visibleSourceMarkdownRef.current = '';
    visibleSourceOffsetRef.current = 0;
    lastPaceTickTimeRef.current = 0;
}

function clearCachedPusherReply(runtime: PusherReplyPacingRuntime) {
    const {completedReportActionIDsRef, currentReplyRef, reportID, setReply} = runtime;

    // Clearing the display must not let delayed Pusher events restart a completed reply.
    // Unfinished replies cleared on reconnect can still resume.
    if (currentReplyRef.current?.status === STREAMED_REPLY_STATUS.COMPLETED && !currentReplyRef.current.pusherPendingCompletionEvent) {
        completedReportActionIDsRef.current.add(currentReplyRef.current.reportAction.reportActionID);
    }

    resetPusherReplyPace(runtime);
    currentReplyRef.current = null;
    setCachedReply(reportID, null);
    setReply(null);
}

function cacheReplyWithPusherPaceState(runtime: PusherReplyPacingRuntime, nextReply: StreamedReply | null): StreamedReply | null {
    const {
        completedPusherReplyEventRef,
        currentReplyRef,
        latestPusherReplyEventRef,
        queuedPusherReplyEventsRef,
        reportID,
        terminalPusherReplyEventRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;

    if (!nextReply) {
        currentReplyRef.current = null;
        setCachedReply(reportID, null);
        return null;
    }

    const latestPusherReplyEvent = latestPusherReplyEventRef.current;
    const queuedPusherReplyEvents = queuedPusherReplyEventsRef.current;
    const completedPusherReplyEvent = completedPusherReplyEventRef.current;
    let nextReplyWithPusherPaceState = nextReply;
    if (latestPusherReplyEvent?.bodyMarkdown) {
        nextReplyWithPusherPaceState = {
            ...nextReply,
            pusherTargetBodyMarkdown: latestPusherReplyEvent.bodyMarkdown,
            pusherTargetFinalRenderedHTML: undefined,
            pusherTargetSequence: latestPusherReplyEvent.sequence,
            pusherQueuedTargetEvents: queuedPusherReplyEvents.length > 0 ? [...queuedPusherReplyEvents] : undefined,
            pusherPendingCompletionEvent: nextReply.status === STREAMED_REPLY_STATUS.COMPLETED ? undefined : (completedPusherReplyEvent ?? undefined),
            pusherTerminalEvent: terminalPusherReplyEventRef.current ?? undefined,
            pusherVisibleSourceMarkdown: visibleSourceMarkdownRef.current,
            pusherVisibleSourceOffset: visibleSourceOffsetRef.current,
        };
    } else if (latestPusherReplyEvent?.finalRenderedHTML && nextReply.status !== STREAMED_REPLY_STATUS.COMPLETED) {
        nextReplyWithPusherPaceState = {
            ...nextReply,
            pusherTargetBodyMarkdown: undefined,
            pusherTargetFinalRenderedHTML: latestPusherReplyEvent.finalRenderedHTML,
            pusherTargetSequence: latestPusherReplyEvent.sequence,
            pusherQueuedTargetEvents: undefined,
            pusherPendingCompletionEvent: undefined,
            pusherTerminalEvent: terminalPusherReplyEventRef.current ?? undefined,
            pusherVisibleSourceMarkdown: undefined,
            pusherVisibleSourceOffset: undefined,
        };
    } else if (terminalPusherReplyEventRef.current) {
        nextReplyWithPusherPaceState = {
            ...nextReplyWithPusherPaceState,
            pusherTerminalEvent: terminalPusherReplyEventRef.current,
        };
    }

    currentReplyRef.current = nextReplyWithPusherPaceState;
    setCachedReply(reportID, nextReplyWithPusherPaceState);
    return nextReplyWithPusherPaceState;
}

function cacheCurrentReplyWithPusherPaceState(runtime: PusherReplyPacingRuntime) {
    const {setReply} = runtime;

    setReply((currentReply) => cacheReplyWithPusherPaceState(runtime, currentReply));
}

function publishVisibleEvent(
    runtime: PusherReplyPacingRuntime,
    event: StreamedReplyEvent,
    visibleMarkdown?: ReturnType<typeof getNextVisibleStreamedReplyMarkdown>,
    status?: StreamedReplyEvent['status'],
    finalRenderedHTML?: string,
) {
    const {accountIDToNameRef, isGroupPolicyReport, reportID, setReply, visibleBodyMarkdownRef, visibleSequenceRef, visibleSourceMarkdownRef, visibleSourceOffsetRef} = runtime;

    if (visibleMarkdown) {
        visibleBodyMarkdownRef.current = visibleMarkdown.bodyMarkdown;
        visibleSourceMarkdownRef.current = visibleMarkdown.sourceMarkdown;
        visibleSourceOffsetRef.current = visibleMarkdown.sourceOffset;
    }

    // Local optimistic reveals also advance the reply sequence. Reconciliation must
    // publish a newer event even when the Pusher pacer has not emitted those stages.
    visibleSequenceRef.current = Math.max(visibleSequenceRef.current, runtime.currentReplyRef.current?.sequence ?? 0) + 1;
    const visibleStatus = status ?? event.status;
    const visibleEvent = {
        ...event,
        bodyMarkdown: visibleMarkdown?.bodyMarkdown,
        ...(finalRenderedHTML !== undefined ? {finalRenderedHTML} : {}),
        sequence: visibleSequenceRef.current,
        status: visibleStatus,
    };
    setReply((currentReply) => {
        const next = applyStreamedReplyEvent(currentReply, visibleEvent, reportID, isGroupPolicyReport, accountIDToNameRef.current);
        return cacheReplyWithPusherPaceState(runtime, next);
    });
}

function getNextLastPaceTickTime(now: number, paceStartTime: number, elapsedIntervals: number, revealedUnits: number, shouldPreserveElapsedDebt: boolean): number {
    if (!shouldPreserveElapsedDebt || elapsedIntervals === 0 || revealedUnits === 0) {
        return now;
    }

    return Math.min(now, paceStartTime + revealedUnits * PUSHER_REPLY_PACE_INTERVAL_MS);
}

function tickPacing(runtime: PusherReplyPacingRuntime) {
    const {
        completedPusherReplyEventRef,
        lastPaceTickTimeRef,
        latestPusherReplyEventRef,
        queuedPusherReplyEventsRef,
        visibleBodyMarkdownRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;
    const latestEvent = latestPusherReplyEventRef.current;
    const targetBodyMarkdown = latestEvent?.bodyMarkdown ?? '';

    if (!latestEvent || !targetBodyMarkdown) {
        stopPusherReplyPace(runtime);
        return;
    }

    const completedEvent = completedPusherReplyEventRef.current;
    const hasQueuedTarget = queuedPusherReplyEventsRef.current.length > 0;
    const now = Date.now();
    const elapsed = lastPaceTickTimeRef.current ? Math.max(0, now - lastPaceTickTimeRef.current) : PUSHER_REPLY_PACE_INTERVAL_MS;
    const elapsedIntervals = Math.floor(elapsed / PUSHER_REPLY_PACE_INTERVAL_MS);
    const unitsToReveal = Math.max(1, elapsedIntervals);
    const paceStartTime = lastPaceTickTimeRef.current || now - elapsedIntervals * PUSHER_REPLY_PACE_INTERVAL_MS;
    let revealedUnits = 0;
    let nextVisibleMarkdown = {
        bodyMarkdown: visibleBodyMarkdownRef.current,
        sourceMarkdown: visibleSourceMarkdownRef.current,
        sourceOffset: visibleSourceOffsetRef.current,
    };

    while (revealedUnits < unitsToReveal && nextVisibleMarkdown.sourceOffset < targetBodyMarkdown.length) {
        const advancedVisibleMarkdown = getNextVisibleStreamedReplyMarkdown(
            nextVisibleMarkdown.bodyMarkdown,
            targetBodyMarkdown,
            nextVisibleMarkdown.sourceOffset,
            nextVisibleMarkdown.sourceMarkdown,
        );

        if (advancedVisibleMarkdown.sourceOffset <= nextVisibleMarkdown.sourceOffset) {
            nextVisibleMarkdown = advancedVisibleMarkdown;
            break;
        }

        nextVisibleMarkdown = advancedVisibleMarkdown;
        revealedUnits += 1;
    }

    if (nextVisibleMarkdown.bodyMarkdown !== visibleBodyMarkdownRef.current || nextVisibleMarkdown.sourceOffset !== visibleSourceOffsetRef.current) {
        const isTargetFullyVisible = nextVisibleMarkdown.sourceOffset >= targetBodyMarkdown.length;
        const shouldPreserveElapsedDebt = (isTargetFullyVisible && hasQueuedTarget) || (!isTargetFullyVisible && revealedUnits >= elapsedIntervals);

        // Only consume time for the units we actually revealed; keep the rest for the next target.
        lastPaceTickTimeRef.current = getNextLastPaceTickTime(now, paceStartTime, elapsedIntervals, revealedUnits, shouldPreserveElapsedDebt);
        if (completedEvent?.finalRenderedHTML && !completedEvent.bodyMarkdown && completedEvent.status !== STREAMED_REPLY_STATUS.COMPLETED && !hasQueuedTarget && isTargetFullyVisible) {
            completedPusherReplyEventRef.current = null;
            publishVisibleEvent(runtime, latestEvent, nextVisibleMarkdown, STREAMED_REPLY_STATUS.UPDATED);
            startFinalRenderedHTMLReveal(runtime, completedEvent);
            return;
        }

        const status = completedEvent && !hasQueuedTarget && isTargetFullyVisible ? STREAMED_REPLY_STATUS.COMPLETED : STREAMED_REPLY_STATUS.UPDATED;
        publishVisibleEvent(runtime, status === STREAMED_REPLY_STATUS.COMPLETED && completedEvent ? completedEvent : latestEvent, nextVisibleMarkdown, status);

        if (status === STREAMED_REPLY_STATUS.COMPLETED) {
            completedPusherReplyEventRef.current = null;
            stopPusherReplyPace(runtime);
        }

        if (isTargetFullyVisible && hasQueuedTarget && revealedUnits < unitsToReveal && promoteQueuedPusherReplyTarget(runtime)) {
            tickPacing(runtime);
        }
        return;
    }

    if (promoteQueuedPusherReplyTarget(runtime)) {
        if (elapsedIntervals > 0) {
            tickPacing(runtime);
            return;
        }

        lastPaceTickTimeRef.current = now;
        startPusherReplyPace(runtime);
        return;
    }

    lastPaceTickTimeRef.current = now;

    if (completedEvent) {
        completedPusherReplyEventRef.current = null;
        if (completedEvent.finalRenderedHTML && !completedEvent.bodyMarkdown && completedEvent.status !== STREAMED_REPLY_STATUS.COMPLETED) {
            startFinalRenderedHTMLReveal(runtime, completedEvent);
            return;
        }
        publishVisibleEvent(
            runtime,
            completedEvent,
            {bodyMarkdown: targetBodyMarkdown, sourceMarkdown: targetBodyMarkdown, sourceOffset: targetBodyMarkdown.length},
            STREAMED_REPLY_STATUS.COMPLETED,
        );
    }

    stopPusherReplyPace(runtime);
}

function startPusherReplyPace(runtime: PusherReplyPacingRuntime) {
    const {lastPaceTickTimeRef, pusherPaceIntervalRef} = runtime;

    if (pusherPaceIntervalRef.current) {
        return;
    }

    lastPaceTickTimeRef.current = Date.now();
    pusherPaceIntervalRef.current = setInterval(() => tickPacing(runtime), PUSHER_REPLY_PACE_INTERVAL_MS);
}

function getRevealStageForCurrentReply(runtime: PusherReplyPacingRuntime, event: StreamedReplyEvent, tokens: string[]): number {
    const {currentReplyRef} = runtime;
    const currentReply = currentReplyRef.current;
    if (!currentReply || currentReply.streamSessionID !== event.streamSessionID) {
        return 0;
    }

    const currentHTML = stripFollowupListFromHtml(getReportActionHtml(currentReply.reportAction));
    if (!currentHTML) {
        return 0;
    }

    return Math.max(
        0,
        tokens.findLastIndex((token) => token === currentHTML),
    );
}

function tickFinalRenderedHTMLReveal(runtime: PusherReplyPacingRuntime) {
    const {finalRenderedHTMLRevealDurationRef, finalRenderedHTMLRevealLastStageRef, finalRenderedHTMLRevealStartedAtRef, finalRenderedHTMLRevealTokensRef, latestPusherReplyEventRef} =
        runtime;
    const event = latestPusherReplyEventRef.current;
    const finalRenderedHTML = event?.finalRenderedHTML ?? '';
    const tokens = finalRenderedHTMLRevealTokensRef.current;

    if (!event || !finalRenderedHTML || tokens.length <= 1) {
        stopFinalRenderedHTMLReveal(runtime);
        return;
    }

    const lastIndex = tokens.length - 1;
    const elapsed = Date.now() - finalRenderedHTMLRevealStartedAtRef.current;
    const effectiveDuration = finalRenderedHTMLRevealDurationRef.current || getRevealDurationMS(tokens.length);
    const progress = easeOut(elapsed / effectiveDuration);
    const stage = Math.min(lastIndex, Math.ceil(progress * lastIndex));
    const shouldComplete = progress >= 1 || elapsed >= TRICKLE_HARD_CAP_MS;

    if (shouldComplete) {
        publishVisibleEvent(runtime, event, undefined, STREAMED_REPLY_STATUS.COMPLETED, finalRenderedHTML);
        stopFinalRenderedHTMLReveal(runtime);
        return;
    }

    if (stage <= finalRenderedHTMLRevealLastStageRef.current) {
        return;
    }

    finalRenderedHTMLRevealLastStageRef.current = stage;
    publishVisibleEvent(runtime, event, undefined, STREAMED_REPLY_STATUS.UPDATED, tokens.at(stage) ?? '');
}

function startFinalRenderedHTMLReveal(runtime: PusherReplyPacingRuntime, event: StreamedReplyEvent, remainingDurationMS?: number) {
    const {
        completedPusherReplyEventRef,
        finalRenderedHTMLRevealDurationRef,
        finalRenderedHTMLRevealIntervalRef,
        finalRenderedHTMLRevealLastStageRef,
        finalRenderedHTMLRevealStartedAtRef,
        finalRenderedHTMLRevealTokensRef,
        latestPusherReplyEventRef,
        queuedPusherReplyEventsRef,
        visibleBodyMarkdownRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;
    const finalRenderedHTML = event.finalRenderedHTML ?? '';
    if (!finalRenderedHTML) {
        return;
    }

    // Followups include hidden pregenerated answers. Reveal only the visible answer body,
    // then publish the complete original HTML so buttons never expose partial responses.
    const tokens = tokenizeForReveal(stripFollowupListFromHtml(finalRenderedHTML) ?? '');
    stopPusherReplyPace(runtime);
    stopFinalRenderedHTMLReveal(runtime);
    completedPusherReplyEventRef.current = null;
    queuedPusherReplyEventsRef.current = [];
    visibleBodyMarkdownRef.current = '';
    visibleSourceMarkdownRef.current = '';
    visibleSourceOffsetRef.current = 0;
    latestPusherReplyEventRef.current = event;

    const currentStage = getRevealStageForCurrentReply(runtime, event, tokens);
    if (tokens.length < MIN_TRICKLE_TOKEN_COUNT || currentStage === tokens.length - 1) {
        finalRenderedHTMLRevealDurationRef.current = 0;
        finalRenderedHTMLRevealTokensRef.current = [];
        finalRenderedHTMLRevealStartedAtRef.current = 0;
        finalRenderedHTMLRevealLastStageRef.current = 0;
        publishVisibleEvent(runtime, event, undefined, STREAMED_REPLY_STATUS.COMPLETED, finalRenderedHTML);
        return;
    }

    const lastIndex = tokens.length - 1;
    const initialStage = Math.max(1, Math.min(lastIndex, currentStage));
    const initialProgress = initialStage / lastIndex;
    const initialElapsedRatio = 1 - Math.sqrt(1 - initialProgress);
    const effectiveDuration = remainingDurationMS ? remainingDurationMS / Math.max(0.001, 1 - initialElapsedRatio) : getRevealDurationMS(tokens.length);
    const elapsedOffset = initialElapsedRatio * effectiveDuration;

    finalRenderedHTMLRevealDurationRef.current = effectiveDuration;
    finalRenderedHTMLRevealTokensRef.current = tokens;
    finalRenderedHTMLRevealStartedAtRef.current = Date.now() - elapsedOffset;
    finalRenderedHTMLRevealLastStageRef.current = initialStage;
    publishVisibleEvent(
        runtime,
        event,
        undefined,
        event.status === STREAMED_REPLY_STATUS.STARTED ? STREAMED_REPLY_STATUS.STARTED : STREAMED_REPLY_STATUS.UPDATED,
        tokens.at(initialStage) ?? '',
    );

    if (finalRenderedHTMLRevealIntervalRef.current) {
        return;
    }

    finalRenderedHTMLRevealIntervalRef.current = setInterval(() => tickFinalRenderedHTMLReveal(runtime), TICK_INTERVAL_MS);
}

function getNewestPusherReplyTarget(runtime: PusherReplyPacingRuntime): StreamedReplyEvent | null {
    return runtime.queuedPusherReplyEventsRef.current.at(-1) ?? runtime.latestPusherReplyEventRef.current;
}

function getNewestPusherReplyLifecycleEvent(runtime: PusherReplyPacingRuntime): StreamedReplyEvent | null {
    const target = getNewestPusherReplyTarget(runtime);
    const terminalEvent = runtime.terminalPusherReplyEventRef.current;

    if (!target) {
        return terminalEvent;
    }

    if (!terminalEvent || target.streamSessionID !== terminalEvent.streamSessionID) {
        return target;
    }

    return terminalEvent.sequence > target.sequence ? terminalEvent : target;
}

function isContentFreeTerminalEvent(event: StreamedReplyEvent | null): boolean {
    return event?.status === STREAMED_REPLY_STATUS.COMPLETED && !event.bodyMarkdown && !event.finalRenderedHTML;
}

function revealFullPusherReplyTarget(runtime: PusherReplyPacingRuntime) {
    const {completedPusherReplyEventRef, lastPaceTickTimeRef, latestPusherReplyEventRef, queuedPusherReplyEventsRef} = runtime;
    const newestTarget = getNewestPusherReplyTarget(runtime);
    const completedEvent = completedPusherReplyEventRef.current;

    lastPaceTickTimeRef.current = Date.now();
    stopPusherReplyPace(runtime);

    if (!newestTarget?.bodyMarkdown) {
        if (completedEvent) {
            completedPusherReplyEventRef.current = null;
            if (completedEvent.finalRenderedHTML && !completedEvent.bodyMarkdown && completedEvent.status !== STREAMED_REPLY_STATUS.COMPLETED) {
                startFinalRenderedHTMLReveal(runtime, completedEvent);
                return;
            }
            publishVisibleEvent(runtime, completedEvent, undefined, STREAMED_REPLY_STATUS.COMPLETED);
        }
        return;
    }

    const targetBodyMarkdown = newestTarget.bodyMarkdown;
    latestPusherReplyEventRef.current = newestTarget;
    queuedPusherReplyEventsRef.current = [];

    if (completedEvent?.finalRenderedHTML && !completedEvent.bodyMarkdown && completedEvent.status !== STREAMED_REPLY_STATUS.COMPLETED) {
        completedPusherReplyEventRef.current = null;
        publishVisibleEvent(
            runtime,
            newestTarget,
            {bodyMarkdown: targetBodyMarkdown, sourceMarkdown: targetBodyMarkdown, sourceOffset: targetBodyMarkdown.length},
            STREAMED_REPLY_STATUS.UPDATED,
        );
        startFinalRenderedHTMLReveal(runtime, completedEvent);
        return;
    }

    publishVisibleEvent(
        runtime,
        completedEvent ?? newestTarget,
        {bodyMarkdown: targetBodyMarkdown, sourceMarkdown: targetBodyMarkdown, sourceOffset: targetBodyMarkdown.length},
        completedEvent ? STREAMED_REPLY_STATUS.COMPLETED : STREAMED_REPLY_STATUS.UPDATED,
    );

    if (completedEvent) {
        completedPusherReplyEventRef.current = null;
    }
}

function queuePusherReplyTargets(runtime: PusherReplyPacingRuntime, events: StreamedReplyEvent[]) {
    const {queuedPusherReplyEventsRef} = runtime;
    let newestTarget = getNewestPusherReplyTarget(runtime);
    const eventsToQueue: StreamedReplyEvent[] = [];

    for (const event of events) {
        if (!event.bodyMarkdown || (newestTarget?.streamSessionID === event.streamSessionID && event.sequence <= newestTarget.sequence)) {
            continue;
        }

        eventsToQueue.push(event);
        newestTarget = event;
    }

    if (eventsToQueue.length === 0) {
        return;
    }

    queuedPusherReplyEventsRef.current = [...queuedPusherReplyEventsRef.current, ...eventsToQueue];
}

function setOrQueuePusherReplyTarget(runtime: PusherReplyPacingRuntime, event: StreamedReplyEvent): boolean {
    const {
        completedPusherReplyEventRef,
        currentReplyRef,
        latestPusherReplyEventRef,
        queuedPusherReplyEventsRef,
        terminalPusherReplyEventRef,
        visibleBodyMarkdownRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;
    const currentTarget = latestPusherReplyEventRef.current;
    const isCurrentTargetFullyVisible = !!currentTarget?.bodyMarkdown && visibleSourceOffsetRef.current >= currentTarget.bodyMarkdown.length;
    const shouldQueue =
        !!currentTarget?.bodyMarkdown &&
        currentTarget.streamSessionID === event.streamSessionID &&
        event.sequence > currentTarget.sequence &&
        (!isCurrentTargetFullyVisible || queuedPusherReplyEventsRef.current.length > 0);

    if (shouldQueue) {
        queuePusherReplyTargets(runtime, [event]);
        return true;
    }

    const latestEvent = getNewestPusherReplyTarget(runtime);
    const activeStreamSessionID = latestEvent?.streamSessionID ?? currentReplyRef.current?.streamSessionID;
    if (activeStreamSessionID && activeStreamSessionID !== event.streamSessionID) {
        stopPusherReplyPace(runtime);
        stopFinalRenderedHTMLReveal(runtime);
        completedPusherReplyEventRef.current = null;
        queuedPusherReplyEventsRef.current = [];
        terminalPusherReplyEventRef.current = null;
        visibleBodyMarkdownRef.current = '';
        visibleSourceMarkdownRef.current = '';
        visibleSourceOffsetRef.current = 0;
    }

    stopFinalRenderedHTMLReveal(runtime);
    latestPusherReplyEventRef.current = event;
    queuedPusherReplyEventsRef.current = [];
    return false;
}

function promoteQueuedPusherReplyTarget(runtime: PusherReplyPacingRuntime): boolean {
    const {latestPusherReplyEventRef, queuedPusherReplyEventsRef} = runtime;
    const [queuedPusherReplyEvent, ...remainingQueuedPusherReplyEvents] = queuedPusherReplyEventsRef.current;
    if (!queuedPusherReplyEvent?.bodyMarkdown) {
        return false;
    }

    latestPusherReplyEventRef.current = queuedPusherReplyEvent;
    queuedPusherReplyEventsRef.current = remainingQueuedPusherReplyEvents;
    return true;
}

function isStalePusherReplyEventAgainstTarget(runtime: PusherReplyPacingRuntime, event: StreamedReplyEvent, latestEvent: StreamedReplyEvent | null): boolean {
    const {completedReportActionIDsRef, currentReplyRef, reportID} = runtime;

    if (event.reportID !== reportID || completedReportActionIDsRef.current.has(event.reportActionID)) {
        return true;
    }

    if (latestEvent?.streamSessionID === event.streamSessionID && event.sequence <= latestEvent.sequence) {
        return true;
    }

    const activeStreamSessionID = isContentFreeTerminalEvent(latestEvent)
        ? currentReplyRef.current?.streamSessionID
        : (latestEvent?.streamSessionID ?? currentReplyRef.current?.streamSessionID);
    return !!activeStreamSessionID && activeStreamSessionID !== event.streamSessionID && event.status !== STREAMED_REPLY_STATUS.STARTED && event.status !== STREAMED_REPLY_STATUS.UPDATED;
}

function isStalePusherReplyEvent(runtime: PusherReplyPacingRuntime, event: StreamedReplyEvent): boolean {
    return isStalePusherReplyEventAgainstTarget(runtime, event, getNewestPusherReplyLifecycleEvent(runtime));
}

function rememberContentFreeCompletedEvent(runtime: PusherReplyPacingRuntime, event: StreamedReplyEvent) {
    const {completedPusherReplyEventRef, terminalPusherReplyEventRef} = runtime;

    terminalPusherReplyEventRef.current = event;
    completedPusherReplyEventRef.current = null;
}

function handlePusherReplyEvent(runtime: PusherReplyPacingRuntime, event: StreamedReplyEvent) {
    const {completedPusherReplyEventRef, latestPusherReplyEventRef, terminalPusherReplyEventRef, visibleBodyMarkdownRef, visibleSourceMarkdownRef, visibleSourceOffsetRef} = runtime;

    if (isStalePusherReplyEvent(runtime, event)) {
        return;
    }

    if (event.status === STREAMED_REPLY_STATUS.FAILED || event.status === STREAMED_REPLY_STATUS.CLEARED) {
        resetPusherReplyPace(runtime);
        publishVisibleEvent(runtime, event, undefined, event.status);
        return;
    }

    if (event.status === STREAMED_REPLY_STATUS.COMPLETED) {
        let didQueueTarget = false;
        if (event.bodyMarkdown) {
            didQueueTarget = setOrQueuePusherReplyTarget(runtime, {
                ...event,
                finalRenderedHTML: undefined,
                status: STREAMED_REPLY_STATUS.UPDATED,
            });
        }
        const hasBodyTarget = !!latestPusherReplyEventRef.current?.bodyMarkdown || didQueueTarget;
        if (!event.bodyMarkdown && event.finalRenderedHTML && !hasBodyTarget) {
            startFinalRenderedHTMLReveal(runtime, event);
            return;
        }
        completedPusherReplyEventRef.current = event;
        if (!event.bodyMarkdown && !event.finalRenderedHTML) {
            terminalPusherReplyEventRef.current = event;
        }
        if (hasBodyTarget) {
            if (didQueueTarget) {
                cacheCurrentReplyWithPusherPaceState(runtime);
            }
            startPusherReplyPace(runtime);
            if (!didQueueTarget) {
                tickPacing(runtime);
            }
        } else if (!event.finalRenderedHTML) {
            rememberContentFreeCompletedEvent(runtime, event);
        } else {
            publishVisibleEvent(runtime, event, undefined, STREAMED_REPLY_STATUS.COMPLETED);
        }
        return;
    }

    if (event.finalRenderedHTML && !event.bodyMarkdown) {
        startFinalRenderedHTMLReveal(runtime, event);
        return;
    }

    const targetBodyMarkdown = event.bodyMarkdown ?? '';
    if (!targetBodyMarkdown) {
        return;
    }

    const didQueueTarget = setOrQueuePusherReplyTarget(runtime, event);
    if (didQueueTarget) {
        cacheCurrentReplyWithPusherPaceState(runtime);
        startPusherReplyPace(runtime);
        return;
    }

    const nextVisibleMarkdown = getNextVisibleStreamedReplyMarkdown(visibleBodyMarkdownRef.current, targetBodyMarkdown, visibleSourceOffsetRef.current, visibleSourceMarkdownRef.current);
    if (nextVisibleMarkdown.bodyMarkdown !== visibleBodyMarkdownRef.current || nextVisibleMarkdown.sourceOffset !== visibleSourceOffsetRef.current) {
        publishVisibleEvent(runtime, event, nextVisibleMarkdown, event.status);
    }

    if (nextVisibleMarkdown.sourceOffset < targetBodyMarkdown.length) {
        startPusherReplyPace(runtime);
    } else {
        stopPusherReplyPace(runtime);
    }
}

function handlePusherReplyEvents(runtime: PusherReplyPacingRuntime, eventData: StreamedReplyEventsEvent) {
    const {completedPusherReplyEventRef, latestPusherReplyEventRef, queuedPusherReplyEventsRef, terminalPusherReplyEventRef, visibleSourceOffsetRef} = runtime;
    const targetEvents: StreamedReplyEvent[] = [];
    let latestAcceptedEvent: StreamedReplyEvent | null = null;
    let completedEvent: StreamedReplyEvent | null = null;
    let finalRenderedHTMLEvent: StreamedReplyEvent | null = null;

    for (const event of eventData.events) {
        if (isStalePusherReplyEventAgainstTarget(runtime, event, latestAcceptedEvent ?? getNewestPusherReplyLifecycleEvent(runtime))) {
            continue;
        }

        if (event.status === STREAMED_REPLY_STATUS.FAILED || event.status === STREAMED_REPLY_STATUS.CLEARED) {
            resetPusherReplyPace(runtime);
            publishVisibleEvent(runtime, event, undefined, event.status);
            return;
        }

        if (event.status === STREAMED_REPLY_STATUS.COMPLETED) {
            if (event.bodyMarkdown) {
                const completedTargetEvent = {
                    ...event,
                    finalRenderedHTML: undefined,
                    status: STREAMED_REPLY_STATUS.UPDATED,
                };
                targetEvents.push(completedTargetEvent);
            } else if (event.finalRenderedHTML) {
                finalRenderedHTMLEvent = event;
            }
            latestAcceptedEvent = event;
            completedEvent = event;
            continue;
        }

        if (event.finalRenderedHTML && !event.bodyMarkdown) {
            finalRenderedHTMLEvent = event;
            latestAcceptedEvent = event;
            continue;
        }

        const targetBodyMarkdown = event.bodyMarkdown ?? '';
        if (!targetBodyMarkdown) {
            continue;
        }

        targetEvents.push(event);
        latestAcceptedEvent = event;
    }

    const [firstVisibleEvent, ...queuedTargetEvents] = targetEvents;

    if (firstVisibleEvent?.bodyMarkdown) {
        if (finalRenderedHTMLEvent) {
            completedPusherReplyEventRef.current = finalRenderedHTMLEvent;
        } else if (completedEvent) {
            completedPusherReplyEventRef.current = completedEvent;
        }

        const previousVisibleSequence = runtime.visibleSequenceRef.current;
        handlePusherReplyEvent(runtime, firstVisibleEvent);
        const didRememberContentFreeCompletion = !!completedEvent && !completedEvent.bodyMarkdown && !completedEvent.finalRenderedHTML;
        if (didRememberContentFreeCompletion) {
            terminalPusherReplyEventRef.current = completedEvent;
        }
        queuePusherReplyTargets(runtime, queuedTargetEvents);

        // publishVisibleEvent persists refs when it runs; otherwise persist the accepted target/queue state here.
        if (didRememberContentFreeCompletion || queuedTargetEvents.length > 0 || runtime.visibleSequenceRef.current === previousVisibleSequence) {
            cacheCurrentReplyWithPusherPaceState(runtime);
        }
    } else if (completedEvent) {
        if (!completedEvent.bodyMarkdown && !completedEvent.finalRenderedHTML && !latestPusherReplyEventRef.current?.bodyMarkdown) {
            rememberContentFreeCompletedEvent(runtime, completedEvent);
            return;
        }
        if (finalRenderedHTMLEvent) {
            startFinalRenderedHTMLReveal(runtime, finalRenderedHTMLEvent);
            return;
        }
        completedPusherReplyEventRef.current = completedEvent;
    } else if (finalRenderedHTMLEvent) {
        startFinalRenderedHTMLReveal(runtime, finalRenderedHTMLEvent);
        return;
    }

    if (
        latestPusherReplyEventRef.current?.bodyMarkdown &&
        (visibleSourceOffsetRef.current < latestPusherReplyEventRef.current.bodyMarkdown.length || queuedPusherReplyEventsRef.current.length > 0 || !!completedPusherReplyEventRef.current)
    ) {
        startPusherReplyPace(runtime);
        return;
    }

    if (completedPusherReplyEventRef.current) {
        if (completedPusherReplyEventRef.current.finalRenderedHTML && !completedPusherReplyEventRef.current.bodyMarkdown) {
            const finalRenderedHTMLCompletionEvent = completedPusherReplyEventRef.current;
            completedPusherReplyEventRef.current = null;
            startFinalRenderedHTMLReveal(runtime, finalRenderedHTMLCompletionEvent);
            return;
        }
        publishVisibleEvent(runtime, completedPusherReplyEventRef.current, undefined, STREAMED_REPLY_STATUS.COMPLETED);
        completedPusherReplyEventRef.current = null;
    }
}

function resumeCachedPusherReplyPace(runtime: PusherReplyPacingRuntime) {
    const {completedPusherReplyEventRef, latestPusherReplyEventRef, queuedPusherReplyEventsRef, visibleSourceOffsetRef} = runtime;
    const latestEvent = latestPusherReplyEventRef.current;
    if (!latestEvent?.bodyMarkdown) {
        if (latestEvent?.finalRenderedHTML) {
            startFinalRenderedHTMLReveal(runtime, latestEvent);
        }
        return;
    }

    const shouldResumePacing = visibleSourceOffsetRef.current < latestEvent.bodyMarkdown.length || queuedPusherReplyEventsRef.current.length > 0 || !!completedPusherReplyEventRef.current;
    if (!shouldResumePacing) {
        return;
    }

    startPusherReplyPace(runtime);
    tickPacing(runtime);
}

function useStreamedReplyPacing(reportID: string, isGroupPolicyReport: boolean) {
    // Lazy-init from the module-level cache so a remount (ReportScreen
    // unmount/remount on chat-switch) restores the in-progress reply on the
    // first paint instead of flashing the synthetic bubble away.
    const [reply, setReply] = useState<StreamedReply | null>(() => getCachedReply(reportID));
    const currentReplyRef = useRef<StreamedReply | null>(reply);
    const completedReportActionIDsRef = useRef(new Set<string>());
    const visibleBodyMarkdownRef = useRef(reply?.bodyMarkdown ?? '');
    const visibleSourceMarkdownRef = useRef(reply?.pusherVisibleSourceMarkdown ?? reply?.bodyMarkdown ?? '');
    const visibleSourceOffsetRef = useRef(reply?.pusherVisibleSourceOffset ?? reply?.bodyMarkdown?.length ?? 0);
    const visibleSequenceRef = useRef(reply?.sequence ?? 0);
    const latestPusherReplyEventRef = useRef<StreamedReplyEvent | null>(buildPusherReplyEventFromCachedReply(reportID, reply));
    const queuedPusherReplyEventsRef = useRef<StreamedReplyEvent[]>(reply?.pusherQueuedTargetEvents ?? []);
    const completedPusherReplyEventRef = useRef<StreamedReplyEvent | null>(reply?.pusherPendingCompletionEvent ?? null);
    const terminalPusherReplyEventRef = useRef<StreamedReplyEvent | null>(reply?.pusherTerminalEvent ?? reply?.pusherPendingCompletionEvent ?? null);
    const lastPaceTickTimeRef = useRef(0);
    const pusherPaceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const finalRenderedHTMLRevealDurationRef = useRef(0);
    const finalRenderedHTMLRevealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const finalRenderedHTMLRevealTokensRef = useRef<string[]>([]);
    const finalRenderedHTMLRevealStartedAtRef = useRef(0);
    const finalRenderedHTMLRevealLastStageRef = useRef(0);
    const accountIDToName = useAccountIDToNameMap();
    const accountIDToNameRef = useRef(accountIDToName);
    useEffect(() => {
        accountIDToNameRef.current = accountIDToName;
    }, [accountIDToName]);
    const [pendingLocalReportActionID] = useOnyx(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${reportID}`, {
        selector: (pendingResponse) => pendingResponse?.reportAction.reportActionID,
    });

    const clearStreamedReply = () => {
        clearCachedPusherReply({
            accountIDToNameRef,
            completedReportActionIDsRef,
            completedPusherReplyEventRef,
            currentReplyRef,
            finalRenderedHTMLRevealDurationRef,
            finalRenderedHTMLRevealIntervalRef,
            finalRenderedHTMLRevealLastStageRef,
            finalRenderedHTMLRevealStartedAtRef,
            finalRenderedHTMLRevealTokensRef,
            isGroupPolicyReport,
            lastPaceTickTimeRef,
            latestPusherReplyEventRef,
            pusherPaceIntervalRef,
            queuedPusherReplyEventsRef,
            terminalPusherReplyEventRef,
            reportID,
            setReply,
            visibleBodyMarkdownRef,
            visibleSourceMarkdownRef,
            visibleSourceOffsetRef,
            visibleSequenceRef,
        });
    };

    const dispatchLocalReplyEvent = (event: StreamedReplyEvent) => {
        resetPusherReplyPace({
            completedPusherReplyEventRef,
            finalRenderedHTMLRevealDurationRef,
            finalRenderedHTMLRevealIntervalRef,
            finalRenderedHTMLRevealLastStageRef,
            finalRenderedHTMLRevealStartedAtRef,
            finalRenderedHTMLRevealTokensRef,
            lastPaceTickTimeRef,
            latestPusherReplyEventRef,
            pusherPaceIntervalRef,
            queuedPusherReplyEventsRef,
            terminalPusherReplyEventRef,
            visibleBodyMarkdownRef,
            visibleSourceMarkdownRef,
            visibleSourceOffsetRef,
        });
        setReply((currentReply) => {
            const next = applyStreamedReplyEvent(currentReply, event, reportID, isGroupPolicyReport, accountIDToNameRef.current);
            currentReplyRef.current = next;
            setCachedReply(reportID, next);
            return next;
        });
    };

    const revealStreamedReplyFromReportAction = (reportAction: ReportAction) => {
        const currentReply = currentReplyRef.current;
        const finalRenderedHTML = getReportActionHtml(reportAction);

        if (!currentReply || currentReply.reportAction.reportActionID !== reportAction.reportActionID || !finalRenderedHTML) {
            return;
        }

        // A completed reply belongs to the persisted action. Followup selection or other
        // later edits must not turn it back into a streaming reply.
        if (currentReply.status === STREAMED_REPLY_STATUS.COMPLETED && !currentReply.pusherPendingCompletionEvent) {
            clearStreamedReply();
            return;
        }

        // The local reveal already accelerates when this saved action arrives. Let it
        // finish before reconciliation takes over, so two timers cannot advance the same reply.
        if (pendingLocalReportActionID === reportAction.reportActionID) {
            return;
        }

        const latestPusherReplyEvent = latestPusherReplyEventRef.current;
        if (latestPusherReplyEvent?.reportActionID === reportAction.reportActionID && latestPusherReplyEvent.finalRenderedHTML === finalRenderedHTML) {
            return;
        }

        const sequence = Math.max(currentReply.sequence, latestPusherReplyEvent?.sequence ?? 0, visibleSequenceRef.current) + 1;
        startFinalRenderedHTMLReveal(
            {
                accountIDToNameRef,
                completedReportActionIDsRef,
                completedPusherReplyEventRef,
                currentReplyRef,
                finalRenderedHTMLRevealDurationRef,
                finalRenderedHTMLRevealIntervalRef,
                finalRenderedHTMLRevealLastStageRef,
                finalRenderedHTMLRevealStartedAtRef,
                finalRenderedHTMLRevealTokensRef,
                isGroupPolicyReport,
                lastPaceTickTimeRef,
                latestPusherReplyEventRef,
                pusherPaceIntervalRef,
                queuedPusherReplyEventsRef,
                terminalPusherReplyEventRef,
                reportID,
                setReply,
                visibleBodyMarkdownRef,
                visibleSourceMarkdownRef,
                visibleSourceOffsetRef,
                visibleSequenceRef,
            },
            {
                reportID,
                reportActionID: reportAction.reportActionID,
                streamSessionID: latestPusherReplyEvent?.streamSessionID ?? currentReply.streamSessionID,
                sequence,
                status: STREAMED_REPLY_STATUS.COMPLETED,
                created: reportAction.created,
                actorAccountID: reportAction.actorAccountID,
                finalRenderedHTML,
            },
            ACCELERATED_REMAINING_MS,
        );
    };

    useEffect(() => {
        const runtime = {
            accountIDToNameRef,
            completedReportActionIDsRef,
            completedPusherReplyEventRef,
            currentReplyRef,
            finalRenderedHTMLRevealDurationRef,
            finalRenderedHTMLRevealIntervalRef,
            finalRenderedHTMLRevealLastStageRef,
            finalRenderedHTMLRevealStartedAtRef,
            finalRenderedHTMLRevealTokensRef,
            isGroupPolicyReport,
            lastPaceTickTimeRef,
            latestPusherReplyEventRef,
            pusherPaceIntervalRef,
            queuedPusherReplyEventsRef,
            terminalPusherReplyEventRef,
            reportID,
            setReply,
            visibleBodyMarkdownRef,
            visibleSourceMarkdownRef,
            visibleSourceOffsetRef,
            visibleSequenceRef,
        };
        const channelName = getReportChannelName(reportID);
        const unregisterResubscribe = Pusher.onChannelResubscribe(channelName, () => {
            clearCachedPusherReply(runtime);
        });

        const replyEventSubscriptions = [
            {
                eventType: Pusher.TYPE.CONCIERGE_DRAFT_EVENTS,
                listener: Pusher.subscribe(channelName, Pusher.TYPE.CONCIERGE_DRAFT_EVENTS, (eventData: StreamedReplyEventsEvent) => {
                    handlePusherReplyEvents(runtime, eventData);
                }),
            },
            ...PUSHER_REPLY_EVENT_TYPES.map((eventType) => ({
                eventType,
                listener: Pusher.subscribe(channelName, eventType, (eventData: StreamedReplyEvent) => {
                    handlePusherReplyEvent(runtime, eventData);
                }),
            })),
        ];

        const subscriptions = replyEventSubscriptions.map(({eventType, listener}) => {
            listener.catch((error: unknown) => {
                Log.hmmm('Failed to subscribe to Pusher concierge draft events', {eventType, reportID, error});
            });

            return listener;
        });

        resumeCachedPusherReplyPace(runtime);
        const unsubscribeVisibility = Visibility.onVisibilityChange(() => {
            if (!Visibility.isVisible()) {
                return;
            }

            if (completedPusherReplyEventRef.current) {
                // Completion may arrive while the tab is hidden. Reveal the full target on visibility return
                // so final HTML is not delayed by throttled timers.
                revealFullPusherReplyTarget(runtime);
                return;
            }

            if (finalRenderedHTMLRevealIntervalRef.current) {
                tickFinalRenderedHTMLReveal(runtime);
                return;
            }

            if (!pusherPaceIntervalRef.current) {
                return;
            }

            tickPacing(runtime);
        });

        return () => {
            unsubscribeVisibility();
            stopPusherReplyPace(runtime);
            stopFinalRenderedHTMLReveal(runtime);
            unregisterResubscribe();
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        };
    }, [reportID, isGroupPolicyReport]);

    return {clearStreamedReply, dispatchLocalReplyEvent, reply, revealStreamedReplyFromReportAction};
}

export default useStreamedReplyPacing;
