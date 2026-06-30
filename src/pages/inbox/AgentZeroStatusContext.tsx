import {getCustomAgentParticipantAccountID, getReportParticipantAccountIDs} from '@selectors/AgentZeroChat';
import {getReportChatType} from '@selectors/Report';
import {agentZeroProcessingAgentIDsSelector} from '@selectors/ReportNameValuePairs';
import {accountIDSelector} from '@selectors/Session';
import React, {createContext, useContext, useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {clearConciergeThinkingKickoff, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import type {ReasoningEntry} from '@libs/AgentZeroReasoningStore';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Report from '@src/types/onyx/Report';
import type {ReportActions} from '@src/types/onyx/ReportAction';

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
    /** Optimistically show the current AgentZero persona's thinking indicator. */
    kickoffWaitingIndicator: () => void;
};

type NewestReportAction = {
    reportActionID: string;
    replyActorAccountID?: number;
};

function newestReportActionSelector(actions: OnyxEntry<ReportActions>): NewestReportAction | undefined {
    const list = Object.values(actions ?? {}).filter(Boolean);
    if (list.length === 0) {
        return undefined;
    }
    const newest = list.reduce((a, b) => {
        const createdA = a.created ?? '';
        const createdB = b.created ?? '';
        if (createdA !== createdB) {
            return createdA > createdB ? a : b;
        }
        return a.reportActionID > b.reportActionID ? a : b;
    });

    return {
        reportActionID: newest.reportActionID,
        replyActorAccountID: newest.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT ? newest.actorAccountID : undefined,
    };
}

function isDMReportSelector(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.CHAT && !report.chatType && !report.parentReportID && !report.parentReportActionID;
}

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
 * report with a participant whose personalDetails carries `isCustomAgent: true`, stamped
 * server-side in `Account::formatNewDotPersonalDetails`).
 */
function AgentZeroStatusProvider({reportID, children}: React.PropsWithChildren<{reportID: string | undefined}>) {
    const [chatType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportChatType});
    const [isDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: isDMReportSelector});
    const [participantAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportParticipantAccountIDs});
    const [agentParticipantAccountID] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: getCustomAgentParticipantAccountID(participantAccountIDs)});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    const isCustomAgentChat = agentParticipantAccountID !== undefined;
    const otherParticipantCount = currentUserAccountID === undefined ? 0 : (participantAccountIDs ?? []).filter((accountID) => accountID !== currentUserAccountID).length;
    const customAgentDMAccountID = isCustomAgentChat && isDMReport && otherParticipantCount === 1 ? agentParticipantAccountID : undefined;
    const isAgentZeroChat = isConciergeChat || isAdmin || isCustomAgentChat;

    if (!reportID || !isAgentZeroChat) {
        return children;
    }

    return (
        <AgentZeroStatusGate
            key={reportID}
            reportID={reportID}
            includeConcierge={isConciergeChat || isAdmin}
            customAgentDMAccountID={customAgentDMAccountID}
        >
            {children}
        </AgentZeroStatusGate>
    );
}

function AgentZeroStatusGate({
    reportID,
    includeConcierge,
    customAgentDMAccountID,
    children,
}: React.PropsWithChildren<{reportID: string; includeConcierge: boolean; customAgentDMAccountID?: number}>) {
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [serverAgentIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: agentZeroProcessingAgentIDsSelector});

    // When the agent's reply (ADDCOMMENT) lands before the server's indicator-clear NVP update,
    // the thinking bubble would remain visible briefly. Suppress any agent whose reply is already
    // the newest action in the report so the bubble hides as soon as the reply renders.
    const [newestReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: newestReportActionSelector});

    // One reasoning Pusher subscription per report (not per agent). The handler in Report
    // actions routes each event to the right agent's reasoning history by its actorAccountID.
    // Cleanup clears the report's reasoning history and the Pusher subscription.
    useEffect(() => {
        subscribeToReportReasoningEvents(reportID);
        return () => {
            unsubscribeFromReportReasoningChannel(reportID);
        };
    }, [reportID]);

    const optimisticAgentAccountID = includeConcierge ? CONST.ACCOUNT_ID.CONCIERGE : customAgentDMAccountID;

    // The composer calls this before the server's processing-indicator NVP lands. Concierge and
    // custom-agent DMs both use the same per-agent optimistic store; other custom-agent contexts
    // remain server-driven so report-activity agents don't appear before Auth decides to run them.
    const kickoffWaitingIndicator = () => {
        if (optimisticAgentAccountID === undefined) {
            return;
        }
        AgentZeroOptimisticStore.increment(reportID, optimisticAgentAccountID, newestReportAction?.reportActionID ?? null);
    };
    const [shouldKickoff] = useOnyx(ONYXKEYS.CONCIERGE_THINKING_KICKOFF);
    useEffect(() => {
        if (!shouldKickoff || !includeConcierge) {
            return;
        }
        clearConciergeThinkingKickoff();
        kickoffWaitingIndicator();
    }, [shouldKickoff, includeConcierge, kickoffWaitingIndicator]);

    const candidateIDs = new Set<number>(serverAgentIDs ?? []);
    if (includeConcierge) {
        candidateIDs.add(CONST.ACCOUNT_ID.CONCIERGE);
    } else if (customAgentDMAccountID !== undefined) {
        candidateIDs.add(customAgentDMAccountID);
    }
    if (currentUserAccountID !== undefined) {
        candidateIDs.delete(currentUserAccountID);
    }
    // Suppress an agent whose reply is already the newest action. The server's indicator-clear NVP
    // can arrive up to ~250ms after the reply Pusher event, leaving the bubble visible on top of
    // the completed response. Dropping the agent here as soon as their ADDCOMMENT lands prevents
    // that flash without waiting for the NVP clear.
    if (newestReportAction?.replyActorAccountID !== undefined) {
        candidateIDs.delete(newestReportAction.replyActorAccountID);
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
