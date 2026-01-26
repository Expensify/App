import {useCallback, useEffect, useMemo, useState} from 'react';
import * as ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import {subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type AgentZeroStatusState = {
    isProcessing: boolean;
    reasoningHistory: string[];
    kickoffWaitingIndicator: () => void;
};

/**
 * Tracks Concierge processing state and reasoning updates:
 * - Shows processing state when server indicates Concierge is working
 * - Receives reasoning summaries from Auth via Pusher events
 * - Clears reasoning when the final message arrives
 */
function useAgentZeroStatusIndicator(reportID: string, isConciergeChat: boolean): AgentZeroStatusState {
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true});
    const serverLabel = reportNameValuePairs?.agentZeroProcessingRequestIndicator?.trim();
    const [isOptimisticallyProcessing, setIsOptimisticallyProcessing] = useState(false);
    const [serverLabelVersion, setServerLabelVersion] = useState(0);
    const [waitingSessionVersion, setWaitingSessionVersion] = useState<number | null>(null);
    const [reasoningHistory, setReasoningHistory] = useState<string[]>([]);

    const isProcessing = isConciergeChat && (!!serverLabel || isOptimisticallyProcessing);

    useEffect(() => {
        if (!isConciergeChat || !reportID) {
            return;
        }

        subscribeToReportReasoningEvents(reportID);

        const unsubscribeFromStore = ConciergeReasoningStore.subscribe((changedReportID, state) => {
            if (changedReportID !== reportID) {
                return;
            }
            setReasoningHistory(state ? state.entries.map((entry) => entry.reasoning) : []);
        });

        setReasoningHistory(ConciergeReasoningStore.getReasoningHistory(reportID));

        return () => {
            unsubscribeFromStore();
            unsubscribeFromReportReasoningChannel(reportID);
        };
    }, [reportID, isConciergeChat]);

    useEffect(() => {
        if (!serverLabel && reasoningHistory.length > 0) {
            ConciergeReasoningStore.clearReasoning(reportID);
        }
    }, [serverLabel, reasoningHistory.length, reportID]);

    useEffect(() => {
        setServerLabelVersion((version) => version + 1);
    }, [reportNameValuePairs]);

    const kickoffWaitingIndicator = useCallback(() => {
        if (!isConciergeChat || serverLabel) {
            return;
        }

        setIsOptimisticallyProcessing(true);
        setWaitingSessionVersion(serverLabelVersion);
    }, [isConciergeChat, serverLabel, serverLabelVersion]);

    useEffect(() => {
        const hasServerUpdatedSinceKickoff = waitingSessionVersion !== null && serverLabelVersion !== waitingSessionVersion;
        if (!serverLabel || !hasServerUpdatedSinceKickoff) {
            return;
        }

        setIsOptimisticallyProcessing(false);
        setWaitingSessionVersion(null);
    }, [serverLabel, serverLabelVersion, waitingSessionVersion]);

    useEffect(() => {
        if (!serverLabel && !isOptimisticallyProcessing) {
            return;
        }

        if (!serverLabel) {
            setIsOptimisticallyProcessing(false);
        }
    }, [serverLabel, isOptimisticallyProcessing]);

    return useMemo(
        () => ({
            isProcessing,
            reasoningHistory,
            kickoffWaitingIndicator,
        }),
        [isProcessing, reasoningHistory, kickoffWaitingIndicator],
    );
}

export default useAgentZeroStatusIndicator;
