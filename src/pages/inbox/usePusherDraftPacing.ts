import {useEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import {getReportChannelName} from '@libs/actions/Report';
import {easeOut, getRevealDurationMS, MIN_TRICKLE_TOKEN_COUNT, TICK_INTERVAL_MS, TRICKLE_HARD_CAP_MS} from '@libs/ConciergeRevealUtils';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent, ConciergeDraftEventsEvent} from '@libs/Pusher/types';
import tokenizeForReveal from '@libs/ReportActionFollowupUtils/tokenizeForReveal';
import {getReportActionHtml} from '@libs/ReportActionsUtils';
import Visibility from '@libs/Visibility';
import type {ConciergeDraft} from './conciergeDraftState';
import {applyConciergeDraftEvent, CONCIERGE_DRAFT_STATUS, getCachedDraft, getNextVisibleConciergeDraftMarkdown, setCachedDraft} from './conciergeDraftState';

type MutableRef<T> = {
    current: T;
};

type PusherDraftPaceRefs = {
    completedPusherDraftEventRef: MutableRef<ConciergeDraftEvent | null>;
    finalRenderedHTMLRevealIntervalRef: MutableRef<ReturnType<typeof setInterval> | null>;
    finalRenderedHTMLRevealLastStageRef: MutableRef<number>;
    finalRenderedHTMLRevealStartedAtRef: MutableRef<number>;
    finalRenderedHTMLRevealTokensRef: MutableRef<string[]>;
    lastPaceTickTimeRef: MutableRef<number>;
    latestPusherDraftEventRef: MutableRef<ConciergeDraftEvent | null>;
    pusherPaceIntervalRef: MutableRef<ReturnType<typeof setInterval> | null>;
    queuedPusherDraftEventsRef: MutableRef<ConciergeDraftEvent[]>;
    visibleBodyMarkdownRef: MutableRef<string>;
    visibleSourceMarkdownRef: MutableRef<string>;
    visibleSourceOffsetRef: MutableRef<number>;
};

type PusherDraftPacingRuntime = PusherDraftPaceRefs & {
    currentDraftRef: MutableRef<ConciergeDraft | null>;
    isGroupPolicyReport: boolean;
    reportID: string;
    setDraft: Dispatch<SetStateAction<ConciergeDraft | null>>;
    visibleSequenceRef: MutableRef<number>;
};

const PUSHER_DRAFT_PACE_INTERVAL_MS = 10;
const PUSHER_DRAFT_EVENT_TYPES = [
    Pusher.TYPE.CONCIERGE_DRAFT_STARTED,
    Pusher.TYPE.CONCIERGE_DRAFT_UPDATED,
    Pusher.TYPE.CONCIERGE_DRAFT_COMPLETED,
    Pusher.TYPE.CONCIERGE_DRAFT_FAILED,
    Pusher.TYPE.CONCIERGE_DRAFT_CLEARED,
] as const;

function buildPusherDraftEventFromCachedDraft(
    reportID: string,
    draft: ConciergeDraft | null,
    status: ConciergeDraftEvent['status'] = CONCIERGE_DRAFT_STATUS.UPDATED,
): ConciergeDraftEvent | null {
    if (!draft?.pusherTargetBodyMarkdown && !draft?.pusherTargetFinalRenderedHTML) {
        return null;
    }

    return {
        reportID,
        reportActionID: draft.reportAction.reportActionID,
        streamSessionID: draft.streamSessionID,
        sequence: draft.pusherTargetSequence ?? 0,
        status,
        created: draft.reportAction.created,
        bodyMarkdown: draft.pusherTargetBodyMarkdown,
        finalRenderedHTML: draft.pusherTargetFinalRenderedHTML,
        terminalReason: draft.terminalReason,
    };
}

function stopPusherDraftPace(runtime: PusherDraftPaceRefs) {
    const {pusherPaceIntervalRef} = runtime;

    if (!pusherPaceIntervalRef.current) {
        return;
    }

    clearInterval(pusherPaceIntervalRef.current);
    pusherPaceIntervalRef.current = null;
}

function stopFinalRenderedHTMLReveal(runtime: PusherDraftPaceRefs) {
    const {finalRenderedHTMLRevealIntervalRef} = runtime;

    if (!finalRenderedHTMLRevealIntervalRef.current) {
        return;
    }

    clearInterval(finalRenderedHTMLRevealIntervalRef.current);
    finalRenderedHTMLRevealIntervalRef.current = null;
}

