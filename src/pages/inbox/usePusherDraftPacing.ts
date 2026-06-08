import {useEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import {getReportChannelName} from '@libs/actions/Report';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent, ConciergeDraftEventsEvent} from '@libs/Pusher/types';
import Visibility from '@libs/Visibility';
import type {ConciergeDraft} from './conciergeDraftState';
import {applyConciergeDraftEvent, getCachedDraft, getNextVisibleConciergeDraftMarkdown, setCachedDraft} from './conciergeDraftState';

type MutableRef<T> = {
    current: T;
};

type PusherDraftPaceRefs = {
    completedPusherDraftEventRef: MutableRef<ConciergeDraftEvent | null>;
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

function buildPusherDraftEventFromCachedDraft(reportID: string, draft: ConciergeDraft | null, status: ConciergeDraftEvent['status'] = 'updated'): ConciergeDraftEvent | null {
    if (!draft?.pusherTargetBodyMarkdown) {
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

function resetPusherDraftPace(runtime: PusherDraftPaceRefs) {
    const {
        completedPusherDraftEventRef,
        lastPaceTickTimeRef,
        latestPusherDraftEventRef,
        queuedPusherDraftEventsRef,
        visibleBodyMarkdownRef,
        visibleSourceMarkdownRef,
        visibleSourceOffsetRef,
    } = runtime;

    stopPusherDraftPace(runtime);
    latestPusherDraftEventRef.current = null;
    queuedPusherDraftEventsRef.current = [];
    completedPusherDraftEventRef.current = null;
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
    const nextDraftWithPusherPaceState = latestPusherDraftEvent?.bodyMarkdown
        ? {
              ...nextDraft,
              pusherTargetBodyMarkdown: latestPusherDraftEvent.bodyMarkdown,
              pusherTargetSequence: latestPusherDraftEvent.sequence,
              pusherQueuedTargetEvents: queuedPusherDraftEvents.length > 0 ? [...queuedPusherDraftEvents] : undefined,
              pusherPendingCompletionEvent: nextDraft.status === 'completed' ? undefined : (completedPusherDraftEvent ?? undefined),
              pusherVisibleSourceMarkdown: visibleSourceMarkdownRef.current,
              pusherVisibleSourceOffset: visibleSourceOffsetRef.current,
          }
        : nextDraft;

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
) {
    const {reportID, setDraft, visibleBodyMarkdownRef, visibleSequenceRef, visibleSourceMarkdownRef, visibleSourceOffsetRef} = runtime;

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
        sequence: visibleSequenceRef.current,
        status: visibleStatus,
    };
    setDraft((currentDraft) => {
        const next = applyConciergeDraftEvent(currentDraft, visibleEvent, reportID);
        return cacheDraftWithPusherPaceState(runtime, next);
    });
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
        const status = completedEvent && !hasQueuedTarget && isTargetFullyVisible ? 'completed' : 'updated';
        lastPaceTickTimeRef.current =
            isTargetFullyVisible || elapsedIntervals === 0 || revealedUnits < unitsToReveal ? now : lastPaceTickTimeRef.current + unitsToReveal * PUSHER_DRAFT_PACE_INTERVAL_MS;
        publishVisibleEvent(runtime, status === 'completed' && completedEvent ? completedEvent : latestEvent, nextVisibleMarkdown, status);

        if (status === 'completed') {
            completedPusherDraftEventRef.current = null;
            stopPusherDraftPace(runtime);
        }
        return;
    }

    lastPaceTickTimeRef.current = now;

    if (promoteQueuedPusherDraftTarget(runtime)) {
        startPusherDraftPace(runtime);
        return;
    }

    if (completedEvent) {
        publishVisibleEvent(runtime, completedEvent, {bodyMarkdown: targetBodyMarkdown, sourceMarkdown: targetBodyMarkdown, sourceOffset: targetBodyMarkdown.length}, 'completed');
        completedPusherDraftEventRef.current = null;
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
            publishVisibleEvent(runtime, completedEvent, undefined, 'completed');
            completedPusherDraftEventRef.current = null;
        }
        return;
    }

    const targetBodyMarkdown = newestTarget.bodyMarkdown;
    latestPusherDraftEventRef.current = newestTarget;
    queuedPusherDraftEventsRef.current = [];

    publishVisibleEvent(
        runtime,
        completedEvent ?? newestTarget,
        {bodyMarkdown: targetBodyMarkdown, sourceMarkdown: targetBodyMarkdown, sourceOffset: targetBodyMarkdown.length},
        completedEvent ? 'completed' : 'updated',
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
        completedPusherDraftEventRef.current = null;
        queuedPusherDraftEventsRef.current = [];
        visibleBodyMarkdownRef.current = '';
        visibleSourceMarkdownRef.current = '';
        visibleSourceOffsetRef.current = 0;
    }

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
    return !!activeStreamSessionID && activeStreamSessionID !== event.streamSessionID && event.status !== 'started' && event.status !== 'updated';
}

function isStalePusherDraftEvent(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent): boolean {
    return isStalePusherDraftEventAgainstTarget(runtime, event, getNewestPusherDraftTarget(runtime));
}

