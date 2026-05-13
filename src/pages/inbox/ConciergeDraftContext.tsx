import {getReportChatType} from '@selectors/Report';
import React, {createContext, useContext, useEffect, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import {getReportChannelName} from '@libs/actions/Report';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {ConciergeDraft} from './conciergeDraftState';
import {applyConciergeDraftEvent, getCachedDraft, setCachedDraft} from './conciergeDraftState';

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

    // React Compiler auto-memoizes; explicit useCallback/useMemo would just
    // shadow the compiler's analysis (clean-react-0-compiler).
    const clearDraft = () => {
        setCachedDraft(reportID, null);
        setDraft(null);
    };

    const dispatchLocalDraftEvent = (event: ConciergeDraftEvent) => {
        setDraft((currentDraft) => {
            const next = applyConciergeDraftEvent(currentDraft, event, reportID);
            setCachedDraft(reportID, next);
            return next;
        });
    };

    useEffect(() => {
        const channelName = getReportChannelName(reportID);
        // Inline the clear so the effect's deps stay scoped to reportID; closing
        // over `clearDraft` would either drag it into deps (re-subscribing on
        // every render) or trip exhaustive-deps.
        const handleResubscribe = () => {
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
                    const conciergeDraftEvent = eventData as ConciergeDraftEvent;
                    setDraft((currentDraft) => {
                        const next = applyConciergeDraftEvent(currentDraft, conciergeDraftEvent, reportID);
                        setCachedDraft(reportID, next);
                        return next;
                    });
                },
                handleResubscribe,
            );

            listener.catch((error: unknown) => {
                Log.hmmm('Failed to subscribe to Pusher concierge draft events', {eventType, reportID, error});
            });

            return listener;
        });

        return () => {
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        };
    }, [reportID]);

    const stateValue: ConciergeDraftState = {
        draftReportAction: draft?.reportAction ?? null,
        hasActiveDraft: !!draft?.reportAction,
    };

    const actionsValue: ConciergeDraftActions = {
        clearDraft,
        dispatchLocalDraftEvent,
    };

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
export type {ConciergeDraftState, ConciergeDraftActions};
