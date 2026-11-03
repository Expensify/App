import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';

import {isGroupPolicyByType} from '@libs/PolicyUtils';
import type {StreamedReplyEvent} from '@libs/Pusher/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {policyTypeSelector} from '@src/selectors/Policy';
import type {ReportAction} from '@src/types/onyx';

import {getCustomAgentParticipantAccountID, getReportParticipantAccountIDs} from '@selectors/AgentZeroChat';
import {getReportChatType, getReportParentReportID, getReportPolicyID} from '@selectors/Report';
import React, {createContext, useContext} from 'react';

import {STREAMED_REPLY_STATUS} from './streamedReplyState';
import useStreamedReplyPacing from './useStreamedReplyPacing';

type StreamedReplyState = {
    streamedReplyAction: ReportAction | null;
    hasActiveReply: boolean;
    isReplyPendingCompletion: boolean;
};

type StreamedReplyActions = {
    clearStreamedReply: () => void;
    /**
     * Apply a streamed-reply event from a non-Pusher source (e.g. a local pacer for
     * pregenerated replies). Uses the same reducer as the Pusher path so
     * `reportActionID`-based reconciliation works unchanged.
     */
    dispatchLocalReplyEvent: (event: StreamedReplyEvent) => void;
    revealStreamedReplyFromReportAction: (reportAction: ReportAction) => void;
};

const defaultState: StreamedReplyState = {
    streamedReplyAction: null,
    hasActiveReply: false,
    isReplyPendingCompletion: false,
};

const defaultActions: StreamedReplyActions = {
    clearStreamedReply: () => {},
    dispatchLocalReplyEvent: () => {},
    revealStreamedReplyFromReportAction: () => {},
};

const StreamedReplyStateContext = createContext<StreamedReplyState>(defaultState);
const StreamedReplyActionsContext = createContext<StreamedReplyActions>(defaultActions);

function StreamedReplyProvider({reportID, children}: React.PropsWithChildren<{reportID: string | undefined}>) {
    const [chatType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportChatType});
    const [participantAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportParticipantAccountIDs});
    const [agentParticipantAccountID] = usePersonalDetailsByIDs(participantAccountIDs, getCustomAgentParticipantAccountID(participantAccountIDs));
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [parentReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportParentReportID});

    // Concierge answers each question in a thread off the Concierge DM, so those threads stream replies too.
    const isConciergeChat = !!conciergeReportID && (reportID === conciergeReportID || parentReportID === conciergeReportID);
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    // See AgentZeroStatusContext for the rationale: `isCustomAgent` lives on the participant's
    // personalDetails, stamped by Auth in `Account::formatNewDotPersonalDetails`.
    const isCustomAgentChat = agentParticipantAccountID !== undefined;
    const isAgentZeroChat = isConciergeChat || isAdmin || isCustomAgentChat;

    if (!reportID || !isAgentZeroChat) {
        return children;
    }

    return (
        <StreamedReplyGate
            key={reportID}
            reportID={reportID}
        >
            {children}
        </StreamedReplyGate>
    );
}

function StreamedReplyGate({reportID, children}: React.PropsWithChildren<{reportID: string}>) {
    const [policyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportPolicyID});
    const [policyType] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: policyTypeSelector,
    });
    const isGroupPolicyReport = isGroupPolicyByType(policyType);
    const {clearStreamedReply, dispatchLocalReplyEvent, reply, revealStreamedReplyFromReportAction} = useStreamedReplyPacing(reportID, isGroupPolicyReport);
    const stateValue: StreamedReplyState = {
        streamedReplyAction: reply?.reportAction ?? null,
        hasActiveReply: !!reply?.reportAction,
        isReplyPendingCompletion: !!reply?.reportAction && (reply.status !== STREAMED_REPLY_STATUS.COMPLETED || !!reply.pusherPendingCompletionEvent),
    };
    const actionsValue: StreamedReplyActions = {
        clearStreamedReply,
        dispatchLocalReplyEvent,
        revealStreamedReplyFromReportAction,
    };

    return (
        <StreamedReplyActionsContext.Provider value={actionsValue}>
            <StreamedReplyStateContext.Provider value={stateValue}>{children}</StreamedReplyStateContext.Provider>
        </StreamedReplyActionsContext.Provider>
    );
}

function useStreamedReply(): StreamedReplyState {
    return useContext(StreamedReplyStateContext);
}

function useStreamedReplyActions(): StreamedReplyActions {
    return useContext(StreamedReplyActionsContext);
}

export {StreamedReplyProvider, useStreamedReply, useStreamedReplyActions};
