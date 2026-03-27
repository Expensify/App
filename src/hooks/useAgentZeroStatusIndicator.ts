import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {clearAgentZeroProcessingIndicator, getNewerActions, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import type {ReasoningEntry} from '@libs/ConciergeReasoningStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
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
 * Progressive retry intervals for the processing indicator (lease pattern).
 *
 * Instead of hard-clearing the indicator after a single timeout, we progressively
 * retry fetching newer actions. Long Concierge responses can take up to 2 minutes,
 * so a hard 60s TTL would incorrectly clear a legitimate in-progress response.
 *
 * Schedule:
 * - 60s: First retry — call getNewerActions, keep indicator showing
 * - 90s: Second retry — call getNewerActions again, keep indicator showing
 * - 120s: Final retry — if still no new actions AND online (Pusher connected), clear the indicator
 *
 * If a Concierge reply arrives at any point (via Pusher or getNewerActions response),
 * the normal Onyx update clears the indicator automatically.
 */
const PROGRESSIVE_RETRY_INTERVALS_MS = [60000, 90000, 120000];

/**
 * Hook to manage AgentZero status indicator for chats where AgentZero responds.
 * This includes both Concierge DM chats and policy #admins rooms (where Concierge handles onboarding).
 * @param reportID - The report ID to monitor
 * @param isAgentZeroChat - Whether the chat is an AgentZero-enabled chat (Concierge DM or #admins room)
 */
/** Selector that extracts only the newest reportActionID from the report actions collection. */
function selectNewestReportActionID(reportActions: OnyxEntry<ReportActions>): string | undefined {
    if (!reportActions) {
        return undefined;
    }
    const actionIDs = Object.keys(reportActions);
    if (actionIDs.length === 0) {
        return undefined;
    }
    // reportActionIDs are numeric strings; the highest value is the newest
    return actionIDs.reduce((a, b) => (Number(a) > Number(b) ? a : b));
}

function useAgentZeroStatusIndicator(reportID: string, isAgentZeroChat: boolean): AgentZeroStatusState {
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const serverLabel = reportNameValuePairs?.agentZeroProcessingRequestIndicator?.trim() ?? '';

    // Track the newest reportActionID so we can fetch missed actions when the safety timer fires
    const [newestReportActionID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: selectNewestReportActionID});
    const newestReportActionIDRef = useRef<string | undefined>(newestReportActionID);
    useEffect(() => {
        newestReportActionIDRef.current = newestReportActionID;
    }, [newestReportActionID]);

    const [optimisticStartTime, setOptimisticStartTime] = useState<number | null>(null);
    const [displayedLabel, setDisplayedLabel] = useState<string>('');
    const [reasoningHistory, setReasoningHistory] = useState<ReasoningEntry[]>([]);
    const {translate} = useLocalize();
    const prevServerLabelRef = useRef<string>(serverLabel);
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const retryTimersRef = useRef<NodeJS.Timeout[]>([]);
    const isOfflineRef = useRef<boolean>(false);

    // Minimum time to display a label before allowing change (prevents rapid flicker)
    const MIN_DISPLAY_TIME = 300; // ms
    // Debounce delay for server label updates
    const DEBOUNCE_DELAY = 150; // ms

    /**
     * Clear all progressive retry timers. Called when the indicator clears normally,
     * when a new processing cycle starts, or when the component unmounts.
     */
    const clearRetryTimers = useCallback(() => {
        for (const timer of retryTimersRef.current) {
            clearTimeout(timer);
        }
        retryTimersRef.current = [];
    }, []);

    /**
     * Hard-clear the indicator by resetting local state and clearing the Onyx NVP.
     * This is the final "lease expiry" — called only after all progressive retries
     * are exhausted and the network is connected (Pusher should have delivered the response).
     */
    const hardClearIndicator = useCallback(() => {
        // If offline, don't clear — the response may arrive when reconnected
        if (isOfflineRef.current) {
            return;
        }
        setOptimisticStartTime(null);
        setDisplayedLabel('');
        clearAgentZeroProcessingIndicator(reportID);
        getNewerActions(reportID, newestReportActionIDRef.current);
    }, [reportID]);

    /**
     * Start the progressive retry schedule. Every time processing becomes active
     * or the server label changes (renewal), all existing timers are cleared and
     * the full retry schedule restarts.
     *
     * - Intermediate retries call getNewerActions (the response, if it arrives,
     *   will clear the indicator via normal Onyx updates).
     * - The final retry hard-clears the indicator if still showing.
     */
    const startRetryTimers = useCallback(() => {
        clearRetryTimers();
        const lastIndex = PROGRESSIVE_RETRY_INTERVALS_MS.length - 1;
        for (const [index, delay] of PROGRESSIVE_RETRY_INTERVALS_MS.entries()) {
            const timer = setTimeout(() => {
                if (index < lastIndex) {
                    // Intermediate retry: poll for missed actions but keep indicator showing
                    getNewerActions(reportID, newestReportActionIDRef.current);
                } else {
                    // Final retry: clear if still stuck and online
                    hardClearIndicator();
                }
            }, delay);
            retryTimersRef.current.push(timer);
        }
    }, [clearRetryTimers, hardClearIndicator, reportID]);

    // Clear indicator on network reconnect. When Pusher reconnects, stale NVP state
    // may be re-delivered. Like typing indicators (Report/index.ts:486), we reset
    // the indicator and let fresh data arrive via GetMissingOnyxMessages.
    // We also call getNewerActions to pull any responses missed during the outage.
    const {isOffline} = useNetwork({
        onReconnect: () => {
            clearRetryTimers();
            setOptimisticStartTime(null);
            setDisplayedLabel('');
            clearAgentZeroProcessingIndicator(reportID);
            getNewerActions(reportID, newestReportActionIDRef.current);
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
            startRetryTimers();
            if (optimisticStartTime) {
                setOptimisticStartTime(null);
            }
        }
        // When optimistic state is active but no server label, show "Concierge is thinking..."
        else if (optimisticStartTime) {
            const thinkingLabel = translate('common.thinking');
            updateLabel(thinkingLabel);
            // Retry timers were already started in kickoffWaitingIndicator
        }
        // Clear everything when processing ends — either via the normal transition
        // (server label went from non-empty to empty), or when the indicator is idle.
        else {
            clearRetryTimers();
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
    }, [serverLabel, reasoningHistory.length, reportID, optimisticStartTime, translate, displayedLabel, startRetryTimers, clearRetryTimers]);

    useEffect(() => {
        isOfflineRef.current = isOffline;
    }, [isOffline]);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        setOptimisticStartTime(null);
    }, [isOffline]);

    // Clean up retry timers on unmount
    useEffect(
        () => () => {
            clearRetryTimers();
        },
        [clearRetryTimers],
    );

    const kickoffWaitingIndicator = useCallback(() => {
        if (!isAgentZeroChat) {
            return;
        }
        setOptimisticStartTime(Date.now());
        startRetryTimers();
    }, [isAgentZeroChat, startRetryTimers]);

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
