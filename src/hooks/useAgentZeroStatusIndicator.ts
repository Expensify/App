import agentZeroProcessingIndicatorSelector from '@selectors/ReportNameValuePairs';
import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {clearAgentZeroProcessingIndicator, getNewerActions, subscribeToReportReasoningEvents, unsubscribeFromReportReasoningChannel} from '@libs/actions/Report';
import AgentZeroOptimisticStore, {MAX_AGE_MS as OPTIMISTIC_MAX_AGE_MS} from '@libs/AgentZeroOptimisticStore';
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
 * Maximum duration the indicator stays active before we hard-clear it as a safety net.
 *
 * Recovery for missed Pusher events relies on Pusher's own reconnect-and-replay buffer
 * (most cases) plus the one-shot `getNewerActions` fetch fired by `useNetwork` on HTTP
 * reconnect. If neither delivers within this window, the safety timeout clears the
 * stuck local state.
 *
 * Shared with `AgentZeroOptimisticStore` so the cross-mount remaining window stays
 * consistent — a remount mid-thinking resumes the same cap from the original kickoff.
 */
const MAX_INDICATOR_DURATION_MS = OPTIMISTIC_MAX_AGE_MS;

// Minimum time to display a label before allowing change (prevents rapid flicker)
const MIN_DISPLAY_TIME = 300; // ms
// Debounce delay for server label updates
const DEBOUNCE_DELAY = 150; // ms

/**
 * Selector that extracts the newest report action ID and actor from the report actions collection.
 *
 * Sorts by `created` timestamp (ISO strings compare chronologically), with reportActionID as a
 * tiebreaker. reportActionID alone is unreliable because optimistic actions use random IDs, so
 * a purely numeric comparison can rank them ahead of real server actions.
 */
function selectNewestReportAction(reportActions: OnyxEntry<ReportActions>): NewestReportAction | undefined {
    if (!reportActions) {
        return undefined;
    }
    const actions = Object.values(reportActions).filter(Boolean);
    if (actions.length === 0) {
        return undefined;
    }
    const newest = actions.reduce((a, b) => {
        const createdA = a.created ?? '';
        const createdB = b.created ?? '';
        if (createdA !== createdB) {
            return createdA > createdB ? a : b;
        }
        return a.reportActionID > b.reportActionID ? a : b;
    });
    return {
        reportActionID: newest.reportActionID,
        actorAccountID: newest.actorAccountID,
    };
}

/**
 * Hook to manage AgentZero status indicator for chats where AgentZero responds.
 *
 * Callers must gate this hook at the mount level (only mount for AgentZero-enabled chats:
 * Concierge DMs or policy #admins rooms). The outer `AgentZeroStatusProvider` already
 * enforces this, so the hook assumes it's always running for an AgentZero chat.
 *
 * @param reportID - The report ID to monitor
 */
