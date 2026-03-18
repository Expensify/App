import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Onyx from 'react-native-onyx';
import {subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import type {ReasoningEntry} from '@libs/ConciergeReasoningStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type AgentZeroStatusState = {
    isProcessing: boolean;
    reasoningHistory: ReasoningEntry[];
    statusLabel: string;
    kickoffWaitingIndicator: () => void;
};

/**
 * Hook to manage AgentZero status indicator for chats where AgentZero responds.
 * This includes both Concierge DM chats and policy #admins rooms (where Concierge handles onboarding).
 * @param reportID - The report ID to monitor
 * @param isAgentZeroChat - Whether the chat is an AgentZero-enabled chat (Concierge DM or #admins room)
 */
function useAgentZeroStatusIndicator(reportID: string, isAgentZeroChat: boolean): AgentZeroStatusState {
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const serverLabel = reportNameValuePairs?.agentZeroProcessingRequestIndicator?.trim() ?? '';

    const [optimisticStartTime, setOptimisticStartTime] = useState<number | null>(null);
    const [displayedLabel, setDisplayedLabel] = useState<string>('');
    const [reasoningHistory, setReasoningHistory] = useState<ReasoningEntry[]>([]);
    const {translate} = useLocalize();
    const prevServerLabelRef = useRef<string>(serverLabel);
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const {isOffline} = useNetwork();

    // Tracks whether the NVP has been updated since the last kickoff.
    // Onyx batches merges within a single tick, so when the client catches up on missed
    // updates (e.g., via GetMissingOnyxMessages), a SET followed by CLEAR can be coalesced
    // into a single notification with the final (empty) value. The hook would never see
    // the intermediate non-empty server label, leaving optimisticStartTime stuck.
    // This counter increments on every NVP write, letting us detect that the server
    // processed the request even when the rendered value jumps directly to empty.
    const nvpVersionRef = useRef<number>(0);
    const kickoffNvpVersionRef = useRef<number>(0);

    // Minimum time to display a label before allowing change (prevents rapid flicker)
    const MIN_DISPLAY_TIME = 300; // ms
    // Debounce delay for server label updates
    const DEBOUNCE_DELAY = 150; // ms

    // Subscribe to raw Onyx updates to count NVP writes.
    // Onyx.connect fires its callback for each merge (before Onyx's internal batching
    // coalesces them for React subscribers via useSyncExternalStore). This lets us
    // detect changes that useOnyx's rendered value might skip.
    useEffect(() => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            callback: (value: ReportNameValuePairs | null) => {
                const indicatorValue = value?.agentZeroProcessingRequestIndicator;
                // Only count updates where the indicator field is explicitly present
                // (set to a string, including empty string), not when the NVP object
                // is updated for unrelated fields.
                if (indicatorValue !== undefined) {
                    nvpVersionRef.current += 1;
                }
            },
        });

        return () => Onyx.disconnect(connection);
    }, [reportID]);

    useEffect(() => {
        setReasoningHistory(ConciergeReasoningStore.getReasoningHistory(reportID));
    }, [reportID]);

    useEffect(() => {
        const unsubscribe = ConciergeReasoningStore.subscribe((updatedReportID, entries) => {
            if (updatedReportID !== reportID) {
                return;
            }
            setReasoningHistory(entries);
        });

        return unsubscribe;
    }, [reportID]);

    useEffect(() => {
        if (!isAgentZeroChat) {
            return;
        }

        subscribeToReportReasoningEvents(reportID);

        // Cleanup: unsubscribeFromReportReasoningChannel handles Pusher unsubscribing,
        // clearing reasoning history from ConciergeReasoningStore, and subscription tracking
        return () => {
            unsubscribeFromReportReasoningChannel(reportID);
        };
    }, [isAgentZeroChat, reportID]);

    useEffect(() => {
        const hadServerLabel = !!prevServerLabelRef.current;
        const hasServerLabel = !!serverLabel;

        // Detect if the server has processed the request since kickoff.
        // The NVP version counter increments on every Onyx write to the indicator field,
        // including batched writes where intermediate values are coalesced.
        const serverProcessedSinceKickoff = nvpVersionRef.current > kickoffNvpVersionRef.current;

        // Helper function to update label with timing control
        const updateLabel = (newLabel: string) => {
            const now = Date.now();
            const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
            const remainingMinTime = Math.max(0, MIN_DISPLAY_TIME - timeSinceLastUpdate);

            // Clear any pending update
            if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
                updateTimerRef.current = null;
            }

            // If enough time has passed or it's a critical update (clearing), update immediately
            if (remainingMinTime === 0 || newLabel === '') {
                if (displayedLabel !== newLabel) {
                    setDisplayedLabel(newLabel);
                    lastUpdateTimeRef.current = now;
                }
            } else {
                // Schedule update after debounce + remaining min display time
                const delay = DEBOUNCE_DELAY + remainingMinTime;
                updateTimerRef.current = setTimeout(() => {
                    if (displayedLabel !== newLabel) {
                        setDisplayedLabel(newLabel);
                        lastUpdateTimeRef.current = Date.now();
                    }
                    updateTimerRef.current = null;
                }, delay);
            }
        };

        // When server label arrives, transition smoothly without flicker
        if (hasServerLabel) {
            updateLabel(serverLabel);
            if (optimisticStartTime) {
                setOptimisticStartTime(null);
            }
        }
        // When optimistic state is active but no server label, show "Concierge is thinking..."
        // Only persist optimistic state when the server has NOT yet processed the request.
        // If the server already set and cleared the indicator (detected via version counter),
        // the optimistic state is stale and should be cleared immediately.
        else if (optimisticStartTime && !serverProcessedSinceKickoff) {
            const thinkingLabel = translate('common.thinking');
            updateLabel(thinkingLabel);
        }
        // Clear everything when processing ends — either via the normal transition
        // (server label went from non-empty to empty), or when the optimistic state
        // is stale (server responded and cleared but Onyx batching coalesced the updates).
        else {
            if (displayedLabel !== '') {
                updateLabel('');
            }
            if (optimisticStartTime) {
                setOptimisticStartTime(null);
            }
            if ((hadServerLabel || serverProcessedSinceKickoff) && reasoningHistory.length > 0) {
                ConciergeReasoningStore.clearReasoning(reportID);
            }
        }

        prevServerLabelRef.current = serverLabel;

        // Cleanup timer on unmount
        return () => {
            if (!updateTimerRef.current) {
                return;
            }
            clearTimeout(updateTimerRef.current);
        };
    }, [serverLabel, reasoningHistory.length, reportID, optimisticStartTime, translate, displayedLabel]);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        setOptimisticStartTime(null);
    }, [isOffline]);

    const kickoffWaitingIndicator = useCallback(() => {
        if (!isAgentZeroChat) {
            return;
        }
        kickoffNvpVersionRef.current = nvpVersionRef.current;
        setOptimisticStartTime(Date.now());
    }, [isAgentZeroChat]);

    const isProcessing = isAgentZeroChat && !isOffline && (!!serverLabel || !!optimisticStartTime);

    return useMemo(
        () => ({
            isProcessing,
            reasoningHistory,
            statusLabel: displayedLabel,
            kickoffWaitingIndicator,
        }),
        [isProcessing, reasoningHistory, displayedLabel, kickoffWaitingIndicator],
    );
}

export default useAgentZeroStatusIndicator;
export type {AgentZeroStatusState};
