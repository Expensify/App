import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import {getReportChannelName} from '@libs/actions/Report';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {ConciergeDraft} from './conciergeDraftState';
import {applyConciergeDraftEvent} from './conciergeDraftState';

type ConciergeDraftState = {
    draftReportAction: ReportAction | null;
    hasActiveDraft: boolean;
};

type ConciergeDraftActions = {
    clearDraft: () => void;
};

const defaultState: ConciergeDraftState = {
    draftReportAction: null,
    hasActiveDraft: false,
};

const defaultActions: ConciergeDraftActions = {
    clearDraft: () => {},
};

const ConciergeDraftStateContext = createContext<ConciergeDraftState>(defaultState);
const ConciergeDraftActionsContext = createContext<ConciergeDraftActions>(defaultActions);

function ConciergeDraftProvider({reportID, chatType, children}: React.PropsWithChildren<{reportID: string | undefined; chatType: ValueOf<typeof CONST.REPORT.CHAT_TYPE> | undefined}>) {
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
    const [draft, setDraft] = useState<ConciergeDraft | null>(null);

    const clearDraft = useCallback(() => {
        setDraft(null);
    }, []);

    useEffect(() => {
        const channelName = getReportChannelName(reportID);
        const handleResubscribe = () => {
            clearDraft();
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
                    setDraft((currentDraft) => applyConciergeDraftEvent(currentDraft, eventData as ConciergeDraftEvent, reportID));
                },
                handleResubscribe,
            );

            listener.catch((error: unknown) => {
                Log.hmmm('[ConciergeDraftGate] Failed to subscribe to Pusher concierge draft events', {eventType, reportID, error});
            });

            return listener;
        });

        return () => {
            for (const subscription of subscriptions) {
                subscription.unsubscribe();
            }
        };
    }, [clearDraft, reportID]);

    const stateValue = useMemo<ConciergeDraftState>(
        () => ({
            draftReportAction: draft?.reportAction ?? null,
            hasActiveDraft: !!draft?.reportAction,
        }),
        [draft?.reportAction],
    );

    const actionsValue = useMemo<ConciergeDraftActions>(
        () => ({
            clearDraft,
        }),
        [clearDraft],
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
export type {ConciergeDraftState, ConciergeDraftActions};
