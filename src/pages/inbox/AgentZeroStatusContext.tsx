import {getReportChatType} from '@selectors/Report';
import agentZeroProcessingIndicatorSelector from '@selectors/ReportNameValuePairs';
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
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
    /** Whether AgentZero is actively working — true when the server has sent a processing label */
    isProcessing: boolean;

    /** Chronological list of reasoning steps streamed via Pusher during the current processing request */
    reasoningHistory: ReasoningEntry[];

    /** Debounced label shown in the thinking bubble (e.g. "Looking up categories...") */
    statusLabel: string;
};

const defaultState: AgentZeroStatusState = {
    isProcessing: false,
    reasoningHistory: [],
    statusLabel: '',
};

const AgentZeroStatusStateContext = createContext<AgentZeroStatusState>(defaultState);

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

/**
 * Inner gate — all Pusher, reasoning, and label state.
 * Only mounted for AgentZero chats (Concierge DMs or policy #admins rooms).
 * Remounted via key prop when reportID changes, so all state resets automatically.
 */
function AgentZeroStatusGate({reportID, children}: React.PropsWithChildren<{reportID: string}>) {
    // Server-driven processing label from report name-value pairs (e.g. "Looking up categories...")
    // Backend only writes this when AgentZero is actually handling the chat — the client no longer
    // sets an optimistic label on send, so if AZ short-circuits (chat job exists, human responded
    // within R2LR_TIME) nothing renders.
    const [serverLabel] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: agentZeroProcessingIndicatorSelector});

    // Debounced label shown to the user — smooths rapid server label changes
    const displayedLabelRef = useRef<string>('');
    const [displayedLabel, setDisplayedLabel] = useState<string>('');
    // Chronological list of reasoning steps streamed via Pusher during a single processing request
    const [reasoningHistory, setReasoningHistory] = useState<ReasoningEntry[]>([]);
    // Timer for debounced label updates — ensures a minimum display time before switching
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Timestamp of the last label update — used to enforce MIN_DISPLAY_TIME
    const lastUpdateTimeRef = useRef<number>(0);
    const {isOffline} = useNetwork();

    // Tracks the current agentZeroRequestID so the Pusher callback can detect new requests
    const agentZeroRequestIDRef = useRef('');

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
        const targetLabel = serverLabel ?? '';

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
    }, [serverLabel]);

    // True when AgentZero is actively working — the server has sent a label
    const isProcessing = !isOffline && !!serverLabel;

    const stateValue: AgentZeroStatusState = {
        isProcessing,
        reasoningHistory,
        statusLabel: displayedLabel,
    };

    return <AgentZeroStatusStateContext.Provider value={stateValue}>{children}</AgentZeroStatusStateContext.Provider>;
}

function useAgentZeroStatus(): AgentZeroStatusState {
    return useContext(AgentZeroStatusStateContext);
}

export {AgentZeroStatusProvider, useAgentZeroStatus};
export type {AgentZeroStatusState, ReasoningEntry};