function handlePusherDraftEvent(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent) {
    const {completedPusherDraftEventRef, latestPusherDraftEventRef, visibleBodyMarkdownRef, visibleSourceMarkdownRef, visibleSourceOffsetRef} = runtime;

    if (isStalePusherDraftEvent(runtime, event)) {
        return;
    }

    if (event.status === 'failed' || event.status === 'cleared') {
        resetPusherDraftPace(runtime);
        publishVisibleEvent(runtime, event, undefined, event.status);
        return;
    }

    if (event.status === 'completed') {
        let didQueueTarget = false;
        if (event.bodyMarkdown) {
            didQueueTarget = setOrQueuePusherDraftTarget(runtime, {
                ...event,
                finalRenderedHTML: undefined,
                status: 'updated',
            });
        }
        completedPusherDraftEventRef.current = event;
        if (latestPusherDraftEventRef.current?.bodyMarkdown || didQueueTarget) {
            if (didQueueTarget) {
                cacheCurrentDraftWithPusherPaceState(runtime);
            }
            startPusherDraftPace(runtime);
            if (!didQueueTarget) {
                tickPacing(runtime);
            }
        } else {
            publishVisibleEvent(runtime, event, undefined, 'completed');
        }
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

    for (const event of eventData.events) {
        if (isStalePusherDraftEventAgainstTarget(runtime, event, latestAcceptedEvent ?? getNewestPusherDraftTarget(runtime))) {
            continue;
        }

        if (event.status === 'failed' || event.status === 'cleared') {
            resetPusherDraftPace(runtime);
            publishVisibleEvent(runtime, event, undefined, event.status);
            return;
        }

        if (event.status === 'completed') {
            if (event.bodyMarkdown) {
                const completedTargetEvent = {
                    ...event,
                    finalRenderedHTML: undefined,
                    status: 'updated' as const,
                };
                targetEvents.push(completedTargetEvent);
            }
            latestAcceptedEvent = event;
            completedEvent = event;
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
        if (completedEvent) {
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
        completedPusherDraftEventRef.current = completedEvent;
    }

    if (
        latestPusherDraftEventRef.current?.bodyMarkdown &&
        (visibleSourceOffsetRef.current < latestPusherDraftEventRef.current.bodyMarkdown.length || queuedPusherDraftEventsRef.current.length > 0 || !!completedPusherDraftEventRef.current)
    ) {
        startPusherDraftPace(runtime);
        return;
    }

    if (completedPusherDraftEventRef.current) {
        publishVisibleEvent(runtime, completedPusherDraftEventRef.current, undefined, 'completed');
        completedPusherDraftEventRef.current = null;
    }
}

function resumeCachedPusherDraftPace(runtime: PusherDraftPacingRuntime) {
    const {completedPusherDraftEventRef, latestPusherDraftEventRef, queuedPusherDraftEventsRef, visibleSourceOffsetRef} = runtime;
    const latestEvent = latestPusherDraftEventRef.current;
    if (!latestEvent?.bodyMarkdown) {
        return;
    }

    const shouldResumePacing = visibleSourceOffsetRef.current < latestEvent.bodyMarkdown.length || queuedPusherDraftEventsRef.current.length > 0 || !!completedPusherDraftEventRef.current;
    if (!shouldResumePacing) {
        return;
    }

    startPusherDraftPace(runtime);
    tickPacing(runtime);
}

function usePusherDraftPacing(reportID: string) {
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

    const clearDraft = () => {
        clearCachedPusherDraft({
            completedPusherDraftEventRef,
            currentDraftRef,
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
            lastPaceTickTimeRef,
            latestPusherDraftEventRef,
            pusherPaceIntervalRef,
            queuedPusherDraftEventsRef,
            visibleBodyMarkdownRef,
            visibleSourceMarkdownRef,
            visibleSourceOffsetRef,
        });
        setDraft((currentDraft) => {
            const next = applyConciergeDraftEvent(currentDraft, event, reportID);
            currentDraftRef.current = next;
            setCachedDraft(reportID, next);
            return next;
        });
    };

    useEffect(() => {
        const runtime = {
            completedPusherDraftEventRef,
            currentDraftRef,
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

        const draftEventSubscriptions: Array<[string, (eventData: unknown) => void]> = [
            [
                Pusher.TYPE.CONCIERGE_DRAFT_EVENTS,
                (eventData) => {
                    handlePusherDraftEvents(runtime, eventData as ConciergeDraftEventsEvent);
                },
            ],
            ...PUSHER_DRAFT_EVENT_TYPES.map<[string, (eventData: unknown) => void]>((eventType) => [
                eventType,
                (eventData) => {
                    handlePusherDraftEvent(runtime, eventData as ConciergeDraftEvent);
                },
            ]),
        ];

        const subscriptions = draftEventSubscriptions.map(([eventType, eventCallback]) => {
            const listener = Pusher.subscribe(channelName, eventType, eventCallback, handleResubscribe);

            listener.catch((error: unknown) => {
                Log.hmmm('Failed to subscribe to Pusher concierge draft events', {eventType, reportID, error});
            });

            return listener;
        });

        resumeCachedPusherDraftPace(runtime);
        const unsubscribeVisibility = Visibility.onVisibilityChange(() => {
            if (completedPusherDraftEventRef.current) {
                revealFullPusherDraftTarget(runtime);
                return;
            }

            if (!Visibility.isVisible() || !pusherPaceIntervalRef.current) {
                return;
            }

            tickPacing(runtime);
        });

        return () => {
            unsubscribeVisibility();
            stopPusherDraftPace(runtime);
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        };
    }, [reportID]);

    return {clearDraft, dispatchLocalDraftEvent, draft};
}

export default usePusherDraftPacing;