function useAgentZeroStatusIndicator(reportID: string): AgentZeroStatusState {
    // Server-driven processing label from report name-value pairs (e.g. "Looking up categories...")
    // Uses selector to only re-render when the specific field changes, not on any NVP change.
    const [serverLabel] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: agentZeroProcessingIndicatorSelector});

    // Track the newest report action so we can fetch missed actions and detect actual Concierge replies.
    const [newestReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: selectNewestReportAction});
    const newestReportActionRef = useRef<NewestReportAction | undefined>(newestReportAction);
    useEffect(() => {
        newestReportActionRef.current = newestReportAction;
    }, [newestReportAction]);

    // Track pending optimistic requests with a counter, backed by a module-level store so
    // the state survives ReportScreen remounts (switching chats and coming back). Each
    // kickoffWaitingIndicator() call increments the counter; when a Concierge reply is
    // detected (via Pusher, reconnect, or safety timeout), the entry is cleared — any
    // signal that a response arrived resolves all pending requests (optimistic state is
    // a display signal, not a queue).
    const subscribeToOptimisticStore = (onStoreChange: () => void) =>
        AgentZeroOptimisticStore.subscribe((updatedReportID) => {
            if (updatedReportID !== reportID) {
                return;
            }
            onStoreChange();
        });
    const getOptimisticSnapshot = () => AgentZeroOptimisticStore.getEntry(reportID);
    const optimisticEntry = useSyncExternalStore(subscribeToOptimisticStore, getOptimisticSnapshot, getOptimisticSnapshot);
    const pendingOptimisticRequests = optimisticEntry?.count ?? 0;
    // Debounced label shown to the user — smooths rapid server label changes.
    // displayedLabelRef mirrors state so the label-sync effect can read the current value
    // without including displayedLabel in its dependency array (avoids extra effect cycles).
    const displayedLabelRef = useRef<string>('');
    const [displayedLabel, setDisplayedLabel] = useState<string>('');
    const {translate} = useLocalize();
    const prevServerLabelRef = useRef<string>(serverLabel ?? '');
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isOfflineRef = useRef<boolean>(false);
    // Newest reportActionID at the moment the indicator became active (raw state, ignoring
    // offline). Lets us distinguish "a pre-existing Concierge action was already the newest"
    // (common in Concierge DMs, where the previous reply is still the latest action) from
    // "a new Concierge reply arrived after the indicator started." Without this, sending a
    // message in a Concierge DM would immediately clear the just-activated indicator.
    //
    // Seeded from the optimistic store so a remount mid-thinking (chat switch) restores the
    // original baseline instead of capturing the current newest action — otherwise a reply
    // that landed while the provider was unmounted would be adopted as the baseline and go
    // undetected. `initialRestoredEntry` is read on every render (cheap Map lookup), but the
    // refs only consume the first-render value.
    const initialRestoredEntry = AgentZeroOptimisticStore.getEntry(reportID);
    const restoredOptimisticOnMountRef = useRef<ReturnType<typeof AgentZeroOptimisticStore.getEntry>>(initialRestoredEntry);
    const indicatorBaselineActionIDRef = useRef<string | null>(initialRestoredEntry?.baselineActionID ?? null);
    const wasIndicatorActiveRef = useRef<boolean>(!!initialRestoredEntry);

    /**
     * Clear the safety timer. Called when the indicator clears normally, when a new
     * processing cycle starts (renewing the cap), or when the component unmounts.
     *
     * Kept in useCallback because it's referenced in several useEffect dep arrays below. The
     * react-compiler-compat ESLint processor (which would otherwise suppress the exhaustive-deps
     * false positive) only runs on .tsx/.jsx files, not .ts.
     */
    const clearSafetyTimer = useCallback(() => {
        if (!safetyTimerRef.current) {
            return;
        }
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
    }, []);

    /**
     * Hard-clear the indicator by resetting local state and clearing the Onyx NVP.
     * Called as a safety net after MAX_INDICATOR_DURATION_MS if no response has arrived.
     */
    const hardClearIndicator = useCallback(() => {
        // If offline, don't clear — the response may arrive when reconnected
        if (isOfflineRef.current) {
            return;
        }
        clearSafetyTimer();
        AgentZeroOptimisticStore.clear(reportID);
        displayedLabelRef.current = '';
        setDisplayedLabel('');
        clearAgentZeroProcessingIndicator(reportID);
        getNewerActions(reportID, newestReportActionRef.current?.reportActionID);
    }, [clearSafetyTimer, reportID]);

    /**
     * (Re)arm the safety timer. Called when processing becomes active or the server label
     * changes (renewing the cap). The timer fires `hardClearIndicator` after
     * `safetyDurationMs` if nothing has cleared the indicator by then.
     *
     * Recovery itself is delegated upstream: Pusher's own reconnect-and-replay buffer
     * delivers missed events on most drops, and `useNetwork().onReconnect` fires a
     * one-shot `getNewerActions` on HTTP reconnect. The safety timer is the backstop
     * for the long tail.
     */
    const startSafetyTimer = useCallback(
        (safetyDurationMs: number = MAX_INDICATOR_DURATION_MS) => {
            clearSafetyTimer();

            if (safetyDurationMs <= 0) {
                // Entry is already past the safety window (e.g. remount after >2 min) —
                // hard-clear immediately rather than rearming a timer that would fire at zero.
                hardClearIndicator();
                return;
            }

            safetyTimerRef.current = setTimeout(() => {
                hardClearIndicator();
            }, safetyDurationMs);
        },
        [clearSafetyTimer, hardClearIndicator],
    );

    // On reconnect, defensively clear any stale NVP, refetch missed actions, and rearm the
    // safety timer so the cap measures from reconnect rather than the original kickoff.
    //
    // If the server SET+CLEARED the NVP while Pusher was disconnected, Onyx sync can deliver
    // only the stale SET on reconnect. Clearing the NVP locally when we were optimistic-only
    // prevents a stuck label.
    const {isOffline} = useNetwork({
        onReconnect: () => {
            const wasOptimistic = pendingOptimisticRequests > 0;

            if (wasOptimistic) {
                clearAgentZeroProcessingIndicator(reportID);
            }

            // Fetch missed actions so the Onyx-driven Concierge-reply detection can fire.
            getNewerActions(reportID, newestReportActionRef.current?.reportActionID);

            if (serverLabel || wasOptimistic) {
                startSafetyTimer();
            }
        },
    });

    // Subscribe to ConciergeReasoningStore using useSyncExternalStore for correct
    // synchronization with React's render cycle. React Compiler memoizes these closures
    // based on reportID, so useSyncExternalStore doesn't unsubscribe/resubscribe on every render.
    const subscribeToReasoningStore = (onStoreChange: () => void) => {
        const unsubscribe = ConciergeReasoningStore.subscribe((updatedReportID) => {
            if (updatedReportID !== reportID) {
                return;
            }
            onStoreChange();
        });
        return unsubscribe;
    };
    const getReasoningSnapshot = () => ConciergeReasoningStore.getReasoningHistory(reportID);
    const reasoningHistory = useSyncExternalStore(subscribeToReasoningStore, getReasoningSnapshot, getReasoningSnapshot);

    useEffect(() => {
        subscribeToReportReasoningEvents(reportID);

        // Cleanup: unsubscribeFromReportReasoningChannel handles Pusher unsubscribing,
        // clearing reasoning history from ConciergeReasoningStore, and subscription tracking
        return () => {
            unsubscribeFromReportReasoningChannel(reportID);
        };
    }, [reportID]);

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

        // Rearm the safety timer when server label arrives (acts as a lease renewal). Keep
        // the optimistic store entry alive — the server NVP can briefly go truthy→falsy→truthy
        // between processing phases (e.g., "thinking..." → (gap) → "searching documentation..."),
        // and clearing the optimistic floor here means a chat-switch during the gap lands on
        // "no optimistic, no serverLabel → no indicator." The optimistic entry is cleared by
        // authoritative signals only: the reply-detection effect (new Concierge action newer
        // than baseline), the 120s safety timeout, or the onReconnect handler.
        if (hasServerLabel) {
            startSafetyTimer();
        }
        // Clear the safety timer when processing ends
        else if (pendingOptimisticRequests === 0) {
            clearSafetyTimer();
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
    }, [serverLabel, reasoningHistory.length, reportID, pendingOptimisticRequests, translate, startSafetyTimer, clearSafetyTimer]);

    useEffect(() => {
        isOfflineRef.current = isOffline;
    }, [isOffline]);

    // Clean up safety timer on unmount (and if clearSafetyTimer identity changes — no-op
    // when no timer).
    useEffect(
        () => () => {
            clearSafetyTimer();
        },
        [clearSafetyTimer],
    );

    // If we restored optimistic state from a previous mount (e.g. user switched chats and
    // came back mid-thinking), rearm the safety timer with whatever time remains on the
    // window. If a server label is also present on mount, the label-sync effect runs in
    // the same commit and rearms with a fresh window — `startSafetyTimer` clears any
    // prior timer, so that restart wins naturally.
    //
    // `startSafetyTimer` is stable for the lifetime of the mount (no reportID dep), so
    // this effect runs once per mount and doesn't re-fire on unrelated renders.
    useEffect(() => {
        const restored = restoredOptimisticOnMountRef.current;
        if (!restored) {
            return;
        }
        const elapsed = Date.now() - restored.startedAt;
        const remaining = MAX_INDICATOR_DURATION_MS - elapsed;
        startSafetyTimer(remaining);
    }, [startSafetyTimer]);

    const kickoffWaitingIndicator = () => {
        AgentZeroOptimisticStore.increment(reportID, newestReportActionRef.current?.reportActionID ?? null);
        startSafetyTimer();
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

    // Clear the indicator when Concierge has *actually completed* processing. A newer
    // Concierge action alone isn't enough: during processing, Concierge can post
    // intermediate actions (reasoning dumps, status updates) that aren't the final reply,
    // and clearing on those makes the indicator flicker away mid-stream. Only treat the
    // combination as the real "done" signal: a new Concierge action *and* the server has
    // cleared its NVP (serverLabel falsy). Safety nets for server-side misses:
    //   - 120s safety timeout (hardClearIndicator) catches a stuck optimistic entry.
    //   - onReconnect defensively clears the NVP when optimistic-only.
    const newestActorAccountID = newestReportAction?.actorAccountID;
    const newestActionID = newestReportAction?.reportActionID;
    useEffect(() => {
        if (newestActorAccountID !== CONST.ACCOUNT_ID.CONCIERGE) {
            return;
        }
        if (pendingOptimisticRequests === 0 && !serverLabel) {
            return;
        }
        if (!newestActionID || newestActionID === indicatorBaselineActionIDRef.current) {
            return;
        }
        // Server hasn't signaled done yet — this is an intermediate Concierge action, not
        // the final reply. Wait for the NVP to clear before tearing everything down.
        if (serverLabel) {
            return;
        }
        clearAgentZeroProcessingIndicator(reportID);
        clearSafetyTimer();
        AgentZeroOptimisticStore.clear(reportID);
    }, [newestActorAccountID, newestActionID, serverLabel, pendingOptimisticRequests, reportID, clearSafetyTimer]);

    const isProcessing = !isOffline && isIndicatorActive;

    return {
        isProcessing,
        reasoningHistory,
        statusLabel: displayedLabel,
        kickoffWaitingIndicator,
    };
}

export default useAgentZeroStatusIndicator;
