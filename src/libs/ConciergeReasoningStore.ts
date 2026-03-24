/**
 * Ephemeral in-memory store for managing Concierge reasoning summaries per report.
 * This data is transient UI feedback and is NOT persisted to Onyx.
 */

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

type Listener = (reportID: string, state: ReasoningEntry[]) => void;

// In-memory store
const store = new Map<string, ReportState>();
const listeners = new Set<Listener>();

/**
 * Notify all subscribers of state changes
 */
function notifyListeners(reportID: string, entries: ReasoningEntry[]) {
    for (const listener of listeners) {
        listener(reportID, entries);
    }
}

/**
 * Add a reasoning entry to a report's history.
 * If the agentZeroRequestID differs from the current state, resets all entries (new request).
 * Skips duplicates (same loopCount + same reasoning text).
 */
function addReasoning(reportID: string, data: ReasoningData) {
    // Ignore empty reasoning strings
    if (!data.reasoning.trim()) {
        return;
    }

    const currentState = store.get(reportID);

    // If agentZeroRequestID differs, reset all entries (new request)
    if (currentState && currentState.agentZeroRequestID !== data.agentZeroRequestID) {
        store.set(reportID, {
            agentZeroRequestID: data.agentZeroRequestID,
            entries: [],
        });
    }

    // Get or create state
    const state = store.get(reportID) ?? {
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
        store.set(reportID, newState);
        notifyListeners(reportID, newEntries);
    }
}

/**
 * Remove all reasoning entries for a report.
 * Called when the final Concierge message arrives or when unsubscribing.
 */
function clearReasoning(reportID: string) {
    store.delete(reportID);
    notifyListeners(reportID, []);
}

/**
 * Get the reasoning history for a report
 */
function getReasoningHistory(reportID: string): ReasoningEntry[] {
    return store.get(reportID)?.entries ?? [];
}

/**
 * Subscribe to state changes.
 * Listener receives (reportID, state) on every change.
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
    getReasoningHistory,
    subscribe,
};

export type {ReasoningEntry, ReasoningData};
