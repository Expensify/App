import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {clearAgentZeroProcessingIndicator, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import type {ReasoningEntry} from '@libs/ConciergeReasoningStore';
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
 * Safety timeout for the processing indicator (lease pattern).
 * If the client misses the server CLEAR update (e.g., Onyx batching coalesced SET+CLEAR,
 * Pusher reconnect delivered stale state, or the CLEAR was dropped), the indicator
 * auto-expires after this duration. This follows the "lease pattern" from distributed
 * systems: every state assertion must be time-bounded.
 *
 * 60s is appropriate because:
 * - AI processing can take 30-45s on dev environments
 * - XMPP uses 30s for composing to paused transitions
 * - This gives a comfortable margin above normal processing time
 */
const SAFETY_TIMEOUT_MS = 60000;

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
    const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Minimum time to display a label before allowing change (prevents rapid flicker)
    const MIN_DISPLAY_TIME = 300; // ms
    // Debounce delay for server label updates
    const DEBOUNCE_DELAY = 150; // ms

    /**
     * Clear the safety timeout. Called when the indicator clears normally
     * or when the component unmounts.
     */
    const clearSafetyTimer = useCallback(() => {
        if (!safetyTimerRef.current) {
            return;
        }
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
    }, []);

    /**
     * Auto-clear the indicator by resetting local state and clearing the Onyx NVP.
     * This is the "lease expiry" — if no renewal (new server label) or explicit clear
     * arrived within the timeout window, assume the indicator is stale.
     */
    const autoClearIndicator = useCallback(() => {
        setOptimisticStartTime(null);
        setDisplayedLabel('');
        clearAgentZeroProcessingIndicator(reportID);
        safetyTimerRef.current = null;
    }, [reportID]);

    /**
     * Start or reset the safety timeout. Every time processing becomes active
     * or the server label changes (renewal), the timer resets to the full duration.
     */
    const startSafetyTimer = useCallback(() => {
        clearSafetyTimer();
        safetyTimerRef.current = setTimeout(autoClearIndicator, SAFETY_TIMEOUT_MS);
    }, [clearSafetyTimer, autoClearIndicator]);

    // Clear indicator on network reconnect. When Pusher reconnects, stale NVP state
    // may be re-delivered. Like typing indicators (Report/index.ts:486), we reset
    // the indicator and let fresh data arrive via GetMissingOnyxMessages.
    const {isOffline} = useNetwork({
        onReconnect: () => {
            clearSafetyTimer();
            setOptimisticStartTime(null);
            setDisplayedLabel('');
            clearAgentZeroProcessingIndicator(reportID);
        },
    });

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

        // When server label arrives, transition smoothly without flicker.
        // Start/reset the safety timer — the label acts as a lease renewal.
        if (hasServerLabel) {
            updateLabel(serverLabel);
            startSafetyTimer();
            if (optimisticStartTime) {
                setOptimisticStartTime(null);
            }
        }
        // When optimistic state is active but no server label, show "Concierge is thinking..."
        else if (optimisticStartTime) {
            const thinkingLabel = translate('common.thinking');
            updateLabel(thinkingLabel);
            // Safety timer was already started in kickoffWaitingIndicator
        }
        // Clear everything when processing ends — either via the normal transition
        // (server label went from non-empty to empty), or when the indicator is idle.
        else {
            clearSafetyTimer();
            if (displayedLabel !== '') {
                updateLabel('');
            }
            if (hadServerLabel && reasoningHistory.length > 0) {
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
    }, [serverLabel, reasoningHistory.length, reportID, optimisticStartTime, translate, displayedLabel, startSafetyTimer, clearSafetyTimer]);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        setOptimisticStartTime(null);
    }, [isOffline]);

    // Clean up safety timer on unmount
    useEffect(
        () => () => {
            clearSafetyTimer();
        },
        [clearSafetyTimer],
    );

    const kickoffWaitingIndicator = useCallback(() => {
        if (!isAgentZeroChat) {
            return;
        }
        setOptimisticStartTime(Date.now());
        startSafetyTimer();
    }, [isAgentZeroChat, startSafetyTimer]);

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
