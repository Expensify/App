import {getReportChatType} from '@selectors/Report';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import {getReportChannelName} from '@libs/actions/Report';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {ConciergeDraft} from './conciergeDraftState';
import {applyConciergeDraftEvent, getCachedDraft, getNextVisibleConciergeDraftBodyMarkdown, setCachedDraft} from './conciergeDraftState';

type ConciergeDraftState = {
    draftReportAction: ReportAction | null;
    hasActiveDraft: boolean;
};

type ConciergeDraftActions = {
    clearDraft: () => void;
    /**
     * Apply a draft event from a non-Pusher source (e.g. a local pacer for
     * pregenerated replies). Uses the same reducer as the Pusher path so
     * `reportActionID`-based reconciliation works unchanged.
     */
    dispatchLocalDraftEvent: (event: ConciergeDraftEvent) => void;
};

const defaultState: ConciergeDraftState = {
    draftReportAction: null,
    hasActiveDraft: false,
};

const defaultActions: ConciergeDraftActions = {
    clearDraft: () => {},
    dispatchLocalDraftEvent: () => {},
};

const ConciergeDraftStateContext = createContext<ConciergeDraftState>(defaultState);
const ConciergeDraftActionsContext = createContext<ConciergeDraftActions>(defaultActions);
const PUSHER_DRAFT_PACE_INTERVAL_MS = 60;

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

function ConciergeDraftProvider({reportID, children}: React.PropsWithChildren<{reportID: string | undefined}>) {
    const [chatType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportChatType});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    const isAgentZeroChat = isConciergeChat || isAdmin;

    if (!reportID || !isAgentZeroChat) {
        return children;
    }

    return (
        <ConciergeDraftGate
            key={reportID}
            reportID={reportID}
        >
            {children}
        </ConciergeDraftGate>
    );
}

