import {getReportChatType} from '@selectors/Report';
import agentZeroProcessingIndicatorSelector from '@selectors/ReportNameValuePairs';
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {getReportChannelName} from '@libs/actions/Report';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ReasoningEntry = {
    reasoning: string;
    loopCount: number;
    timestamp: number;
};

type AgentZeroStatusState = {
    /** Whether AgentZero is actively working — true when the server sent a processing label or we're optimistically waiting */
    isProcessing: boolean;

    /** Chronological list of reasoning steps streamed via Pusher during the current processing request */
    reasoningHistory: ReasoningEntry[];

    /** Debounced label shown in the thinking bubble (e.g. "Looking up categories...") */
    statusLabel: string;
};

type AgentZeroStatusActions = {
    /** Sets optimistic "thinking" state immediately after the user sends a message, before the server responds */
    kickoffWaitingIndicator: () => void;
};

const defaultState: AgentZeroStatusState = {
    isProcessing: false,
    reasoningHistory: [],
    statusLabel: '',
};

const defaultActions: AgentZeroStatusActions = {
    kickoffWaitingIndicator: () => {},
};

const AgentZeroStatusStateContext = createContext<AgentZeroStatusState>(defaultState);
const AgentZeroStatusActionsContext = createContext<AgentZeroStatusActions>(defaultActions);

/**
 * Cheap outer guard — only subscribes to the scalar CONCIERGE_REPORT_ID.
 * For non-AgentZero reports (the common case), returns children directly
 * without mounting any Pusher subscriptions or heavy state logic.
 *
 * AgentZero chats include Concierge DMs and policy #admins rooms.
 */
function AgentZeroStatusProvider({reportID, children}: React.PropsWithChildren<{reportID: string | undefined}>) {
    const [chatType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportChatType});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    const isAgentZeroChat = isConciergeChat || isAdmin;

    if (!reportID || !isAgentZeroChat) {
        return children;
    }

    return (
        <AgentZeroStatusGate
            key={reportID}
            reportID={reportID}
        >
            {children}
        </AgentZeroStatusGate>
    );
}

// Minimum time to display a label before allowing change (prevents rapid flicker)
const MIN_DISPLAY_TIME = 300; // ms
// Debounce delay for server label updates
const DEBOUNCE_DELAY = 150; // ms
const OPTIMISTIC_TIMEOUT = 120000; // 2 minutes

/**
 * Inner gate — all Pusher, reasoning, label, and processing state.
 * Only mounted when reportID matches the Concierge report.
 * Remounted via key prop when reportID changes, so all state resets automatically.
 */
