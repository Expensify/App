import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {clearAgentZeroProcessingIndicator, getNewerActions, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import type {ReasoningEntry} from '@libs/ConciergeReasoningStore';
import CONST from '@src/CONST';
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

type NewestReportAction = {
    reportActionID: string;
    actorAccountID?: number;
};

/**
 * Polling interval for fetching missed Concierge responses while the thinking indicator is visible.
 *
 * While the indicator is active, we poll getNewerActions every 30s to recover from
 * WebSocket drops or missed Pusher events. If a Concierge reply arrives (via Pusher
 * or the poll response), the normal Onyx update clears the indicator automatically.
 *
 * A hard safety clear at MAX_POLL_DURATION_MS ensures the indicator doesn't stay
 * forever if something goes wrong.
 */
const POLL_INTERVAL_MS = 30000;

/**
 * Maximum duration to poll before hard-clearing the indicator (safety net).
 * After this time, if we're online and no response has arrived, we clear the indicator.
 */
const MAX_POLL_DURATION_MS = 120000;

/**
 * Hook to manage AgentZero status indicator for chats where AgentZero responds.
 * This includes both Concierge DM chats and policy #admins rooms (where Concierge handles onboarding).
 * @param reportID - The report ID to monitor
 * @param isAgentZeroChat - Whether the chat is an AgentZero-enabled chat (Concierge DM or #admins room)
 */
/** Selector that extracts the newest report action ID and actor from the report actions collection. */
function selectNewestReportAction(reportActions: OnyxEntry<ReportActions>): NewestReportAction | undefined {
    if (!reportActions) {
        return undefined;
    }
    const actionIDs = Object.keys(reportActions);
    if (actionIDs.length === 0) {
        return undefined;
    }
    const newestReportActionID = actionIDs.reduce((a, b) => (Number(a) > Number(b) ? a : b));
    return {
        reportActionID: newestReportActionID,
        actorAccountID: reportActions[newestReportActionID]?.actorAccountID,
    };
}

function useAgentZeroStatusIndicator(reportID: string, isAgentZeroChat: boolean): AgentZeroStatusState {
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const serverLabel = reportNameValuePairs?.agentZeroProcessingRequestIndicator?.trim() ?? '';

    // Track the newest report action so we can fetch missed actions and detect actual Concierge replies.
    const [newestReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: selectNewestReportAction});
    const newestReportActionRef = useRef<NewestReportAction | undefined>(newestReportAction);
    useEffect(() => {
        newestReportActionRef.current = newestReportAction;
    }, [newestReportAction]);

    const [optimisticStartTime, setOptimisticStartTime] = useState<number | null>(null);
    const [displayedLabel, setDisplayedLabel] = useState<string>('');
    const [reasoningHistory, setReasoningHistory] = useState<ReasoningEntry[]>([]);
    const {translate} = useLocalize();
    const prevServerLabelRef = useRef<string>(serverLabel);
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isOfflineRef = useRef<boolean>(false);

    // Minimum time to display a label before allowing change (prevents rapid flicker)
    const MIN_DISPLAY_TIME = 300; // ms
    // Debounce delay for server label updates
    const DEBOUNCE_DELAY = 150; // ms

    /**
     * Clear the polling interval and safety timer. Called when the indicator clears normally,
     * when a new processing cycle starts, or when the component unmounts.
     */
    const clearPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (pollSafetyTimerRef.current) {
            clearTimeout(pollSafetyTimerRef.current);
            pollSafetyTimerRef.current = null;
        }
    }, []);

    /**
     * Hard-clear the indicator by resetting local state and clearing the Onyx NVP.
     * Called as a safety net after MAX_POLL_DURATION_MS if no response has arrived.
     */
    const hardClearIndicator = useCallback(() => {
        // If offline, don't clear — the response may arrive when reconnected
        if (isOfflineRef.current) {
            return;
        }
        clearPolling();
        setOptimisticStartTime(null);
        setDisplayedLabel('');
        clearAgentZeroProcessingIndicator(reportID);
        getNewerActions(reportID, newestReportActionRef.current?.reportActionID);
    }, [reportID, clearPolling]);

    /**
     * Start polling for missed actions every POLL_INTERVAL_MS. Every time processing
     * becomes active or the server label changes (renewal), the existing polling is
     * cleared and restarted.
     *
     * - Every 30s: call getNewerActions to fetch any missed Concierge responses
     * - After MAX_POLL_DURATION_MS: hard-clear the indicator if still showing (safety net)
     *
     * Polling stops when: indicator clears, component unmounts, or user goes offline.
     */
    const startPolling = useCallback(() => {
        clearPolling();

        // Poll every 30s for missed actions. Track the newest action ID before polling
        // so we can detect if new actions arrived (meaning Concierge responded).
        // If new actions arrive but the NVP CLEAR was missed via Pusher, we clear
        // the indicator client-side.
        const prePollingActionID = newestReportActionRef.current?.reportActionID;
        pollIntervalRef.current = setInterval(() => {
            if (isOfflineRef.current) {
                return;
            }
            const currentNewestReportAction = newestReportActionRef.current;
            const didConciergeReplyAfterPollingStarted =
                currentNewestReportAction?.actorAccountID === CONST.ACCOUNT_ID.CONCIERGE && currentNewestReportAction.reportActionID !== prePollingActionID;

            if (didConciergeReplyAfterPollingStarted) {
                clearAgentZeroProcessingIndicator(reportID);
                clearPolling();
                return;
            }
            getNewerActions(reportID, currentNewestReportAction?.reportActionID);
        }, POLL_INTERVAL_MS);

        // Safety net: hard-clear after MAX_POLL_DURATION_MS
        pollSafetyTimerRef.current = setTimeout(() => {
            hardClearIndicator();
        }, MAX_POLL_DURATION_MS);
    }, [clearPolling, hardClearIndicator, reportID]);

    // On reconnect, fetch missed actions if the indicator is still active.
    // Do not clear locally just because the socket recovered, and do not restart polling here:
    // the existing poll cycle keeps the original action baseline needed to detect a missed Concierge reply.
    const {isOffline} = useNetwork({
        onReconnect: () => {
            if (!serverLabel && !optimisticStartTime) {
                return;
            }
            getNewerActions(reportID, newestReportActionRef.current?.reportActionID);
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
        // Start/reset polling — the label acts as a lease renewal.
        if (hasServerLabel) {
            updateLabel(serverLabel);
            startPolling();
            if (optimisticStartTime) {
                setOptimisticStartTime(null);
            }
        }
        // When optimistic state is active but no server label, show "Concierge is thinking..."
        else if (optimisticStartTime) {
            const thinkingLabel = translate('common.thinking');
            updateLabel(thinkingLabel);
            // Polling was already started in kickoffWaitingIndicator
        }
        // Clear everything when processing ends — either via the normal transition
        // (server label went from non-empty to empty), or when the indicator is idle.
        else {
            clearPolling();
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
    }, [serverLabel, reasoningHistory.length, reportID, optimisticStartTime, translate, displayedLabel, startPolling, clearPolling]);

    useEffect(() => {
        isOfflineRef.current = isOffline;
    }, [isOffline]);

    // Clean up polling on unmount
    useEffect(
        () => () => {
            clearPolling();
        },
        [clearPolling],
    );

    const kickoffWaitingIndicator = useCallback(() => {
        if (!isAgentZeroChat) {
            return;
        }
        setOptimisticStartTime(Date.now());
        startPolling();
    }, [isAgentZeroChat, startPolling]);

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
