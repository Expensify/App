import {getAgentAccountIDFlags, getReportParticipantAccountIDs} from '@selectors/AgentZeroChat';
import {getReportChatType} from '@selectors/Report';
import {agentZeroProcessingAgentIDsSelector} from '@selectors/ReportNameValuePairs';
import {accountIDSelector} from '@selectors/Session';
import React, {createContext, useContext, useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import {clearConciergeThinkingKickoff, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import type {ReasoningEntry} from '@libs/AgentZeroReasoningStore';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type AgentZeroStatusState = {
    /**
     * Agent accountIDs to render thinking bubbles for: every agent the server is actively
     * processing for (the keys of the per-agent processing-indicator NVP) plus Concierge in
     * Concierge/admin chats (so an optimistic kickoff shows instantly). Never includes the
     * current user — a human viewing the chat is never the thinking persona.
     */
    candidateAgentIDs: number[];
};

type AgentZeroStatusActions = {
    /** Optimistically show Concierge's thinking indicator (used by the search Ask-Concierge flow). */
    kickoffWaitingIndicator: () => void;
};

const defaultState: AgentZeroStatusState = {
    candidateAgentIDs: [],
};

const defaultActions: AgentZeroStatusActions = {
    kickoffWaitingIndicator: () => {},
};

const AgentZeroStatusStateContext = createContext<AgentZeroStatusState>(defaultState);
const AgentZeroStatusActionsContext = createContext<AgentZeroStatusActions>(defaultActions);

/**
 * Cheap outer guard — only subscribes to the scalar CONCIERGE_REPORT_ID and the report's chat
 * metadata. For non-AgentZero reports (the common case), returns children directly.
 *
 * AgentZero chats include Concierge DMs, policy #admins rooms, and custom-agent chats (any
 * report with a participant — other than the current user — whose accountID has a
 * `SHARED_NVP_AGENT_PROMPT_<accountID>` entry, populated by `OpenAgentsPage` for agents the
 * current user owns).
 */
function AgentZeroStatusProvider({reportID, children}: React.PropsWithChildren<{reportID: string | undefined}>) {
    const [chatType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportChatType});
    const [participantAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportParticipantAccountIDs});
    const [agentAccountIDFlags] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT, {selector: getAgentAccountIDFlags});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    // A custom-agent chat has a participant — excluding the current user — whose accountID owns
    // an agent prompt. Excluding the current user prevents a user who owns agents from turning
    // their own DMs into agent chats.
    const hasAgentParticipant = participantAccountIDs?.some((accountID) => accountID !== currentUserAccountID && !!agentAccountIDFlags?.[accountID]) ?? false;
    const isAgentZeroChat = isConciergeChat || isAdmin || hasAgentParticipant;

    if (!reportID || !isAgentZeroChat) {
        return children;
    }

    return (
        <AgentZeroStatusGate
            key={reportID}
            reportID={reportID}
            includeConcierge={isConciergeChat || isAdmin}
        >
            {children}
        </AgentZeroStatusGate>
    );
}

function AgentZeroStatusGate({reportID, includeConcierge, children}: React.PropsWithChildren<{reportID: string; includeConcierge: boolean}>) {
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [serverAgentIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: agentZeroProcessingAgentIDsSelector});

    // One reasoning Pusher subscription per report (not per agent). The handler in Report
    // actions routes each event to the right agent's reasoning history by its actorAccountID.
    // Cleanup clears the report's reasoning history and the Pusher subscription.
    useEffect(() => {
        subscribeToReportReasoningEvents(reportID);
        return () => {
            unsubscribeFromReportReasoningChannel(reportID);
        };
    }, [reportID]);

    // The search "Ask Concierge" flow opens the Concierge DM and sets a one-shot Onyx flag so
    // the bubble appears immediately, before the server NVP lands. Concierge is the only agent
    // with a client optimistic path; custom agents are purely server-driven. A null baseline is
    // safe because this kickoff always follows the user's own just-sent message, so the newest
    // action isn't from Concierge and reply-detection won't misfire; the per-agent hook also
    // captures the live baseline when its indicator activates.
    const kickoffWaitingIndicator = () => {
        AgentZeroOptimisticStore.increment(reportID, CONST.ACCOUNT_ID.CONCIERGE, null);
    };
    const [shouldKickoff] = useOnyx(ONYXKEYS.CONCIERGE_THINKING_KICKOFF);
    useEffect(() => {
        if (!shouldKickoff) {
            return;
        }
        clearConciergeThinkingKickoff();
        kickoffWaitingIndicator();
    }, [shouldKickoff, kickoffWaitingIndicator]);

    const candidateIDs = new Set<number>(serverAgentIDs ?? []);
    if (includeConcierge) {
        candidateIDs.add(CONST.ACCOUNT_ID.CONCIERGE);
    }
    if (currentUserAccountID !== undefined) {
        candidateIDs.delete(currentUserAccountID);
    }
    // Render Concierge's bubble first, then any custom agents ascending by accountID — a stable,
    // intentional order instead of relying on Set insertion order.
    const candidateAgentIDs = [...candidateIDs].sort((a, b) => {
        if (a === CONST.ACCOUNT_ID.CONCIERGE) {
            return -1;
        }
        if (b === CONST.ACCOUNT_ID.CONCIERGE) {
            return 1;
        }
        return a - b;
    });

    const stateValue = {candidateAgentIDs};
    const actionsValue = {kickoffWaitingIndicator};

    return (
        <AgentZeroStatusActionsContext.Provider value={actionsValue}>
            <AgentZeroStatusStateContext.Provider value={stateValue}>{children}</AgentZeroStatusStateContext.Provider>
        </AgentZeroStatusActionsContext.Provider>
    );
}

function useAgentZeroStatus(): AgentZeroStatusState {
    return useContext(AgentZeroStatusStateContext);
}

function useAgentZeroStatusActions(): AgentZeroStatusActions {
    return useContext(AgentZeroStatusActionsContext);
}

export {AgentZeroStatusProvider, useAgentZeroStatus, useAgentZeroStatusActions};
export type {ReasoningEntry};
