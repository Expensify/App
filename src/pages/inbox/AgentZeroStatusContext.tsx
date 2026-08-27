import useOnyx from '@hooks/useOnyx';

import {clearConciergeThinkingKickoff, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import type {ReasoningEntry} from '@libs/AgentZeroReasoningStore';
import {isDM} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Report from '@src/types/onyx/Report';

import type {OnyxEntry} from 'react-native-onyx';

import {getCustomAgentParticipantAccountID, getReportParticipantAccountIDs} from '@selectors/AgentZeroChat';
import {getReportChatType, getReportParentReportID} from '@selectors/Report';
import {getNewestReportActionSelector} from '@selectors/ReportAction';
import {agentZeroProcessingAgentIDsSelector} from '@selectors/ReportNameValuePairs';
import {accountIDSelector} from '@selectors/Session';
import React, {createContext, useContext, useEffect} from 'react';

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

type ReportMeta = {
    chatType: Report['chatType'];
    isDM: boolean;
    parentReportID: Report['parentReportID'];
    participantAccountIDs: number[];
};

function reportMetaSelector(report: OnyxEntry<Report>): ReportMeta {
    return {
        chatType: getReportChatType(report),
        isDM: isDM(report),
        parentReportID: getReportParentReportID(report),
        participantAccountIDs: getReportParticipantAccountIDs(report),
    };
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
 * Cheap outer guard — subscribes to the scalar CONCIERGE_REPORT_ID, the report's chat metadata,
 * and this report's processing-indicator NVP, then decides whether the gate below it does any
 * work. For non-AgentZero reports (the common case) the gate stays inert: no reasoning
 * subscription, no report-actions subscription, and an empty candidate list.
 *
 * A report qualifies either because the server is *already* processing for an agent in it, or
 * because it's one of the chat types where an agent responds by default: Concierge DMs, policy
 * #admins rooms, and custom-agent chats (any report with a participant whose personalDetails
 * carries `isCustomAgent: true`, stamped server-side in `Account::formatNewDotPersonalDetails`).
 *
 * The NVP arm is what makes this work outside those chat types — expense reports, threads,
 * anywhere else Auth decides to run an agent. Auth owns the rule for where agents respond
 * (`shouldEmitConciergeStatusUpdates`), so keying off the indicator it writes keeps the client
 * from re-deriving that rule and drifting from it.
 *
 * The chat-type arm still matters: it mounts the gate *before* the first NVP lands, so the
 * reasoning Pusher subscription is live from the start of a Concierge run.
 */
function AgentZeroStatusProvider({reportID, children}: React.PropsWithChildren<{reportID: string | undefined}>) {
    const [reportMeta] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportMetaSelector});
    const {chatType, isDM: isDMReport = false, parentReportID, participantAccountIDs} = reportMeta ?? {};
    const [agentParticipantAccountID] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: getCustomAgentParticipantAccountID(participantAccountIDs)});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    // Read once here and hand it to the gate rather than subscribing again inside it — the
    // selector narrows to a short accountID list, so this only re-renders when the set of
    // actively-processing agents changes.
    const [serverAgentIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: agentZeroProcessingAgentIDsSelector});

    // Concierge answers each question in a thread off the Concierge DM, so those threads carry its indicator too.
    const isConciergeChat = !!conciergeReportID && (reportID === conciergeReportID || parentReportID === conciergeReportID);
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    const isCustomAgentChat = agentParticipantAccountID !== undefined;
    const otherParticipantCount = currentUserAccountID === undefined ? 0 : (participantAccountIDs ?? []).filter((accountID) => accountID !== currentUserAccountID).length;
    const customAgentDMAccountID = isCustomAgentChat && isDMReport && otherParticipantCount === 1 ? agentParticipantAccountID : undefined;
    const isServerProcessing = (serverAgentIDs ?? []).length > 0;
    const isAgentZeroChat = isConciergeChat || isAdmin || isCustomAgentChat || isServerProcessing;

    // Mounted for every report, inert ones included, so `children` keep a stable position. A report
    // becomes an AgentZero chat mid-session, and wrapping it only then would remount the whole feed.
    return (
        <AgentZeroStatusGate
            key={reportID}
            reportID={reportID}
            isActive={!!reportID && isAgentZeroChat}
            serverAgentIDs={serverAgentIDs}
            includeConcierge={isConciergeChat || isAdmin}
            customAgentDMAccountID={customAgentDMAccountID}
        >
            {children}
        </AgentZeroStatusGate>
    );
}

function AgentZeroStatusGate({
    reportID,
    isActive,
    serverAgentIDs,
    includeConcierge,
    customAgentDMAccountID,
    children,
}: React.PropsWithChildren<{reportID: string | undefined; isActive: boolean; serverAgentIDs: number[] | undefined; includeConcierge: boolean; customAgentDMAccountID?: number}>) {
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    // When the agent's reply (ADDCOMMENT) lands before the server's indicator-clear NVP update,
    // the thinking bubble would remain visible briefly. Suppress any agent whose reply is already
    // the newest action in the report so the bubble hides as soon as the reply renders.
    //
    // Keyed on the report only while an agent responds here: the gate mounts for every report, and
    // this selector re-runs on every report-action change.
    const [newestReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${isActive ? reportID : undefined}`, {selector: getNewestReportActionSelector});

    // One reasoning Pusher subscription per report (not per agent). The handler in Report
    // actions routes each event to the right agent's reasoning history by its actorAccountID.
    // Cleanup clears the report's reasoning history and the Pusher subscription.
    useEffect(() => {
        if (!isActive || !reportID) {
            return;
        }
        subscribeToReportReasoningEvents(reportID);
        return () => {
            unsubscribeFromReportReasoningChannel(reportID);
        };
    }, [reportID, isActive]);

    const optimisticAgentAccountID = includeConcierge ? CONST.ACCOUNT_ID.CONCIERGE : customAgentDMAccountID;

    // The composer calls this before the server's processing-indicator NVP lands. Concierge and
    // custom-agent DMs both use the same per-agent optimistic store; other custom-agent contexts
    // remain server-driven so report-activity agents don't appear before Auth decides to run them.
    const kickoffWaitingIndicator = () => {
        if (optimisticAgentAccountID === undefined || !reportID) {
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

    const candidateIDs = new Set<number>(isActive ? (serverAgentIDs ?? []) : []);
    if (isActive && includeConcierge) {
        candidateIDs.add(CONST.ACCOUNT_ID.CONCIERGE);
    } else if (isActive && customAgentDMAccountID !== undefined) {
        candidateIDs.add(customAgentDMAccountID);
    }
    if (currentUserAccountID !== undefined) {
        candidateIDs.delete(currentUserAccountID);
    }
    // Suppress an agent whose reply is already the newest action. The server's indicator-clear NVP
    // can arrive up to ~250ms after the reply Pusher event, leaving the bubble visible on top of
    // the completed response. Dropping the agent here as soon as their ADDCOMMENT lands prevents
    // that flash without waiting for the NVP clear.
    if (newestReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && newestReportAction.actorAccountID !== undefined) {
        candidateIDs.delete(newestReportAction.actorAccountID);
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
