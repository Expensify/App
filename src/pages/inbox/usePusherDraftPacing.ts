import {useEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import {getReportChannelName} from '@libs/actions/Report';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import type {ConciergeDraft} from './conciergeDraftState';
import {applyConciergeDraftEvent, getCachedDraft, getNextVisibleConciergeDraftBodyMarkdown, setCachedDraft} from './conciergeDraftState';

type MutableRef<T> = {
    current: T;
};

type PusherDraftPaceRefs = {
    completedPusherDraftEventRef: MutableRef<ConciergeDraftEvent | null>;
    latestPusherDraftEventRef: MutableRef<ConciergeDraftEvent | null>;
    pusherPaceIntervalRef: MutableRef<ReturnType<typeof setInterval> | null>;
    visibleBodyMarkdownRef: MutableRef<string>;
};

type PusherDraftPacingRuntime = PusherDraftPaceRefs & {
    currentDraftRef: MutableRef<ConciergeDraft | null>;
    reportID: string;
    setDraft: Dispatch<SetStateAction<ConciergeDraft | null>>;
    visibleSequenceRef: MutableRef<number>;
};

const PUSHER_DRAFT_PACE_INTERVAL_MS = 60;
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
    const {completedPusherDraftEventRef, latestPusherDraftEventRef, visibleBodyMarkdownRef} = runtime;

    stopPusherDraftPace(runtime);
    latestPusherDraftEventRef.current = null;
    completedPusherDraftEventRef.current = null;
    visibleBodyMarkdownRef.current = '';
}

function clearCachedPusherDraft(runtime: PusherDraftPacingRuntime) {
    const {currentDraftRef, reportID, setDraft} = runtime;

    resetPusherDraftPace(runtime);
    currentDraftRef.current = null;
    setCachedDraft(reportID, null);
    setDraft(null);
}

function cacheDraftWithPusherPaceState(runtime: PusherDraftPacingRuntime, nextDraft: ConciergeDraft | null): ConciergeDraft | null {
    const {completedPusherDraftEventRef, currentDraftRef, latestPusherDraftEventRef, reportID} = runtime;

    if (!nextDraft) {
        currentDraftRef.current = null;
        setCachedDraft(reportID, null);
        return null;
    }

    const latestPusherDraftEvent = latestPusherDraftEventRef.current;
    const completedPusherDraftEvent = completedPusherDraftEventRef.current;
    const nextDraftWithPusherPaceState = latestPusherDraftEvent?.bodyMarkdown
        ? {
              ...nextDraft,
              pusherTargetBodyMarkdown: latestPusherDraftEvent.bodyMarkdown,
              pusherTargetSequence: latestPusherDraftEvent.sequence,
              pusherPendingCompletionEvent: nextDraft.status === 'completed' ? undefined : (completedPusherDraftEvent ?? undefined),
          }
        : nextDraft;

    currentDraftRef.current = nextDraftWithPusherPaceState;
    setCachedDraft(reportID, nextDraftWithPusherPaceState);
    return nextDraftWithPusherPaceState;
}

function publishVisibleEvent(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent, bodyMarkdown?: string, status?: ConciergeDraftEvent['status']) {
    const {reportID, setDraft, visibleBodyMarkdownRef, visibleSequenceRef} = runtime;

    if (bodyMarkdown !== undefined) {
        visibleBodyMarkdownRef.current = bodyMarkdown;
    }

    visibleSequenceRef.current += 1;
    const visibleStatus = status ?? event.status;
    const visibleEvent = {
        ...event,
        bodyMarkdown,
        sequence: visibleSequenceRef.current,
        status: visibleStatus,
    };
    setDraft((currentDraft) => {
        const next = applyConciergeDraftEvent(currentDraft, visibleEvent, reportID);
        return cacheDraftWithPusherPaceState(runtime, next);
    });
}

function tickPacing(runtime: PusherDraftPacingRuntime) {
    const {completedPusherDraftEventRef, latestPusherDraftEventRef, visibleBodyMarkdownRef} = runtime;
    const latestEvent = latestPusherDraftEventRef.current;
    const targetBodyMarkdown = latestEvent?.bodyMarkdown ?? '';

    if (!latestEvent || !targetBodyMarkdown) {
        stopPusherDraftPace(runtime);
        return;
    }

    const completedEvent = completedPusherDraftEventRef.current;
    const nextVisibleBodyMarkdown = getNextVisibleConciergeDraftBodyMarkdown(visibleBodyMarkdownRef.current, targetBodyMarkdown, !!completedEvent);

    if (nextVisibleBodyMarkdown !== visibleBodyMarkdownRef.current) {
        const status = completedEvent && nextVisibleBodyMarkdown === targetBodyMarkdown ? 'completed' : 'updated';
        publishVisibleEvent(runtime, status === 'completed' && completedEvent ? completedEvent : latestEvent, nextVisibleBodyMarkdown, status);

        if (status === 'completed') {
            completedPusherDraftEventRef.current = null;
            stopPusherDraftPace(runtime);
        }
        return;
    }

    if (completedEvent) {
        publishVisibleEvent(runtime, completedEvent, targetBodyMarkdown, 'completed');
        completedPusherDraftEventRef.current = null;
    }

    stopPusherDraftPace(runtime);
}

function startPusherDraftPace(runtime: PusherDraftPacingRuntime) {
    const {pusherPaceIntervalRef} = runtime;

    if (pusherPaceIntervalRef.current) {
        return;
    }

    pusherPaceIntervalRef.current = setInterval(() => tickPacing(runtime), PUSHER_DRAFT_PACE_INTERVAL_MS);
}

