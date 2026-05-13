/**
 * Ephemeral in-memory store for the optimistic "Concierge is thinking…" state per report.
 *
 * The optimistic counter has to survive ReportScreen remounts (switching chats and coming
 * back) — React state scoped to the mounted provider doesn't. This store holds it at the
 * module level, keyed by reportID, so the next mount can restore the indicator.
 *
 * Transient by nature: cleared on reply detection, safety timeout, reconnect, or by the
 * caller. Not persisted to Onyx.
 */

/** Upper bound on how long an optimistic entry stays valid without a server label or reply. */
const MAX_AGE_MS = 120000;

type OptimisticEntry = {
    /** Number of pending optimistic kickoffs (one per user message). */
    count: number;

    /**
     * Timestamp of the most recent kickoff (ms). Drives the remaining safety window across
     * remounts. Bumped on every `increment` — matches the in-memory behavior where each
     * kickoff call to `startPolling` resets the 120s safety timer.
     */
    startedAt: number;

    /**
     * Newest reportActionID captured at the moment the indicator transitioned inactive→active.
     * Persisted so the Concierge-reply-detection effect still fires after a remount, even if
     * the reply arrived while the provider was unmounted. Unlike `startedAt`, this stays fixed
     * at the *first* kickoff's baseline — any new Concierge action afterwards is a new reply.
     */
    baselineActionID: string | null;
};

type Listener = (reportID: string) => void;

const store = new Map<string, OptimisticEntry>();
const listeners = new Set<Listener>();

function notifyListeners(reportID: string) {
    for (const listener of listeners) {
        listener(reportID);
    }
}

function isFresh(entry: OptimisticEntry): boolean {
    return Date.now() - entry.startedAt < MAX_AGE_MS;
}

/**
 * Get the current entry for a report, or undefined if none exists or the entry is past
 * its MAX_AGE_MS window. Stale entries are left in the map — the next increment/clear
 * will evict them. Callers that care about cleanup can call `clear` imperatively.
 */
function getEntry(reportID: string): OptimisticEntry | undefined {
    const entry = store.get(reportID);
    if (!entry) {
        return undefined;
    }
    return isFresh(entry) ? entry : undefined;
}

/**
 * Increment the pending count for a report, or start a fresh entry if none exists / the
 * existing one is stale. `baselineActionID` is only recorded on a fresh start — subsequent
 * kickoffs within the same window keep the original baseline (we care about replies newer
 * than the *first* optimistic message).
 *
 * `startedAt` is bumped on every call so the safety window always measures from the most
 * recent kickoff — this matches the in-memory `startPolling` behavior where each call
 * resets the 120s timer.
 */
function increment(reportID: string, baselineActionID: string | null) {
    const existing = store.get(reportID);
    const now = Date.now();
    if (existing && isFresh(existing)) {
        store.set(reportID, {
            count: existing.count + 1,
            startedAt: now,
            baselineActionID: existing.baselineActionID,
        });
    } else {
        store.set(reportID, {
            count: 1,
            startedAt: now,
            baselineActionID,
        });
    }
    notifyListeners(reportID);
}

/** Drop all optimistic state for a report. Safe to call when no entry exists. */
function clear(reportID: string) {
    if (!store.has(reportID)) {
        return;
    }
    store.delete(reportID);
    notifyListeners(reportID);
}

function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export default {
    getEntry,
    increment,
    clear,
    subscribe,
};

export {MAX_AGE_MS};
export type {OptimisticEntry};
