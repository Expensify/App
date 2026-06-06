import {getAgentAccountIDFlags, getReportParticipantAccountIDs} from '@selectors/AgentZeroChat';
import {getReportChatType} from '@selectors/Report';
import React, {createContext, useContext, useEffect} from 'react';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import useOnyx from '@hooks/useOnyx';
import {clearConciergeThinkingKickoff} from '@libs/actions/Report';
import type {ReasoningEntry} from '@libs/ConciergeReasoningStore';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type AgentZeroStatusState = {
    /** Whether AgentZero is actively working */
    isProcessing: boolean;

    /** Chronological list of reasoning steps for the current processing request */
    reasoningHistory: ReasoningEntry[];

    /** Debounced label shown in the thinking bubble */
    statusLabel: string;

    /**
     * The accountID of the AgentZero persona handling this chat. Concierge for Concierge DMs and
     * #admins rooms; the agent's own accountID for custom-agent chats. Consumers use it to render
     * the thinking-bubble avatar and to decide when a reply has actually landed.
     */
    personaAccountID: number;
};

type AgentZeroStatusActions = {
    /** Sets optimistic "thinking" state immediately after the user sends a message */
    kickoffWaitingIndicator: () => void;
};

const defaultState: AgentZeroStatusState = {
    isProcessing: false,
    reasoningHistory: [],
    statusLabel: '',
    personaAccountID: CONST.ACCOUNT_ID.CONCIERGE,
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
 * report with a participant whose accountID has a `SHARED_NVP_AGENT_PROMPT_<accountID>` entry,
 * populated by `OpenAgentsPage` for agents the current user owns).
 */
function AgentZeroStatusProvider({reportID, children}: React.PropsWithChildren<{reportID: string | undefined}>) {
    const [chatType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportChatType});
    const [participantAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportParticipantAccountIDs});
    const [agentAccountIDFlags] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT, {selector: getAgentAccountIDFlags});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    // First participant whose accountID has a SHARED_NVP_AGENT_PROMPT entry. Both gates and
    // identifies the persona in one pass.
    const agentParticipantAccountID = participantAccountIDs?.find((accountID) => !!agentAccountIDFlags?.[accountID]);
    const isCustomAgentChat = agentParticipantAccountID !== undefined;
    const isAgentZeroChat = isConciergeChat || isAdmin || isCustomAgentChat;

    if (!reportID || !isAgentZeroChat) {
        return children;
    }

    return (
        <AgentZeroStatusGate
            key={reportID}
            reportID={reportID}
            personaAccountID={agentParticipantAccountID ?? CONST.ACCOUNT_ID.CONCIERGE}
        >
            {children}
        </AgentZeroStatusGate>
    );
}

function AgentZeroStatusGate({reportID, personaAccountID, children}: React.PropsWithChildren<{reportID: string; personaAccountID: number}>) {
    const {kickoffWaitingIndicator, ...indicatorState} = useAgentZeroStatusIndicator(reportID, personaAccountID);
    const stateValue = indicatorState;
    const actionsValue = {kickoffWaitingIndicator};

    // Auto-kickoff "thinking" indicator when opened from search (where kickoffWaitingIndicator isn't accessible)
    const [shouldKickoff] = useOnyx(ONYXKEYS.CONCIERGE_THINKING_KICKOFF);
    useEffect(() => {
        if (!shouldKickoff) {
            return;
        }
        clearConciergeThinkingKickoff();
        kickoffWaitingIndicator();
    }, [shouldKickoff, kickoffWaitingIndicator]);

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