function AgentZeroStatusGate({reportID, children}: React.PropsWithChildren<{reportID: string}>) {
    // Server-driven processing label from report name-value pairs (e.g. "Looking up categories...")
    const [serverLabel] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: agentZeroProcessingIndicatorSelector});

    // Timestamp set when the user sends a message, before the server label arrives — shows "Concierge is thinking..."
    const [optimisticStartTime, setOptimisticStartTime] = useState<number | null>(null);
    // Debounced label shown to the user — smooths rapid server label changes
    const displayedLabelRef = useRef<string>('');
    const [displayedLabel, setDisplayedLabel] = useState<string>('');
    // Chronological list of reasoning steps streamed via Pusher during a single processing request
    const [reasoningHistory, setReasoningHistory] = useState<ReasoningEntry[]>([]);
    const {translate} = useLocalize();
    // Timer for debounced label updates — ensures a minimum display time before switching
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Timestamp of the last label update — used to enforce MIN_DISPLAY_TIME
    const lastUpdateTimeRef = useRef<number>(0);
    const {isOffline} = useNetwork();

    // Tracks the current agentZeroRequestID so the Pusher callback can detect new requests
    const agentZeroRequestIDRef = useRef('');

    // Clear optimistic state once server label arrives — the server has taken over
    if (serverLabel && optimisticStartTime) {
        setOptimisticStartTime(null);
    }

    // Clear optimistic state when coming back online — stale optimism from offline
    const [prevIsOffline, setPrevIsOffline] = useState(isOffline);
    if (prevIsOffline !== isOffline) {
        setPrevIsOffline(isOffline);
        if (!isOffline && optimisticStartTime) {
            setOptimisticStartTime(null);
        }
    }

    // Clear reasoning when processing ends (server label transitions from truthy → falsy)
    const [prevServerLabel, setPrevServerLabel] = useState(serverLabel);
    if (prevServerLabel !== serverLabel) {
        setPrevServerLabel(serverLabel);
        if (prevServerLabel && !serverLabel && reasoningHistory.length > 0) {
            setReasoningHistory([]);
        }
    }

    /** Appends a reasoning entry from Pusher. Resets history when a new request ID is detected; skips duplicates. */
    const addReasoning = (data: {reasoning: string; agentZeroRequestID: string; loopCount: number}) => {
        if (!data.reasoning.trim()) {
            return;
        }

        const isNewRequest = agentZeroRequestIDRef.current !== data.agentZeroRequestID;
        if (isNewRequest) {
            agentZeroRequestIDRef.current = data.agentZeroRequestID;
        }

        const entry: ReasoningEntry = {
            reasoning: data.reasoning,
            loopCount: data.loopCount,
            timestamp: Date.now(),
        };

        if (isNewRequest) {
            setReasoningHistory([entry]);
            return;
        }

        setReasoningHistory((prev) => {
            const isDuplicate = prev.some((e) => e.loopCount === data.loopCount && e.reasoning === data.reasoning);
            if (isDuplicate) {
                return prev;
            }
            return [...prev, entry];
        });
    };

    // Subscribe to Pusher reasoning events for this report's channel
    useEffect(() => {
        const channelName = getReportChannelName(reportID);

        const listener = Pusher.subscribe(channelName, Pusher.TYPE.CONCIERGE_REASONING, (data: Record<string, unknown>) => {
            const eventData = data as {reasoning: string; agentZeroRequestID: string; loopCount: number};
            addReasoning(eventData);
        });
        listener.catch((error: unknown) => {
            Log.hmmm('[AgentZeroStatusGate] Failed to subscribe to Pusher concierge reasoning events', {reportID, error});
        });

        return () => {
            listener.unsubscribe();
        };
    }, [reportID, addReasoning]);

    // Synchronize the displayed label with debounce and minimum display time.
    // displayedLabelRef mirrors state so the effect can check the current value without depending on displayedLabel.
    useEffect(() => {
        let targetLabel = '';
        if (serverLabel) {
            targetLabel = serverLabel;
        } else if (optimisticStartTime) {
            targetLabel = translate('common.thinking');
        }

        if (displayedLabelRef.current === targetLabel) {
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

        return () => {
            if (!updateTimerRef.current) {
                return;
            }
            clearTimeout(updateTimerRef.current);
        };
    }, [serverLabel, optimisticStartTime, translate]);

    // Pusher updates carrying the server label can be silently dropped, leaving the optimistic indicator stuck forever.
    useEffect(() => {
        if (!optimisticStartTime) {
            return;
        }
        const elapsed = Date.now() - optimisticStartTime;
        const remaining = Math.max(0, OPTIMISTIC_TIMEOUT - elapsed);
        const timer = setTimeout(() => {
            setOptimisticStartTime(null);
        }, remaining);
        return () => clearTimeout(timer);
    }, [optimisticStartTime]);

    const kickoffWaitingIndicator = () => {
        setOptimisticStartTime(Date.now());
    };

    // True when AgentZero is actively working — either the server sent a label or we're optimistically waiting
    const isProcessing = !isOffline && (!!serverLabel || !!optimisticStartTime);

    const stateValue: AgentZeroStatusState = {
        isProcessing,
        reasoningHistory,
        statusLabel: displayedLabel,
    };

    const actionsValue: AgentZeroStatusActions = {
        kickoffWaitingIndicator,
    };

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
export type {AgentZeroStatusState, AgentZeroStatusActions, ReasoningEntry};
