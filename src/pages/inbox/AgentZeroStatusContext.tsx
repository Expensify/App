import {agentZeroProcessingIndicatorSelector} from '@selectors/ReportNameValuePairs';
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSidePanelState from '@hooks/useSidePanelState';
import {getReportChannelName} from '@libs/actions/Report';
import Log from '@libs/Log';
import Pusher from '@libs/Pusher';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';

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

    /** When true, thinking bubble and typing indicator should be hidden (side-panel welcome state before user sends a message) */
    shouldSuppressIndicators: boolean;
};

type AgentZeroStatusActions = {
    /** Sets optimistic "thinking" state immediately after the user sends a message, before the server responds */
    kickoffWaitingIndicator: () => void;
};

const defaultState: AgentZeroStatusState = {
    isProcessing: false,
    reasoningHistory: [],
    statusLabel: '',
    shouldSuppressIndicators: false,
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
function AgentZeroStatusProvider({reportID, chatType, children}: React.PropsWithChildren<{reportID: string | undefined; chatType: ValueOf<typeof CONST.REPORT.CHAT_TYPE> | undefined}>) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeChat = reportID === conciergeReportID;
    const isAdmin = chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
    const isAgentZeroChat = isConciergeChat || isAdmin;

    if (!reportID || !isAgentZeroChat) {
        return children;
    }

    return <AgentZeroStatusGate reportID={reportID}>{children}</AgentZeroStatusGate>;
}

/**
 * Inner gate — all Pusher, reasoning, label, and processing state.
 * Only mounted when reportID matches the Concierge report.
 */
function AgentZeroStatusGate({reportID, children}: React.PropsWithChildren<{reportID: string}>) {
    // Server-driven processing label from report name-value pairs (e.g. "Looking up categories...")
    const [serverLabel] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: agentZeroProcessingIndicatorSelector});

    // Side-panel suppression: hide thinking/typing indicators until the user sends a message in this session
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime} = useSidePanelState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const hasUserSentMessageSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !isInSidePanel || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
    };
    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector -- React Compiler handles memoization
    const [hasUserSentMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasUserSentMessageSelector,
    });

    // Timestamp set when the user sends a message, before the server label arrives — shows "Concierge is thinking..."
    const [optimisticStartTime, setOptimisticStartTime] = useState<number | null>(null);
    // Debounced label shown to the user — smooths rapid server label changes
    const [displayedLabel, setDisplayedLabel] = useState<string>('');
    // Chronological list of reasoning steps streamed via Pusher during a single processing request
    const [reasoningHistory, setReasoningHistory] = useState<ReasoningEntry[]>([]);
    const {translate} = useLocalize();
    // Tracks the previous server label to detect transitions (appeared → cleared)
    const prevServerLabelRef = useRef<string>(serverLabel);
    // Timer for debounced label updates — ensures a minimum display time before switching
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Timestamp of the last label update — used to enforce MIN_DISPLAY_TIME
    const lastUpdateTimeRef = useRef<number>(0);
    const {isOffline} = useNetwork();

    // Tracks the current agentZeroRequestID so the Pusher callback can detect new requests
    const agentZeroRequestIDRef = useRef('');

    // Minimum time to display a label before allowing change (prevents rapid flicker)
    const MIN_DISPLAY_TIME = 300; // ms
    // Debounce delay for server label updates
    const DEBOUNCE_DELAY = 150; // ms

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

    // Reset all transient state when the viewed report changes
    useEffect(() => {
        setOptimisticStartTime(null);
        setReasoningHistory([]);
        agentZeroRequestIDRef.current = '';
    }, [reportID]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- addReasoning is stable (uses only refs + functional updater)
    }, [reportID]);

    // Synchronize the displayed label with the server label, applying debounce and minimum display time
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

        // When server label arrives, transition smoothly without flicker
        if (hasServerLabel) {
            updateLabel(serverLabel);
            if (optimisticStartTime) {
                setOptimisticStartTime(null);
            }
        }
        // When optimistic state is active but no server label, show "Concierge is thinking..."
        else if (optimisticStartTime) {
            const thinkingLabel = translate('common.thinking');
            updateLabel(thinkingLabel);
        }
        // Clear everything when processing ends
        else if (hadServerLabel && !hasServerLabel) {
            updateLabel('');
            if (reasoningHistory.length > 0) {
                setReasoningHistory([]);
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

    // Clear optimistic state when the network comes back online
    useEffect(() => {
        if (isOffline) {
            return;
        }
        setOptimisticStartTime(null);
    }, [isOffline, reportID]);

    const kickoffWaitingIndicator = () => {
        setOptimisticStartTime(Date.now());
    };

    const isProcessing = !isOffline && (!!serverLabel || !!optimisticStartTime);
    const shouldSuppressIndicators = isInSidePanel && !hasUserSentMessage;

    // eslint-disable-next-line react/jsx-no-constructed-context-values -- React Compiler handles memoization
    const stateValue: AgentZeroStatusState = {
        isProcessing,
        reasoningHistory,
        statusLabel: displayedLabel,
        shouldSuppressIndicators,
    };

    // eslint-disable-next-line react/jsx-no-constructed-context-values -- React Compiler handles memoization
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