function isStalePusherDraftEvent(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent): boolean {
    const {currentDraftRef, latestPusherDraftEventRef, reportID} = runtime;

    if (event.reportID !== reportID) {
        return true;
    }

    const latestEvent = latestPusherDraftEventRef.current;
    if (latestEvent?.streamSessionID === event.streamSessionID && event.sequence <= latestEvent.sequence) {
        return true;
    }

    const activeStreamSessionID = latestEvent?.streamSessionID ?? currentDraftRef.current?.streamSessionID;
    return !!activeStreamSessionID && activeStreamSessionID !== event.streamSessionID && event.status !== 'started' && event.status !== 'updated';
}

function handlePusherDraftEvent(runtime: PusherDraftPacingRuntime, event: ConciergeDraftEvent) {
    const {completedPusherDraftEventRef, currentDraftRef, latestPusherDraftEventRef, visibleBodyMarkdownRef} = runtime;

    if (isStalePusherDraftEvent(runtime, event)) {
        return;
    }

    if (event.status === 'failed' || event.status === 'cleared') {
        resetPusherDraftPace(runtime);
        publishVisibleEvent(runtime, event, undefined, event.status);
        return;
    }

    if (event.status === 'completed') {
        if (event.bodyMarkdown) {
            latestPusherDraftEventRef.current = {
                ...event,
                finalRenderedHTML: undefined,
                status: 'updated',
            };
        }
        completedPusherDraftEventRef.current = event;
        if (latestPusherDraftEventRef.current?.bodyMarkdown) {
            startPusherDraftPace(runtime);
            tickPacing(runtime);
        } else {
            publishVisibleEvent(runtime, event, undefined, 'completed');
        }
        return;
    }

    const targetBodyMarkdown = event.bodyMarkdown ?? '';
    if (!targetBodyMarkdown) {
        return;
    }

    const latestEvent = latestPusherDraftEventRef.current;
    const activeStreamSessionID = latestEvent?.streamSessionID ?? currentDraftRef.current?.streamSessionID;
    if (activeStreamSessionID && activeStreamSessionID !== event.streamSessionID) {
        stopPusherDraftPace(runtime);
        completedPusherDraftEventRef.current = null;
        visibleBodyMarkdownRef.current = '';
    }

    latestPusherDraftEventRef.current = event;
    const nextVisibleBodyMarkdown = getNextVisibleConciergeDraftBodyMarkdown(visibleBodyMarkdownRef.current, targetBodyMarkdown);
    if (nextVisibleBodyMarkdown !== visibleBodyMarkdownRef.current) {
        publishVisibleEvent(runtime, event, nextVisibleBodyMarkdown, event.status);
    }

    if (nextVisibleBodyMarkdown !== targetBodyMarkdown) {
        startPusherDraftPace(runtime);
    } else {
        stopPusherDraftPace(runtime);
    }
}

function resumeCachedPusherDraftPace(runtime: PusherDraftPacingRuntime) {
    const {completedPusherDraftEventRef, latestPusherDraftEventRef, visibleBodyMarkdownRef} = runtime;
    const latestEvent = latestPusherDraftEventRef.current;
    if (!latestEvent?.bodyMarkdown) {
        return;
    }

    const shouldResumePacing = latestEvent.bodyMarkdown !== visibleBodyMarkdownRef.current || !!completedPusherDraftEventRef.current;
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
    const visibleSequenceRef = useRef(draft?.sequence ?? 0);
    const latestPusherDraftEventRef = useRef<ConciergeDraftEvent | null>(buildPusherDraftEventFromCachedDraft(reportID, draft));
    const completedPusherDraftEventRef = useRef<ConciergeDraftEvent | null>(draft?.pusherPendingCompletionEvent ?? null);
    const pusherPaceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearDraft = () => {
        clearCachedPusherDraft({
            completedPusherDraftEventRef,
            currentDraftRef,
            latestPusherDraftEventRef,
            pusherPaceIntervalRef,
            reportID,
            setDraft,
            visibleBodyMarkdownRef,
            visibleSequenceRef,
        });
    };

    const dispatchLocalDraftEvent = (event: ConciergeDraftEvent) => {
        resetPusherDraftPace({
            completedPusherDraftEventRef,
            latestPusherDraftEventRef,
            pusherPaceIntervalRef,
            visibleBodyMarkdownRef,
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
            latestPusherDraftEventRef,
            pusherPaceIntervalRef,
            reportID,
            setDraft,
            visibleBodyMarkdownRef,
            visibleSequenceRef,
        };
        const channelName = getReportChannelName(reportID);
        const handleResubscribe = () => {
            clearCachedPusherDraft(runtime);
        };

        const subscriptions = PUSHER_DRAFT_EVENT_TYPES.map((eventType) => {
            const listener = Pusher.subscribe(
                channelName,
                eventType,
                (eventData) => {
                    handlePusherDraftEvent(runtime, eventData as ConciergeDraftEvent);
                },
                handleResubscribe,
            );

            listener.catch((error: unknown) => {
                Log.hmmm('Failed to subscribe to Pusher concierge draft events', {eventType, reportID, error});
            });

            return listener;
        });

        resumeCachedPusherDraftPace(runtime);

        return () => {
            stopPusherDraftPace(runtime);
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        };
    }, [reportID]);

    return {clearDraft, dispatchLocalDraftEvent, draft};
}

export default usePusherDraftPacing;
