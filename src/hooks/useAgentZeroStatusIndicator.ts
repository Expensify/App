import agentZeroProcessingIndicatorSelector from '@selectors/ReportNameValuePairs';
import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from 'react';
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

// Minimum time to display a label before allowing change (prevents rapid flicker)
const MIN_DISPLAY_TIME = 300; // ms
// Debounce delay for server label updates
const DEBOUNCE_DELAY = 150; // ms

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

/**
 * Hook to manage AgentZero status indicator for chats where AgentZero responds.
 * This includes both Concierge DM chats and policy #admins rooms (where Concierge handles onboarding).
 * @param reportID - The report ID to monitor
 * @param isAgentZeroChat - Whether the chat is an AgentZero-enabled chat (Concierge DM or #admins room)
 */
function useAgentZeroStatusIndicator(reportID: string, isAgentZeroChat: boolean): AgentZeroStatusState {
    // Server-driven processing label from report name-value pairs (e.g. "Looking up categories...")
    // Uses selector to only re-render when the specific field changes, not on any NVP change.
    const [serverLabel] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: agentZeroProcessingIndicatorSelector});

    // Track the newest report action so we can fetch missed actions and detect actual Concierge replies.
    const [newestReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: selectNewestReportAction});
    const newestReportActionRef = useRef<NewestReportAction | undefined>(newestReportAction);
    useEffect(() => {
        newestReportActionRef.current = newestReportAction;
    }, [newestReportAction]);

    // Track pending optimistic requests with a counter.
    // Each kickoffWaitingIndicator() call increments the counter; when a Concierge reply
    // is detected (via polling, Pusher, reconnect, or safety timeout), the counter resets
    // to 0 rather than decrementing — any signal that a response arrived is treated as
    // resolving all pending requests (optimistic state is a display signal, not a queue).
    const [pendingOptimisticRequests, setPendingOptimisticRequests] = useState(0);
    // Debounced label shown to the user — smooths rapid server label changes.
    // displayedLabelRef mirrors state so the label-sync effect can read the current value
    // without including displayedLabel in its dependency array (avoids extra effect cycles).
    const displayedLabelRef = useRef<string>('');
    const [displayedLabel, setDisplayedLabel] = useState<string>('');
    const {translate} = useLocalize();
    const prevServerLabelRef = useRef<string>(serverLabel ?? '');
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isOfflineRef = useRef<boolean>(false);
    // Newest reportActionID at the moment the indicator became active (raw state, ignoring
    // offline). Lets us distinguish "a pre-existing Concierge action was already the newest"
    // (common in Concierge DMs, where the previous reply is still the latest action) from
    // "a new Concierge reply arrived after the indicator started." Without this, sending a
    // message in a Concierge DM would immediately clear the just-activated indicator.
    const indicatorBaselineActionIDRef = useRef<string | null>(null);
    const wasIndicatorActiveRef = useRef<boolean>(false);

    /**
     * Clear the polling interval and safety timer. Called when the indicator clears normally,
     * when a new processing cycle starts, or when the component unmounts.
     */
    const clearPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (pollSafetyTimerRef.current) {
            clearTimeout(pollSafetyTimerRef.current);
            pollSafetyTimerRef.current = null;
        }
    };

    /**
     * Hard-clear the indicator by resetting local state and clearing the Onyx NVP.
     * Called as a safety net after MAX_POLL_DURATION_MS if no response has arrived.
     */
    const hardClearIndicator = () => {
        // If offline, don't clear — the response may arrive when reconnected
        if (isOfflineRef.current) {
            return;
        }
        clearPolling();
        setPendingOptimisticRequests(0);
        displayedLabelRef.current = '';
        setDisplayedLabel('');
        clearAgentZeroProcessingIndicator(reportID);
        getNewerActions(reportID, newestReportActionRef.current?.reportActionID);
    };

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
    const startPolling = () => {
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
                setPendingOptimisticRequests(0);
                return;
            }
            getNewerActions(reportID, currentNewestReportAction?.reportActionID);
        }, POLL_INTERVAL_MS);

        // Safety net: hard-clear after MAX_POLL_DURATION_MS
        pollSafetyTimerRef.current = setTimeout(() => {
            hardClearIndicator();
        }, MAX_POLL_DURATION_MS);
    };

    // On reconnect, proactively clear stale optimistic state + NVP and refetch missed actions.
    //
    // If the server processed the request and cleared the NVP while Pusher was disconnected,
    // Onyx sync can deliver the stale (uncleared) NVP on reconnect. Clearing the NVP locally
    // ensures we don't show a stuck indicator while we wait for polling to detect the reply.
    // If the server is still genuinely processing, its next Pusher/Onyx update will repopulate
    // the NVP and re-trigger the indicator + polling via the label-sync effect.
    const {isOffline} = useNetwork({
        onReconnect: () => {
            const wasOptimistic = pendingOptimisticRequests > 0;

            if (wasOptimistic) {
                setPendingOptimisticRequests(0);
                clearAgentZeroProcessingIndicator(reportID);
            }

            // Fetch missed actions so the Onyx-driven Concierge-reply detection can fire.
            getNewerActions(reportID, newestReportActionRef.current?.reportActionID);

            // Only restart polling if we still have a server-driven label after the clear —
            // otherwise there's nothing to poll for and the next serverLabel arrival will
            // restart polling via the label-sync effect below.
            if (serverLabel) {
                startPolling();
            }
        },
    });

    // Subscribe to ConciergeReasoningStore using useSyncExternalStore for correct
    // synchronization with React's render cycle. Both callbacks are memoized on reportID
    // so useSyncExternalStore doesn't unsubscribe/resubscribe on every render.
    const subscribeToReasoningStore = useCallback(
        (onStoreChange: () => void) => {
            const unsubscribe = ConciergeReasoningStore.subscribe((updatedReportID) => {
                if (updatedReportID !== reportID) {
                    return;
                }
                onStoreChange();
            });
            return unsubscribe;
        },
        [reportID],
    );
    const getReasoningSnapshot = useCallback(() => ConciergeReasoningStore.getReasoningHistory(reportID), [reportID]);
    const reasoningHistory = useSyncExternalStore(subscribeToReasoningStore, getReasoningSnapshot, getReasoningSnapshot);

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

    // Synchronize the displayed label with debounce and minimum display time.
    // displayedLabelRef mirrors state so the effect can check the current value without depending on displayedLabel.
    useEffect(() => {
        const hadServerLabel = !!prevServerLabelRef.current;
        const hasServerLabel = !!serverLabel;

        let targetLabel = '';
        if (hasServerLabel) {
            targetLabel = serverLabel ?? '';
        } else if (pendingOptimisticRequests > 0) {
            targetLabel = translate('common.thinking');
        }

        // Start/reset polling when server label arrives (acts as a lease renewal)
        if (hasServerLabel) {
            startPolling();
            if (pendingOptimisticRequests > 0) {
                setPendingOptimisticRequests(0);
            }
        }
        // Clear polling when processing ends
        else if (pendingOptimisticRequests === 0) {
            clearPolling();
            if (hadServerLabel && reasoningHistory.length > 0) {
                ConciergeReasoningStore.clearReasoning(reportID);
            }
        }

        // Use ref to check current value without depending on displayedLabel in deps
        if (displayedLabelRef.current === targetLabel) {
            prevServerLabelRef.current = serverLabel ?? '';
            return;
        }

        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        const remainingMinTime = Math.max(0, MIN_DISPLAY_TIME - timeSinceLastUpdate);

        if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
            updateTimerRef.current = null;
        }

        // Immediate update when enough time has passed or when clearing the label
        if (remainingMinTime === 0 || targetLabel === '') {
            displayedLabelRef.current = targetLabel;
            // eslint-disable-next-line react-hooks/set-state-in-effect -- guarded by displayedLabelRef check above; fires once per serverLabel/optimistic transition
            setDisplayedLabel(targetLabel);
            lastUpdateTimeRef.current = now;
        } else {
            // Schedule update after debounce + remaining min display time
            const delay = DEBOUNCE_DELAY + remainingMinTime;
            updateTimerRef.current = setTimeout(() => {
                displayedLabelRef.current = targetLabel;
                setDisplayedLabel(targetLabel);
                lastUpdateTimeRef.current = Date.now();
                updateTimerRef.current = null;
            }, delay);
        }

        prevServerLabelRef.current = serverLabel ?? '';

        return () => {
            if (!updateTimerRef.current) {
                return;
            }
            clearTimeout(updateTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- displayedLabelRef avoids depending on displayedLabel; startPolling/clearPolling use refs
    }, [serverLabel, reasoningHistory.length, reportID, pendingOptimisticRequests, translate]);

    useEffect(() => {
        isOfflineRef.current = isOffline;
    }, [isOffline]);

    // Clean up polling on unmount
    useEffect(
        () => () => {
            clearPolling();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const kickoffWaitingIndicator = () => {
        setPendingOptimisticRequests((prev) => prev + 1);
        startPolling();
    };

    // Capture the newest reportActionID as a baseline whenever the indicator transitions
    // from inactive to active (serverLabel or optimistic). The baseline survives offline
    // cycles (it tracks raw active state, not UI-visible isProcessing) so a new Concierge
    // reply that arrives during offline → online is still detected as "new" on reconnect.
    const isIndicatorActive = !!serverLabel || pendingOptimisticRequests > 0;
    useEffect(() => {
        if (isIndicatorActive && !wasIndicatorActiveRef.current) {
            indicatorBaselineActionIDRef.current = newestReportActionRef.current?.reportActionID ?? null;
        } else if (!isIndicatorActive) {
            indicatorBaselineActionIDRef.current = null;
        }
        wasIndicatorActiveRef.current = isIndicatorActive;
    }, [isIndicatorActive]);

    // Immediately clear the indicator when a *new* Concierge response arrives while processing.
    // In a Concierge DM, the newest action is usually already from Concierge (the previous reply),
    // so we only clear when the newest action ID is different from the baseline captured when
    // the indicator activated. This eliminates the 30s delay waiting for the next poll cycle.
    const newestActorAccountID = newestReportAction?.actorAccountID;
    const newestActionID = newestReportAction?.reportActionID;
    useEffect(() => {
        if (newestActorAccountID !== CONST.ACCOUNT_ID.CONCIERGE) {
            return;
        }
        if (!serverLabel && pendingOptimisticRequests === 0) {
            return;
        }
        if (!newestActionID || newestActionID === indicatorBaselineActionIDRef.current) {
            return;
        }
        clearAgentZeroProcessingIndicator(reportID);
        clearPolling();
        setPendingOptimisticRequests(0);
    }, [newestActorAccountID, newestActionID, serverLabel, pendingOptimisticRequests, reportID]);

    const isProcessing = !isOffline && isIndicatorActive;

    return {
        isProcessing,
        reasoningHistory,
        statusLabel: displayedLabel,
        kickoffWaitingIndicator,
    };
}

export default useAgentZeroStatusIndicator;
export type {AgentZeroStatusState};
