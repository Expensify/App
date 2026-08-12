/**
 * Ephemeral in-memory store for managing agent reasoning summaries, keyed by `(reportID,
 * agentAccountID)` so each agent in a room keeps its own reasoning history. This data is
 * transient UI feedback and is NOT persisted to Onyx.
 */
import getAgentStoreKey from './AgentZeroStoreUtils';

type ReasoningEntry = {
    reasoning: string;
    loopCount: number;
    timestamp: number;
};

type ReasoningData = {
    reasoning: string;
    agentZeroRequestID: string;
    loopCount: number;
};

type ReportState = {
    agentZeroRequestID: string;
    entries: ReasoningEntry[];
};

type Listener = (reportID: string, agentAccountID: number, state: ReasoningEntry[]) => void;

// In-memory store, keyed by `${reportID}:${agentAccountID}`.
const store = new Map<string, ReportState>();
const listeners = new Set<Listener>();

// Stable empty array reference for useSyncExternalStore compatibility.
// getSnapshot must return the same reference when data hasn't changed,
// otherwise React will re-render infinitely.
const EMPTY_ENTRIES: ReasoningEntry[] = [];

/**
 * Notify all subscribers of state changes
 */
function notifyListeners(reportID: string, agentAccountID: number, entries: ReasoningEntry[]) {
    for (const listener of listeners) {
        listener(reportID, agentAccountID, entries);
    }
}

/**
 * Add a reasoning entry to an agent's history within a report.
 * If the agentZeroRequestID differs from the current state, resets all entries (new request).
 * Skips duplicates (same loopCount + same reasoning text).
 */
function addReasoning(reportID: string, agentAccountID: number, data: ReasoningData) {
    // Ignore empty reasoning strings
    if (!data.reasoning.trim()) {
        return;
    }

    const key = getAgentStoreKey(reportID, agentAccountID);
    const currentState = store.get(key);

    // If agentZeroRequestID differs, reset all entries (new request)
    if (currentState && currentState.agentZeroRequestID !== data.agentZeroRequestID) {
        store.set(key, {
            agentZeroRequestID: data.agentZeroRequestID,
            entries: [],
        });
    }

    // Get or create state
    const state = store.get(key) ?? {
        agentZeroRequestID: data.agentZeroRequestID,
        entries: [],
    };

    // Skip duplicates (same loopCount + same reasoning text)
    const isDuplicate = state.entries.some((entry) => entry.loopCount === data.loopCount && entry.reasoning === data.reasoning);

    if (!isDuplicate) {
        const timestamp = Date.now();
        const newEntries = [
            ...state.entries,
            {
                reasoning: data.reasoning,
                loopCount: data.loopCount,
                timestamp,
            },
        ];
        const newState = {
            agentZeroRequestID: state.agentZeroRequestID,
            entries: newEntries,
        };
        store.set(key, newState);
        notifyListeners(reportID, agentAccountID, newEntries);
    }
}

/**
 * Remove all reasoning entries for an agent in a report.
 * Called when that agent's final message arrives.
 */
function clearReasoning(reportID: string, agentAccountID: number) {
    store.delete(getAgentStoreKey(reportID, agentAccountID));
    notifyListeners(reportID, agentAccountID, []);
}

/**
 * Remove reasoning entries for every agent in a report. Called when unsubscribing from the
 * report's reasoning channel (the report is no longer open).
 */
function clearReportReasoning(reportID: string) {
    const prefix = `${reportID}:`;
    for (const key of store.keys()) {
        if (!key.startsWith(prefix)) {
            continue;
        }
        store.delete(key);
        notifyListeners(reportID, Number(key.slice(prefix.length)), []);
    }
}

/**
 * Get the reasoning history for an agent in a report
 */
function getReasoningHistory(reportID: string, agentAccountID: number): ReasoningEntry[] {
    return store.get(getAgentStoreKey(reportID, agentAccountID))?.entries ?? EMPTY_ENTRIES;
}

/**
 * Subscribe to state changes.
 * Listener receives (reportID, agentAccountID, state) on every change.
 * Returns an unsubscribe function.
 */
function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export default {
    addReasoning,
    clearReasoning,
    clearReportReasoning,
    getReasoningHistory,
    subscribe,
};

export type {ReasoningEntry};
