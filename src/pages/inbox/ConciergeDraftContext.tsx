import {getCustomAgentParticipantAccountID, getReportParticipantAccountIDs} from '@selectors/AgentZeroChat';
import {getReportChatType} from '@selectors/Report';
import React, {createContext, useContext} from 'react';
import useOnyx from '@hooks/useOnyx';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import usePusherDraftPacing from './usePusherDraftPacing';

type ConciergeDraftState = {
    draftReportAction: ReportAction | null;
    hasActiveDraft: boolean;
    isDraftPendingCompletion: boolean;
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
    isDraftPendingCompletion: false,
};

const defaultActions: ConciergeDraftActions = {
    clearDraft: () => {},
    dispatchLocalDraftEvent: () => {},
};

const ConciergeDraftStateContext = createContext<ConciergeDraftState>(defaultState);
const ConciergeDraftActionsContext = createContext<ConciergeDraftActions>(defaultActions);

function ConciergeDraftProvider({reportID, children}: React.PropsWithChildren<{reportID: string | undefined}>) {
    const [chatType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportChatType});
    const [participantAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportParticipantAccountIDs});
    const [agentParticipantAccountID] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: getCustomAgentParticipantAccountID(participantAccountIDs)});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    // See AgentZeroStatusContext for the rationale: `isCustomAgent` lives on the participant's
    // personalDetails, stamped by Auth in `Account::formatNewDotPersonalDetails`.
    const isCustomAgentChat = agentParticipantAccountID !== undefined;
    const isAgentZeroChat = isConciergeChat || isAdmin || isCustomAgentChat;

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
    const {clearDraft, dispatchLocalDraftEvent, draft} = usePusherDraftPacing(reportID);
    const stateValue: ConciergeDraftState = {
        draftReportAction: draft?.reportAction ?? null,
        hasActiveDraft: !!draft?.reportAction,
        isDraftPendingCompletion: !!draft?.pusherPendingCompletionEvent,
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