function ConciergeDraftGate({reportID, children}: React.PropsWithChildren<{reportID: string}>) {
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

    const stopPusherDraftPace = useCallback(() => {
        if (!pusherPaceIntervalRef.current) {
            return;
        }

        clearInterval(pusherPaceIntervalRef.current);
        pusherPaceIntervalRef.current = null;
    }, []);

    const resetPusherDraftPace = useCallback(() => {
        stopPusherDraftPace();
        latestPusherDraftEventRef.current = null;
        completedPusherDraftEventRef.current = null;
        visibleBodyMarkdownRef.current = '';
    }, [stopPusherDraftPace]);

    const clearDraft = useCallback(() => {
        resetPusherDraftPace();
        currentDraftRef.current = null;
        setCachedDraft(reportID, null);
        setDraft(null);
    }, [reportID, resetPusherDraftPace]);

    const dispatchLocalDraftEvent = useCallback(
        (event: ConciergeDraftEvent) => {
            resetPusherDraftPace();
            setDraft((currentDraft) => {
                const next = applyConciergeDraftEvent(currentDraft, event, reportID);
                currentDraftRef.current = next;
                setCachedDraft(reportID, next);
                return next;
            });
        },
        [reportID, resetPusherDraftPace],
    );

    useEffect(() => {
        const channelName = getReportChannelName(reportID);
        const cacheDraftWithPusherPaceState = (nextDraft: ConciergeDraft | null) => {
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
        };
        const stopPacing = () => {
            if (!pusherPaceIntervalRef.current) {
                return;
            }

            clearInterval(pusherPaceIntervalRef.current);
            pusherPaceIntervalRef.current = null;
        };
        const publishVisibleEvent = (event: ConciergeDraftEvent, bodyMarkdown?: string, status?: ConciergeDraftEvent['status']) => {
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
                return cacheDraftWithPusherPaceState(next);
            });
        };
        const tickPacing = () => {
            const latestEvent = latestPusherDraftEventRef.current;
            const targetBodyMarkdown = latestEvent?.bodyMarkdown ?? '';

            if (!latestEvent || !targetBodyMarkdown) {
                stopPacing();
                return;
            }

            const completedEvent = completedPusherDraftEventRef.current;
            const nextVisibleBodyMarkdown = getNextVisibleConciergeDraftBodyMarkdown(visibleBodyMarkdownRef.current, targetBodyMarkdown, !!completedEvent);

            if (nextVisibleBodyMarkdown !== visibleBodyMarkdownRef.current) {
                const status = completedEvent && nextVisibleBodyMarkdown === targetBodyMarkdown ? 'completed' : 'updated';
                publishVisibleEvent(status === 'completed' && completedEvent ? completedEvent : latestEvent, nextVisibleBodyMarkdown, status);

                if (status === 'completed') {
                    completedPusherDraftEventRef.current = null;
                    stopPacing();
                }
                return;
            }

            if (completedEvent) {
                publishVisibleEvent(completedEvent, targetBodyMarkdown, 'completed');
                completedPusherDraftEventRef.current = null;
            }

            stopPacing();
        };
        const startPacing = () => {
            if (pusherPaceIntervalRef.current) {
                return;
            }

            pusherPaceIntervalRef.current = setInterval(tickPacing, PUSHER_DRAFT_PACE_INTERVAL_MS);
        };
        const isStalePusherDraftEvent = (event: ConciergeDraftEvent): boolean => {
            if (event.reportID !== reportID) {
                return true;
            }

            const latestEvent = latestPusherDraftEventRef.current;
            if (latestEvent?.streamSessionID === event.streamSessionID && event.sequence <= latestEvent.sequence) {
                return true;
            }

            const activeStreamSessionID = latestEvent?.streamSessionID ?? currentDraftRef.current?.streamSessionID;
            return !!activeStreamSessionID && activeStreamSessionID !== event.streamSessionID && event.status !== 'started' && event.status !== 'updated';
        };
        const handlePusherDraftEvent = (event: ConciergeDraftEvent) => {
            if (isStalePusherDraftEvent(event)) {
                return;
            }

            if (event.status === 'failed' || event.status === 'cleared') {
                stopPacing();
                latestPusherDraftEventRef.current = null;
                completedPusherDraftEventRef.current = null;
                visibleBodyMarkdownRef.current = '';
                publishVisibleEvent(event, undefined, event.status);
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
                    startPacing();
                    tickPacing();
                } else {
                    publishVisibleEvent(event, undefined, 'completed');
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
                stopPacing();
                completedPusherDraftEventRef.current = null;
                visibleBodyMarkdownRef.current = '';
            }

            latestPusherDraftEventRef.current = event;
            const nextVisibleBodyMarkdown = getNextVisibleConciergeDraftBodyMarkdown(visibleBodyMarkdownRef.current, targetBodyMarkdown);
            if (nextVisibleBodyMarkdown !== visibleBodyMarkdownRef.current) {
                publishVisibleEvent(event, nextVisibleBodyMarkdown, event.status);
            }

            if (nextVisibleBodyMarkdown !== targetBodyMarkdown) {
                startPacing();
            } else {
                stopPacing();
            }
        };
        const resumeCachedPusherDraftPace = () => {
            const latestEvent = latestPusherDraftEventRef.current;
            if (!latestEvent?.bodyMarkdown) {
                return;
            }

            const shouldResumePacing = latestEvent.bodyMarkdown !== visibleBodyMarkdownRef.current || !!completedPusherDraftEventRef.current;
            if (!shouldResumePacing) {
                return;
            }

            startPacing();
            tickPacing();
        };
        // Inline the clear so the effect's deps stay scoped to reportID; closing
        // over `clearDraft` would either drag it into deps (re-subscribing on
        // every render) or trip exhaustive-deps.
        const handleResubscribe = () => {
            stopPacing();
            latestPusherDraftEventRef.current = null;
            completedPusherDraftEventRef.current = null;
            visibleBodyMarkdownRef.current = '';
            currentDraftRef.current = null;
            setCachedDraft(reportID, null);
            setDraft(null);
        };
        const eventTypes = [
            Pusher.TYPE.CONCIERGE_DRAFT_STARTED,
            Pusher.TYPE.CONCIERGE_DRAFT_UPDATED,
            Pusher.TYPE.CONCIERGE_DRAFT_COMPLETED,
            Pusher.TYPE.CONCIERGE_DRAFT_FAILED,
            Pusher.TYPE.CONCIERGE_DRAFT_CLEARED,
        ] as const;

        const subscriptions = eventTypes.map((eventType) => {
            const listener = Pusher.subscribe(
                channelName,
                eventType,
                (eventData) => {
                    handlePusherDraftEvent(eventData as ConciergeDraftEvent);
                },
                handleResubscribe,
            );

            listener.catch((error: unknown) => {
                Log.hmmm('Failed to subscribe to Pusher concierge draft events', {eventType, reportID, error});
            });

            return listener;
        });

        resumeCachedPusherDraftPace();

        return () => {
            stopPacing();
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        };
    }, [reportID]);

    const stateValue: ConciergeDraftState = useMemo(
        () => ({
            draftReportAction: draft?.reportAction ?? null,
            hasActiveDraft: !!draft?.reportAction,
        }),
        [draft?.reportAction],
    );

    const actionsValue: ConciergeDraftActions = useMemo(
        () => ({
            clearDraft,
            dispatchLocalDraftEvent,
        }),
        [clearDraft, dispatchLocalDraftEvent],
    );

    return (
        <ConciergeDraftActionsContext.Provider value={actionsValue}>
            <ConciergeDraftStateContext.Provider value={stateValue}>{children}</ConciergeDraftStateContext.Provider>
        </ConciergeDraftActionsContext.Provider>
    );
}

function useConciergeDraft(): ConciergeDraftState {
    return useContext(ConciergeDraftStateContext);
}

function useConciergeDraftActions(): ConciergeDraftActions {
    return useContext(ConciergeDraftActionsContext);
}

export {ConciergeDraftProvider, useConciergeDraft, useConciergeDraftActions};
