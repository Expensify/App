import React, {createContext, useContext, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import useOnyx from '@hooks/useOnyx';
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
};

type AgentZeroStatusActions = {
    /** Sets optimistic "thinking" state immediately after the user sends a message */
    kickoffWaitingIndicator: () => void;
};

const defaultState: AgentZeroStatusState = {
    isProcessing: false,
    reasoningHistory: [],
    statusLabel: '',
};

const defaultActions: AgentZeroStatusActions = {
    kickoffWaitingIndicator: () => {},
};

const AgentZeroStatusStateContext = createContext<AgentZeroStatusState>(defaultState);
const AgentZeroStatusActionsContext = createContext<AgentZeroStatusActions>(defaultActions);

/**
 * Cheap outer guard — only subscribes to the scalar CONCIERGE_REPORT_ID.
 * For non-AgentZero reports (the common case), returns children directly.
 *
 * AgentZero chats include Concierge DMs and policy #admins rooms.
 */
function AgentZeroStatusProvider({reportID, chatType, children}: React.PropsWithChildren<{reportID: string | undefined; chatType: ValueOf<typeof CONST.REPORT.CHAT_TYPE> | undefined}>) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    const isAgentZeroChat = isConciergeChat || isAdmin;

    if (!reportID || !isAgentZeroChat) {
        return children;
    }

    return (
        <AgentZeroStatusGate
            key={reportID}
            reportID={reportID}
        >
            {children}
        </AgentZeroStatusGate>
    );
}

function AgentZeroStatusGate({reportID, children}: React.PropsWithChildren<{reportID: string}>) {
    const {kickoffWaitingIndicator, ...stateValue} = useAgentZeroStatusIndicator(reportID, true);
    const actionsValue = useMemo(() => ({kickoffWaitingIndicator}), [kickoffWaitingIndicator]);

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
export type {AgentZeroStatusState, AgentZeroStatusActions, ReasoningEntry};
