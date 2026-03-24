import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import type {ReasoningEntry} from '@libs/ConciergeReasoningStore';
import NVPIndicatorVersionTracker from '@libs/NVPIndicatorVersionTracker';
import ONYXKEYS from '@src/ONYXKEYS';
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

    // Tracks outstanding concierge requests to handle rapid multi-message sends.
    // Each kickoffWaitingIndicator increments pendingKickoffs; each detected server
    // roundtrip completion (NVP version bump) decrements it. The optimistic "thinking"
    // state is only cleared when all pending requests have been processed.
    // This prevents msg1's response from clearing the indicator while msg2 is still pending.
    const nvpVersionRef = useRef<number>(0);
    const pendingKickoffsRef = useRef<number>(0);

    // Minimum time to display a label before allowing change (prevents rapid flicker)
    const MIN_DISPLAY_TIME = 300; // ms
    // Debounce delay for server label updates
    const DEBOUNCE_DELAY = 150; // ms

    // Subscribe to NVP indicator version tracking via a lib-level Onyx.connect.
    // The tracker fires its callback for each merge (before Onyx's internal batching
    // coalesces them for React subscribers via useSyncExternalStore). This lets us
    // detect changes that useOnyx's rendered value might skip.
    useEffect(() => {
        const unsubscribeConnection = NVPIndicatorVersionTracker.subscribe(reportID);
        const unsubscribeListener = NVPIndicatorVersionTracker.addListener((updatedReportID, version) => {
            if (updatedReportID !== reportID) {
                return;
            }
            // Each server roundtrip produces 2 version bumps (SET + CLEAR).
            // When a full cycle completes, decrement the pending counter.
            const previousVersion = nvpVersionRef.current;
            nvpVersionRef.current = version;
            if (pendingKickoffsRef.current > 0 && version >= previousVersion + 2) {
                pendingKickoffsRef.current = Math.max(0, pendingKickoffsRef.current - 1);
            }
        });

        return () => {
            unsubscribeListener();
            unsubscribeConnection();
        };
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

        // All pending requests have been processed when the counter reaches zero.
        // This correctly handles rapid multi-message sends: each kickoff increments
        // the counter, and each server roundtrip (detected via version jumps) decrements it.
        const allRequestsProcessed = pendingKickoffsRef.current <= 0;

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
        else if (optimisticStartTime && !allRequestsProcessed) {
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
            if ((hadServerLabel || allRequestsProcessed) && reasoningHistory.length > 0) {
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
        pendingKickoffsRef.current += 1;
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