function resetPusherDraftPace(runtime: PusherDraftPaceRefs) {
    const {
        completedPusherDraftEventRef,
        finalRenderedHTMLRevealLastStageRef,
        finalRenderedHTMLRevealStartedAtRef,
        finalRenderedHTMLRevealTokensRef,
        lastPaceTickTimeRef,
        latestPusherDraftEventRef,
        queuedPusherDraftEventsRef,
        visibleBodyMarkdownRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;

    stopPusherDraftPace(runtime);
    stopFinalRenderedHTMLReveal(runtime);
    latestPusherDraftEventRef.current = null;
    queuedPusherDraftEventsRef.current = [];
    completedPusherDraftEventRef.current = null;
    finalRenderedHTMLRevealTokensRef.current = [];
    finalRenderedHTMLRevealStartedAtRef.current = 0;
    finalRenderedHTMLRevealLastStageRef.current = 0;
    visibleBodyMarkdownRef.current = '';
    visibleSourceMarkdownRef.current = '';
    visibleSourceOffsetRef.current = 0;
    lastPaceTickTimeRef.current = 0;
}

function clearCachedPusherDraft(runtime: PusherDraftPacingRuntime) {
    const {currentDraftRef, reportID, setDraft} = runtime;

    resetPusherDraftPace(runtime);
    currentDraftRef.current = null;
    setCachedDraft(reportID, null);
    setDraft(null);
}

function cacheDraftWithPusherPaceState(runtime: PusherDraftPacingRuntime, nextDraft: ConciergeDraft | null): ConciergeDraft | null {
    const {completedPusherDraftEventRef, currentDraftRef, latestPusherDraftEventRef, queuedPusherDraftEventsRef, reportID, visibleSourceMarkdownRef, visibleSourceOffsetRef} = runtime;

    if (!nextDraft) {
        currentDraftRef.current = null;
        setCachedDraft(reportID, null);
        return null;
    }

    const latestPusherDraftEvent = latestPusherDraftEventRef.current;
    const queuedPusherDraftEvents = queuedPusherDraftEventsRef.current;
    const completedPusherDraftEvent = completedPusherDraftEventRef.current;
    let nextDraftWithPusherPaceState = nextDraft;
    if (latestPusherDraftEvent?.bodyMarkdown) {
        nextDraftWithPusherPaceState = {
            ...nextDraft,
            pusherTargetBodyMarkdown: latestPusherDraftEvent.bodyMarkdown,
            pusherTargetFinalRenderedHTML: undefined,
            pusherTargetSequence: latestPusherDraftEvent.sequence,
            pusherQueuedTargetEvents: queuedPusherDraftEvents.length > 0 ? [...queuedPusherDraftEvents] : undefined,
            pusherPendingCompletionEvent: nextDraft.status === CONCIERGE_DRAFT_STATUS.COMPLETED ? undefined : (completedPusherDraftEvent ?? undefined),
            pusherVisibleSourceMarkdown: visibleSourceMarkdownRef.current,
            pusherVisibleSourceOffset: visibleSourceOffsetRef.current,
        };
    } else if (latestPusherDraftEvent?.finalRenderedHTML && nextDraft.status !== CONCIERGE_DRAFT_STATUS.COMPLETED) {
        nextDraftWithPusherPaceState = {
            ...nextDraft,
            pusherTargetBodyMarkdown: undefined,
            pusherTargetFinalRenderedHTML: latestPusherDraftEvent.finalRenderedHTML,
            pusherTargetSequence: latestPusherDraftEvent.sequence,
            pusherQueuedTargetEvents: undefined,
            pusherPendingCompletionEvent: undefined,
            pusherVisibleSourceMarkdown: undefined,
            pusherVisibleSourceOffset: undefined,
        };
    }

    currentDraftRef.current = nextDraftWithPusherPaceState;
    setCachedDraft(reportID, nextDraftWithPusherPaceState);
    return nextDraftWithPusherPaceState;
}

function cacheCurrentDraftWithPusherPaceState(runtime: PusherDraftPacingRuntime) {
    const {setDraft} = runtime;

    setDraft((currentDraft) => cacheDraftWithPusherPaceState(runtime, currentDraft));
}

function publishVisibleEvent(
    runtime: PusherDraftPacingRuntime,
    event: ConciergeDraftEvent,
    visibleMarkdown?: ReturnType<typeof getNextVisibleConciergeDraftMarkdown>,
    status?: ConciergeDraftEvent['status'],
    finalRenderedHTML?: string,
) {
    const {isGroupPolicyReport, reportID, setDraft, visibleBodyMarkdownRef, visibleSequenceRef, visibleSourceMarkdownRef, visibleSourceOffsetRef} = runtime;

    if (visibleMarkdown) {
        visibleBodyMarkdownRef.current = visibleMarkdown.bodyMarkdown;
        visibleSourceMarkdownRef.current = visibleMarkdown.sourceMarkdown;
        visibleSourceOffsetRef.current = visibleMarkdown.sourceOffset;
    }

    visibleSequenceRef.current += 1;
    const visibleStatus = status ?? event.status;
    const visibleEvent = {
        ...event,
        bodyMarkdown: visibleMarkdown?.bodyMarkdown,
        ...(finalRenderedHTML !== undefined ? {finalRenderedHTML} : {}),
        sequence: visibleSequenceRef.current,
        status: visibleStatus,
    };
    setDraft((currentDraft) => {
        const next = applyConciergeDraftEvent(currentDraft, visibleEvent, reportID, isGroupPolicyReport);
        return cacheDraftWithPusherPaceState(runtime, next);
    });
}

function getNextLastPaceTickTime(now: number, paceStartTime: number, elapsedIntervals: number, revealedUnits: number, shouldPreserveElapsedDebt: boolean): number {
    if (!shouldPreserveElapsedDebt || elapsedIntervals === 0 || revealedUnits === 0) {
        return now;
    }

    return Math.min(now, paceStartTime + revealedUnits * PUSHER_DRAFT_PACE_INTERVAL_MS);
}

function tickPacing(runtime: PusherDraftPacingRuntime) {
    const {
        completedPusherDraftEventRef,
        lastPaceTickTimeRef,
        latestPusherDraftEventRef,
        queuedPusherDraftEventsRef,
        visibleBodyMarkdownRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;
    const latestEvent = latestPusherDraftEventRef.current;
    const targetBodyMarkdown = latestEvent?.bodyMarkdown ?? '';

    if (!latestEvent || !targetBodyMarkdown) {
        stopPusherDraftPace(runtime);
        return;
    }

    const completedEvent = completedPusherDraftEventRef.current;
    const hasQueuedTarget = queuedPusherDraftEventsRef.current.length > 0;
    const now = Date.now();
    const elapsed = lastPaceTickTimeRef.current ? Math.max(0, now - lastPaceTickTimeRef.current) : PUSHER_DRAFT_PACE_INTERVAL_MS;
    const elapsedIntervals = Math.floor(elapsed / PUSHER_DRAFT_PACE_INTERVAL_MS);
    const unitsToReveal = Math.max(1, elapsedIntervals);
    const paceStartTime = lastPaceTickTimeRef.current || now - elapsedIntervals * PUSHER_DRAFT_PACE_INTERVAL_MS;
    let revealedUnits = 0;
    let nextVisibleMarkdown = {
        bodyMarkdown: visibleBodyMarkdownRef.current,
        sourceMarkdown: visibleSourceMarkdownRef.current,
        sourceOffset: visibleSourceOffsetRef.current,
    };

    while (revealedUnits < unitsToReveal && nextVisibleMarkdown.sourceOffset < targetBodyMarkdown.length) {
        const advancedVisibleMarkdown = getNextVisibleConciergeDraftMarkdown(
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
        if (completedEvent?.finalRenderedHTML && !completedEvent.bodyMarkdown && completedEvent.status !== CONCIERGE_DRAFT_STATUS.COMPLETED && !hasQueuedTarget && isTargetFullyVisible) {
            completedPusherDraftEventRef.current = null;
            publishVisibleEvent(runtime, latestEvent, nextVisibleMarkdown, CONCIERGE_DRAFT_STATUS.UPDATED);
            startFinalRenderedHTMLReveal(runtime, completedEvent);
            return;
        }

        const status = completedEvent && !hasQueuedTarget && isTargetFullyVisible ? CONCIERGE_DRAFT_STATUS.COMPLETED : CONCIERGE_DRAFT_STATUS.UPDATED;
        publishVisibleEvent(runtime, status === CONCIERGE_DRAFT_STATUS.COMPLETED && completedEvent ? completedEvent : latestEvent, nextVisibleMarkdown, status);

        if (status === CONCIERGE_DRAFT_STATUS.COMPLETED) {
            completedPusherDraftEventRef.current = null;
            stopPusherDraftPace(runtime);
        }

        if (isTargetFullyVisible && hasQueuedTarget && revealedUnits < unitsToReveal && promoteQueuedPusherDraftTarget(runtime)) {
            tickPacing(runtime);
        }
        return;
    }

    if (promoteQueuedPusherDraftTarget(runtime)) {
        if (elapsedIntervals > 0) {
            tickPacing(runtime);
            return;
        }

        lastPaceTickTimeRef.current = now;
        startPusherDraftPace(runtime);
        return;
    }

    lastPaceTickTimeRef.current = now;

    if (completedEvent) {
        completedPusherDraftEventRef.current = null;
        if (completedEvent.finalRenderedHTML && !completedEvent.bodyMarkdown && completedEvent.status !== CONCIERGE_DRAFT_STATUS.COMPLETED) {
            startFinalRenderedHTMLReveal(runtime, completedEvent);
            return;
        }
        publishVisibleEvent(
            runtime,
            completedEvent,
            {bodyMarkdown: targetBodyMarkdown, sourceMarkdown: targetBodyMarkdown, sourceOffset: targetBodyMarkdown.length},
            CONCIERGE_DRAFT_STATUS.COMPLETED,
        );
    }

    stopPusherDraftPace(runtime);
}

function startPusherDraftPace(runtime: PusherDraftPacingRuntime) {
    const {lastPaceTickTimeRef, pusherPaceIntervalRef} = runtime;

    if (pusherPaceIntervalRef.current) {
        return;
    }

    lastPaceTickTimeRef.current = Date.now();
    pusherPaceIntervalRef.current = setInterval(() => tickPacing(runtime), PUSHER_DRAFT_PACE_INTERVAL_MS);
}

function getRevealStageForCurrentDraft(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent, tokens: string[]): number {
    const {currentDraftRef} = runtime;
    const currentDraft = currentDraftRef.current;
    if (!currentDraft || currentDraft.streamSessionID !== event.streamSessionID) {
        return 0;
    }

    const currentHTML = getReportActionHtml(currentDraft.reportAction);
    if (!currentHTML) {
        return 0;
    }

    return Math.max(
        0,
        tokens.findLastIndex((token) => token === currentHTML),
    );
}

function tickFinalRenderedHTMLReveal(runtime: PusherDraftPacingRuntime) {
    const {finalRenderedHTMLRevealLastStageRef, finalRenderedHTMLRevealStartedAtRef, finalRenderedHTMLRevealTokensRef, latestPusherDraftEventRef} = runtime;
    const event = latestPusherDraftEventRef.current;
    const finalRenderedHTML = event?.finalRenderedHTML ?? '';
    const tokens = finalRenderedHTMLRevealTokensRef.current;

    if (!event || !finalRenderedHTML || tokens.length <= 1) {
        stopFinalRenderedHTMLReveal(runtime);
        return;
    }

    const lastIndex = tokens.length - 1;
    const elapsed = Date.now() - finalRenderedHTMLRevealStartedAtRef.current;
    const effectiveDuration = getRevealDurationMS(tokens.length);
    const progress = easeOut(elapsed / effectiveDuration);
    const stage = Math.min(lastIndex, Math.ceil(progress * lastIndex));
    const shouldComplete = progress >= 1 || elapsed >= TRICKLE_HARD_CAP_MS;

    if (shouldComplete) {
        publishVisibleEvent(runtime, event, undefined, CONCIERGE_DRAFT_STATUS.COMPLETED, tokens.at(-1) ?? finalRenderedHTML);
        stopFinalRenderedHTMLReveal(runtime);
        return;
    }

    if (stage <= finalRenderedHTMLRevealLastStageRef.current) {
        return;
    }

    finalRenderedHTMLRevealLastStageRef.current = stage;
    publishVisibleEvent(runtime, event, undefined, CONCIERGE_DRAFT_STATUS.UPDATED, tokens.at(stage) ?? '');
}

function startFinalRenderedHTMLReveal(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent) {
    const {
        completedPusherDraftEventRef,
        finalRenderedHTMLRevealIntervalRef,
        finalRenderedHTMLRevealLastStageRef,
        finalRenderedHTMLRevealStartedAtRef,
        finalRenderedHTMLRevealTokensRef,
        latestPusherDraftEventRef,
        queuedPusherDraftEventsRef,
        visibleBodyMarkdownRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;
    const finalRenderedHTML = event.finalRenderedHTML ?? '';
    if (!finalRenderedHTML) {
        return;
    }

    const tokens = tokenizeForReveal(finalRenderedHTML);
    stopPusherDraftPace(runtime);
    stopFinalRenderedHTMLReveal(runtime);
    completedPusherDraftEventRef.current = null;
    queuedPusherDraftEventsRef.current = [];
    visibleBodyMarkdownRef.current = '';
    visibleSourceMarkdownRef.current = '';
    visibleSourceOffsetRef.current = 0;
    latestPusherDraftEventRef.current = event;

    if (tokens.length < MIN_TRICKLE_TOKEN_COUNT) {
        finalRenderedHTMLRevealTokensRef.current = [];
        finalRenderedHTMLRevealStartedAtRef.current = 0;
        finalRenderedHTMLRevealLastStageRef.current = 0;
        publishVisibleEvent(runtime, event, undefined, CONCIERGE_DRAFT_STATUS.COMPLETED, tokens.at(-1) ?? finalRenderedHTML);
        return;
    }

    const lastIndex = tokens.length - 1;
    const currentStage = getRevealStageForCurrentDraft(runtime, event, tokens);
    const initialStage = Math.max(1, Math.min(lastIndex, currentStage));
    const initialProgress = initialStage / lastIndex;
    const effectiveDuration = getRevealDurationMS(tokens.length);
    const elapsedOffset = (1 - Math.sqrt(1 - initialProgress)) * effectiveDuration;

    finalRenderedHTMLRevealTokensRef.current = tokens;
    finalRenderedHTMLRevealStartedAtRef.current = Date.now() - elapsedOffset;
    finalRenderedHTMLRevealLastStageRef.current = initialStage;
    publishVisibleEvent(
        runtime,
        event,
        undefined,
        event.status === CONCIERGE_DRAFT_STATUS.STARTED ? CONCIERGE_DRAFT_STATUS.STARTED : CONCIERGE_DRAFT_STATUS.UPDATED,
        tokens.at(initialStage) ?? '',
    );

    if (finalRenderedHTMLRevealIntervalRef.current) {
        return;
    }

    finalRenderedHTMLRevealIntervalRef.current = setInterval(() => tickFinalRenderedHTMLReveal(runtime), TICK_INTERVAL_MS);
}

function getNewestPusherDraftTarget(runtime: PusherDraftPacingRuntime): ConciergeDraftEvent | null {
    return runtime.queuedPusherDraftEventsRef.current.at(-1) ?? runtime.latestPusherDraftEventRef.current;
}

function revealFullPusherDraftTarget(runtime: PusherDraftPacingRuntime) {
    const {completedPusherDraftEventRef, lastPaceTickTimeRef, latestPusherDraftEventRef, queuedPusherDraftEventsRef} = runtime;
    const newestTarget = getNewestPusherDraftTarget(runtime);
    const completedEvent = completedPusherDraftEventRef.current;

    lastPaceTickTimeRef.current = Date.now();
    stopPusherDraftPace(runtime);

    if (!newestTarget?.bodyMarkdown) {
        if (completedEvent) {
            completedPusherDraftEventRef.current = null;
            if (completedEvent.finalRenderedHTML && !completedEvent.bodyMarkdown && completedEvent.status !== CONCIERGE_DRAFT_STATUS.COMPLETED) {
                startFinalRenderedHTMLReveal(runtime, completedEvent);
                return;
            }
            publishVisibleEvent(runtime, completedEvent, undefined, CONCIERGE_DRAFT_STATUS.COMPLETED);
        }
        return;
    }

    const targetBodyMarkdown = newestTarget.bodyMarkdown;
    latestPusherDraftEventRef.current = newestTarget;
    queuedPusherDraftEventsRef.current = [];

    if (completedEvent?.finalRenderedHTML && !completedEvent.bodyMarkdown && completedEvent.status !== CONCIERGE_DRAFT_STATUS.COMPLETED) {
        completedPusherDraftEventRef.current = null;
        publishVisibleEvent(
            runtime,
            newestTarget,
            {bodyMarkdown: targetBodyMarkdown, sourceMarkdown: targetBodyMarkdown, sourceOffset: targetBodyMarkdown.length},
            CONCIERGE_DRAFT_STATUS.UPDATED,
        );
        startFinalRenderedHTMLReveal(runtime, completedEvent);
        return;
    }

    publishVisibleEvent(
        runtime,
        completedEvent ?? newestTarget,
        {bodyMarkdown: targetBodyMarkdown, sourceMarkdown: targetBodyMarkdown, sourceOffset: targetBodyMarkdown.length},
        completedEvent ? CONCIERGE_DRAFT_STATUS.COMPLETED : CONCIERGE_DRAFT_STATUS.UPDATED,
    );

    if (completedEvent) {
        completedPusherDraftEventRef.current = null;
    }
}

function queuePusherDraftTargets(runtime: PusherDraftPacingRuntime, events: ConciergeDraftEvent[]) {
    const {queuedPusherDraftEventsRef} = runtime;
    let newestTarget = getNewestPusherDraftTarget(runtime);
    const eventsToQueue: ConciergeDraftEvent[] = [];

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

    queuedPusherDraftEventsRef.current = [...queuedPusherDraftEventsRef.current, ...eventsToQueue];
}

function setOrQueuePusherDraftTarget(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent): boolean {
    const {completedPusherDraftEventRef, currentDraftRef, latestPusherDraftEventRef, queuedPusherDraftEventsRef, visibleBodyMarkdownRef, visibleSourceMarkdownRef, visibleSourceOffsetRef} =
        runtime;
    const currentTarget = latestPusherDraftEventRef.current;
    const isCurrentTargetFullyVisible = !!currentTarget?.bodyMarkdown && visibleSourceOffsetRef.current >= currentTarget.bodyMarkdown.length;
    const shouldQueue =
        !!currentTarget?.bodyMarkdown &&
        currentTarget.streamSessionID === event.streamSessionID &&
        event.sequence > currentTarget.sequence &&
        (!isCurrentTargetFullyVisible || queuedPusherDraftEventsRef.current.length > 0);

    if (shouldQueue) {
        queuePusherDraftTargets(runtime, [event]);
        return true;
    }

    const latestEvent = getNewestPusherDraftTarget(runtime);
    const activeStreamSessionID = latestEvent?.streamSessionID ?? currentDraftRef.current?.streamSessionID;
    if (activeStreamSessionID && activeStreamSessionID !== event.streamSessionID) {
        stopPusherDraftPace(runtime);
        stopFinalRenderedHTMLReveal(runtime);
        completedPusherDraftEventRef.current = null;
        queuedPusherDraftEventsRef.current = [];
        visibleBodyMarkdownRef.current = '';
        visibleSourceMarkdownRef.current = '';
        visibleSourceOffsetRef.current = 0;
    }

    stopFinalRenderedHTMLReveal(runtime);
    latestPusherDraftEventRef.current = event;
    queuedPusherDraftEventsRef.current = [];
    return false;
}

function promoteQueuedPusherDraftTarget(runtime: PusherDraftPacingRuntime): boolean {
    const {latestPusherDraftEventRef, queuedPusherDraftEventsRef} = runtime;
    const [queuedPusherDraftEvent, ...remainingQueuedPusherDraftEvents] = queuedPusherDraftEventsRef.current;
    if (!queuedPusherDraftEvent?.bodyMarkdown) {
        return false;
    }

    latestPusherDraftEventRef.current = queuedPusherDraftEvent;
    queuedPusherDraftEventsRef.current = remainingQueuedPusherDraftEvents;
    return true;
}

function isStalePusherDraftEventAgainstTarget(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent, latestEvent: ConciergeDraftEvent | null): boolean {
    const {currentDraftRef, reportID} = runtime;

    if (event.reportID !== reportID) {
        return true;
    }

    if (latestEvent?.streamSessionID === event.streamSessionID && event.sequence <= latestEvent.sequence) {
        return true;
    }

    const activeStreamSessionID = latestEvent?.streamSessionID ?? currentDraftRef.current?.streamSessionID;
    return !!activeStreamSessionID && activeStreamSessionID !== event.streamSessionID && event.status !== CONCIERGE_DRAFT_STATUS.STARTED && event.status !== CONCIERGE_DRAFT_STATUS.UPDATED;
}

function isStalePusherDraftEvent(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent): boolean {
    return isStalePusherDraftEventAgainstTarget(runtime, event, getNewestPusherDraftTarget(runtime));
}

function handlePusherDraftEvent(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent) {
    const {completedPusherDraftEventRef, latestPusherDraftEventRef, visibleBodyMarkdownRef, visibleSourceMarkdownRef, visibleSourceOffsetRef} = runtime;

    if (isStalePusherDraftEvent(runtime, event)) {
        return;
    }

    if (event.status === CONCIERGE_DRAFT_STATUS.FAILED || event.status === CONCIERGE_DRAFT_STATUS.CLEARED) {
        resetPusherDraftPace(runtime);
        publishVisibleEvent(runtime, event, undefined, event.status);
        return;
    }

    if (event.status === CONCIERGE_DRAFT_STATUS.COMPLETED) {
        let didQueueTarget = false;
        if (event.bodyMarkdown) {
            didQueueTarget = setOrQueuePusherDraftTarget(runtime, {
                ...event,
                finalRenderedHTML: undefined,
                status: CONCIERGE_DRAFT_STATUS.UPDATED,
            });
        }
        const hasBodyTarget = !!latestPusherDraftEventRef.current?.bodyMarkdown || didQueueTarget;
        if (!event.bodyMarkdown && event.finalRenderedHTML && !hasBodyTarget) {
            startFinalRenderedHTMLReveal(runtime, event);
            return;
        }
        completedPusherDraftEventRef.current = event;
        if (hasBodyTarget) {
            if (didQueueTarget) {
                cacheCurrentDraftWithPusherPaceState(runtime);
            }
            startPusherDraftPace(runtime);
            if (!didQueueTarget) {
                tickPacing(runtime);
            }
        } else {
            publishVisibleEvent(runtime, event, undefined, CONCIERGE_DRAFT_STATUS.COMPLETED);
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

    const didQueueTarget = setOrQueuePusherDraftTarget(runtime, event);
    if (didQueueTarget) {
        cacheCurrentDraftWithPusherPaceState(runtime);
        startPusherDraftPace(runtime);
        return;
    }

    const nextVisibleMarkdown = getNextVisibleConciergeDraftMarkdown(visibleBodyMarkdownRef.current, targetBodyMarkdown, visibleSourceOffsetRef.current, visibleSourceMarkdownRef.current);
    if (nextVisibleMarkdown.bodyMarkdown !== visibleBodyMarkdownRef.current || nextVisibleMarkdown.sourceOffset !== visibleSourceOffsetRef.current) {
        publishVisibleEvent(runtime, event, nextVisibleMarkdown, event.status);
    }

    if (nextVisibleMarkdown.sourceOffset < targetBodyMarkdown.length) {
        startPusherDraftPace(runtime);
    } else {
        stopPusherDraftPace(runtime);
    }
}

function handlePusherDraftEvents(runtime: PusherDraftPacingRuntime, eventData: ConciergeDraftEventsEvent) {
    const {completedPusherDraftEventRef, latestPusherDraftEventRef, queuedPusherDraftEventsRef, visibleSourceOffsetRef} = runtime;
    const targetEvents: ConciergeDraftEvent[] = [];
    let latestAcceptedEvent: ConciergeDraftEvent | null = null;
    let completedEvent: ConciergeDraftEvent | null = null;
    let finalRenderedHTMLEvent: ConciergeDraftEvent | null = null;

    for (const event of eventData.events) {
        if (isStalePusherDraftEventAgainstTarget(runtime, event, latestAcceptedEvent ?? getNewestPusherDraftTarget(runtime))) {
            continue;
        }

        if (event.status === CONCIERGE_DRAFT_STATUS.FAILED || event.status === CONCIERGE_DRAFT_STATUS.CLEARED) {
            resetPusherDraftPace(runtime);
            publishVisibleEvent(runtime, event, undefined, event.status);
            return;
        }

        if (event.status === CONCIERGE_DRAFT_STATUS.COMPLETED) {
            if (event.bodyMarkdown) {
                const completedTargetEvent = {
                    ...event,
                    finalRenderedHTML: undefined,
                    status: CONCIERGE_DRAFT_STATUS.UPDATED,
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
            completedPusherDraftEventRef.current = finalRenderedHTMLEvent;
        } else if (completedEvent) {
            completedPusherDraftEventRef.current = completedEvent;
        }

        const previousVisibleSequence = runtime.visibleSequenceRef.current;
        handlePusherDraftEvent(runtime, firstVisibleEvent);
        queuePusherDraftTargets(runtime, queuedTargetEvents);

        // publishVisibleEvent persists refs when it runs; otherwise persist the accepted target/queue state here.
        if (queuedTargetEvents.length > 0 || runtime.visibleSequenceRef.current === previousVisibleSequence) {
            cacheCurrentDraftWithPusherPaceState(runtime);
        }
    } else if (completedEvent) {
        if (finalRenderedHTMLEvent) {
            startFinalRenderedHTMLReveal(runtime, finalRenderedHTMLEvent);
            return;
        }
        completedPusherDraftEventRef.current = completedEvent;
    } else if (finalRenderedHTMLEvent) {
        startFinalRenderedHTMLReveal(runtime, finalRenderedHTMLEvent);
        return;
    }

    if (
        latestPusherDraftEventRef.current?.bodyMarkdown &&
        (visibleSourceOffsetRef.current < latestPusherDraftEventRef.current.bodyMarkdown.length || queuedPusherDraftEventsRef.current.length > 0 || !!completedPusherDraftEventRef.current)
    ) {
        startPusherDraftPace(runtime);
        return;
    }

    if (completedPusherDraftEventRef.current) {
        if (completedPusherDraftEventRef.current.finalRenderedHTML && !completedPusherDraftEventRef.current.bodyMarkdown) {
            const finalRenderedHTMLCompletionEvent = completedPusherDraftEventRef.current;
            completedPusherDraftEventRef.current = null;
            startFinalRenderedHTMLReveal(runtime, finalRenderedHTMLCompletionEvent);
            return;
        }
        publishVisibleEvent(runtime, completedPusherDraftEventRef.current, undefined, CONCIERGE_DRAFT_STATUS.COMPLETED);
        completedPusherDraftEventRef.current = null;
    }
}

function resumeCachedPusherDraftPace(runtime: PusherDraftPacingRuntime) {
    const {completedPusherDraftEventRef, latestPusherDraftEventRef, queuedPusherDraftEventsRef, visibleSourceOffsetRef} = runtime;
    const latestEvent = latestPusherDraftEventRef.current;
    if (!latestEvent?.bodyMarkdown) {
        if (latestEvent?.finalRenderedHTML) {
            startFinalRenderedHTMLReveal(runtime, latestEvent);
        }
        return;
    }

    const shouldResumePacing = visibleSourceOffsetRef.current < latestEvent.bodyMarkdown.length || queuedPusherDraftEventsRef.current.length > 0 || !!completedPusherDraftEventRef.current;
    if (!shouldResumePacing) {
        return;
    }

    startPusherDraftPace(runtime);
    tickPacing(runtime);
}

function usePusherDraftPacing(reportID: string, isGroupPolicyReport: boolean) {
    // Lazy-init from the module-level cache so a remount (ReportScreen
    // unmount/remount on chat-switch) restores the in-progress draft on the
    // first paint instead of flashing the synthetic bubble away.
    const [draft, setDraft] = useState<ConciergeDraft | null>(() => getCachedDraft(reportID));
    const currentDraftRef = useRef<ConciergeDraft | null>(draft);
    const visibleBodyMarkdownRef = useRef(draft?.bodyMarkdown ?? '');
    const visibleSourceMarkdownRef = useRef(draft?.pusherVisibleSourceMarkdown ?? draft?.bodyMarkdown ?? '');
    const visibleSourceOffsetRef = useRef(draft?.pusherVisibleSourceOffset ?? draft?.bodyMarkdown?.length ?? 0);
    const visibleSequenceRef = useRef(draft?.sequence ?? 0);
    const latestPusherDraftEventRef = useRef<ConciergeDraftEvent | null>(buildPusherDraftEventFromCachedDraft(reportID, draft));
    const queuedPusherDraftEventsRef = useRef<ConciergeDraftEvent[]>(draft?.pusherQueuedTargetEvents ?? []);
    const completedPusherDraftEventRef = useRef<ConciergeDraftEvent | null>(draft?.pusherPendingCompletionEvent ?? null);
    const lastPaceTickTimeRef = useRef(0);
    const pusherPaceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const finalRenderedHTMLRevealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const finalRenderedHTMLRevealTokensRef = useRef<string[]>([]);
    const finalRenderedHTMLRevealStartedAtRef = useRef(0);
    const finalRenderedHTMLRevealLastStageRef = useRef(0);

    const clearDraft = () => {
        clearCachedPusherDraft({
            completedPusherDraftEventRef,
            currentDraftRef,
            finalRenderedHTMLRevealIntervalRef,
            finalRenderedHTMLRevealLastStageRef,
            finalRenderedHTMLRevealStartedAtRef,
            finalRenderedHTMLRevealTokensRef,
            isGroupPolicyReport,
            lastPaceTickTimeRef,
            latestPusherDraftEventRef,
            pusherPaceIntervalRef,
            queuedPusherDraftEventsRef,
            reportID,
            setDraft,
            visibleBodyMarkdownRef,
            visibleSourceMarkdownRef,
            visibleSourceOffsetRef,
            visibleSequenceRef,
        });
    };

    const dispatchLocalDraftEvent = (event: ConciergeDraftEvent) => {
        resetPusherDraftPace({
            completedPusherDraftEventRef,
            finalRenderedHTMLRevealIntervalRef,
            finalRenderedHTMLRevealLastStageRef,
            finalRenderedHTMLRevealStartedAtRef,
            finalRenderedHTMLRevealTokensRef,
            lastPaceTickTimeRef,
            latestPusherDraftEventRef,
            pusherPaceIntervalRef,
            queuedPusherDraftEventsRef,
            visibleBodyMarkdownRef,
            visibleSourceMarkdownRef,
            visibleSourceOffsetRef,
        });
        setDraft((currentDraft) => {
            const next = applyConciergeDraftEvent(currentDraft, event, reportID, isGroupPolicyReport);
            currentDraftRef.current = next;
            setCachedDraft(reportID, next);
            return next;
        });
    };

    useEffect(() => {
        const runtime = {
            completedPusherDraftEventRef,
            currentDraftRef,
            finalRenderedHTMLRevealIntervalRef,
            finalRenderedHTMLRevealLastStageRef,
            finalRenderedHTMLRevealStartedAtRef,
            finalRenderedHTMLRevealTokensRef,
            isGroupPolicyReport,
            lastPaceTickTimeRef,
            latestPusherDraftEventRef,
            pusherPaceIntervalRef,
            queuedPusherDraftEventsRef,
            reportID,
            setDraft,
            visibleBodyMarkdownRef,
            visibleSourceMarkdownRef,
            visibleSourceOffsetRef,
            visibleSequenceRef,
        };
        const channelName = getReportChannelName(reportID);
        const handleResubscribe = () => {
            clearCachedPusherDraft(runtime);
        };

        const draftEventSubscriptions = [
            {
                eventType: Pusher.TYPE.CONCIERGE_DRAFT_EVENTS,
                listener: Pusher.subscribe(
                    channelName,
                    Pusher.TYPE.CONCIERGE_DRAFT_EVENTS,
                    (eventData: ConciergeDraftEventsEvent) => {
                        handlePusherDraftEvents(runtime, eventData);
                    },
                    handleResubscribe,
                ),
            },
            ...PUSHER_DRAFT_EVENT_TYPES.map((eventType) => ({
                eventType,
                listener: Pusher.subscribe(
                    channelName,
                    eventType,
                    (eventData: ConciergeDraftEvent) => {
                        handlePusherDraftEvent(runtime, eventData);
                    },
                    handleResubscribe,
                ),
            })),
        ];

        const subscriptions = draftEventSubscriptions.map(({eventType, listener}) => {
            listener.catch((error: unknown) => {
                Log.hmmm('Failed to subscribe to Pusher concierge draft events', {eventType, reportID, error});
            });

            return listener;
        });

        resumeCachedPusherDraftPace(runtime);
        const unsubscribeVisibility = Visibility.onVisibilityChange(() => {
            if (!Visibility.isVisible()) {
                return;
            }

            if (completedPusherDraftEventRef.current) {
                // Completion may arrive while the tab is hidden. Reveal the full target on visibility return
                // so final HTML is not delayed by throttled timers.
                revealFullPusherDraftTarget(runtime);
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
            stopPusherDraftPace(runtime);
            stopFinalRenderedHTMLReveal(runtime);
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        };
    }, [reportID, isGroupPolicyReport]);

    return {clearDraft, dispatchLocalDraftEvent, draft};
}

export default usePusherDraftPacing;
