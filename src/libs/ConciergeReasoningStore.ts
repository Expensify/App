/**
 * Ephemeral store for Concierge reasoning summaries.
 * This data is NOT persisted to Onyx - it's fire-and-forget for temporary UI feedback.
 */

type ReasoningEntry = {
    reasoning: string;
    loopCount: number;
    timestamp: number;
};

type ReportReasoningState = {
    agentZeroRequestID: string;
    entries: ReasoningEntry[];
};

type ReasoningEventData = {
    reasoning: string;
    agentZeroRequestID: string;
    loopCount: number;
};

type Listener = (reportID: string, state: ReportReasoningState | undefined) => void;

const reasoningByReport: Map<string, ReportReasoningState> = new Map();
const listeners: Set<Listener> = new Set();

function notifyListeners(reportID: string) {
    const state = reasoningByReport.get(reportID);
    listeners.forEach((listener) => listener(reportID, state));
}

/**
 * Add a reasoning entry for a report.
 * If the agentZeroRequestID changes, clears previous entries.
 * Ignores entries with loopCount <= last recorded loopCount.
 */
function addReasoning(reportID: string, data: ReasoningEventData): void {
    const {reasoning, agentZeroRequestID, loopCount} = data;

    if (!reasoning) {
        return;
    }

    const existing = reasoningByReport.get(reportID);

    // If this is a new request, reset the state
    if (!existing || existing.agentZeroRequestID !== agentZeroRequestID) {
        reasoningByReport.set(reportID, {
            agentZeroRequestID,
            entries: [{reasoning, loopCount, timestamp: Date.now()}],
        });
        notifyListeners(reportID);
        return;
    }

    // Check if we already have a reasoning for this loop count or higher
    const lastEntry = existing.entries.at(-1);
    if (lastEntry && loopCount <= lastEntry.loopCount) {
        return;
    }

    // Append the new reasoning
    existing.entries.push({reasoning, loopCount, timestamp: Date.now()});
    notifyListeners(reportID);
}

/**
 * Clear all reasoning entries for a report.
 * Called when the final Concierge message arrives.
 */
function clearReasoning(reportID: string): void {
    if (reasoningByReport.has(reportID)) {
        reasoningByReport.delete(reportID);
        notifyListeners(reportID);
    }
}

/**
 * Get the current reasoning state for a report.
 */
function getReasoningState(reportID: string): ReportReasoningState | undefined {
    return reasoningByReport.get(reportID);
}

/**
 * Get all reasoning entries for a report as a formatted array.
 */
function getReasoningHistory(reportID: string): string[] {
    const state = reasoningByReport.get(reportID);
    if (!state) {
        return [];
    }
    return state.entries.map((entry) => entry.reasoning);
}

/**
 * Subscribe to reasoning state changes for all reports.
 * Returns an unsubscribe function.
 */
function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export {addReasoning, clearReasoning, getReasoningState, getReasoningHistory, subscribe};
export type {ReasoningEventData, ReportReasoningState, ReasoningEntry};
