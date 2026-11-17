/**
 * Ephemeral in-memory store for the optimistic "thinking…" state, keyed by `(reportID,
 * agentAccountID)` so a room with several agents tracks each one independently.
 *
 * The optimistic state has to survive ReportScreen remounts (switching chats and coming
 * back) — React state scoped to the mounted provider doesn't. This store holds it at the
 * module level so the next mount can restore the indicator.
 *
 * Messages sent to Concierge are tracked one by one, so each clears only when its own reply
 * lands or the server says Concierge is done with it. Other kickoffs are only counted and
 * clear on the agent's next reply. Everything also clears on the safety timeout or reconnect.
 * Not persisted to Onyx.
 */
import type {ConciergeProcessingStatus} from '@src/types/onyx/Response';

import getAgentStoreKey from './AgentZeroStoreUtils';

/** Upper bound on how long an optimistic entry stays valid without a server label or reply. */
const MAX_AGE_MS = 120000;

/** A message sent to Concierge that is still waiting for its reply or for the server to finish it. */
type PendingTurn = {
    /** The user's message. The server names it when it reports its decision or that the run finished. */
    questionReportActionID: string;

    /** The ID the client reserved for Concierge's reply, which Auth gives the reply when it posts it. */
    responseReportActionID: string;
};

type OptimisticEntry = {
    reportID: string;

    agentAccountID: number;

    /** Kickoffs that are not tied to a message. A reply from the agent clears all of them. */
    count: number;

    /**
     * Timestamp of the most recent kickoff (ms). Drives the remaining safety window across
     * remounts. Bumped on every new message, so the 120s safety timer always measures from
     * the latest one.
     */
    startedAt: number;

    /**
     * Newest reportActionID captured at the moment the indicator transitioned inactive→active.
     * Persisted so the reply-detection effect still fires after a remount, even if the reply
     * arrived while the provider was unmounted. Unlike `startedAt`, this stays fixed at the
     * *first* kickoff's baseline — any new agent action afterwards is a new reply.
     */
    baselineActionID: string | null;

    /** Messages that each wait for their own reply or completion, so an older reply cannot clear a newer message. */
    turns: PendingTurn[];
};

type Listener = (reportID: string, agentAccountID: number) => void;

const store = new Map<string, OptimisticEntry>();
const listeners = new Set<Listener>();

function notifyListeners(reportID: string, agentAccountID: number) {
    for (const listener of listeners) {
        listener(reportID, agentAccountID);
    }
}

function isFresh(entry: OptimisticEntry): boolean {
    return Date.now() - entry.startedAt < MAX_AGE_MS;
}

/** Returns how many kickoffs and messages are still waiting in the entry. */
function getPendingCount(entry: OptimisticEntry | undefined): number {
    return entry ? entry.count + entry.turns.length : 0;
}

/**
 * Get the current entry for an agent in a report, or undefined if none exists or the entry is
 * past its MAX_AGE_MS window. Stale entries are left in the map — the next increment/clear
 * will evict them. Callers that care about cleanup can call `clear` imperatively.
 */
function getEntry(reportID: string, agentAccountID: number): OptimisticEntry | undefined {
    const entry = store.get(getAgentStoreKey(reportID, agentAccountID));
    if (!entry) {
        return undefined;
    }
    return isFresh(entry) ? entry : undefined;
}

/**
 * Adds a kickoff to the agent's entry, or starts a fresh entry if none exists or the existing one
 * is stale. `baselineActionID` is only recorded on a fresh start, because replies count from the
 * *first* optimistic message. `startedAt` is bumped on every call so the safety window always
 * measures from the most recent kickoff.
 */
function addToEntry(reportID: string, agentAccountID: number, baselineActionID: string | null, kickoffCount: number, turns: PendingTurn[]) {
    const key = getAgentStoreKey(reportID, agentAccountID);
    const existing = store.get(key);
    const freshEntry = existing && isFresh(existing) ? existing : undefined;
    const knownQuestionIDs = new Set(freshEntry?.turns.map((turn) => turn.questionReportActionID));
    store.set(key, {
        reportID,
        agentAccountID,
        count: (freshEntry?.count ?? 0) + kickoffCount,
        startedAt: Date.now(),
        baselineActionID: freshEntry ? freshEntry.baselineActionID : baselineActionID,
        turns: [...(freshEntry?.turns ?? []), ...turns.filter((turn) => !knownQuestionIDs.has(turn.questionReportActionID))],
    });
    notifyListeners(reportID, agentAccountID);
}

/** Adds a kickoff that is not tied to a specific message. */
function increment(reportID: string, agentAccountID: number, baselineActionID: string | null) {
    addToEntry(reportID, agentAccountID, baselineActionID, 1, []);
}

/** Starts waiting for one sent message, which clears only on its own reply or completion. */
function addTurn(reportID: string, agentAccountID: number, baselineActionID: string | null, turn: PendingTurn) {
    addToEntry(reportID, agentAccountID, baselineActionID, 0, [turn]);
}

/** Drop optimistic state for an agent in a report. Safe to call when no entry exists. */
function clear(reportID: string, agentAccountID: number) {
    const key = getAgentStoreKey(reportID, agentAccountID);
    if (!store.has(key)) {
        return;
    }
    store.delete(key);
    notifyListeners(reportID, agentAccountID);
}

/** Removes the message from whichever entry holds it and returns that entry and message, if found. */
function removeTurn(questionReportActionID: string): {entry: OptimisticEntry; turn: PendingTurn} | undefined {
    for (const [key, entry] of store) {
        const turn = entry.turns.find((pendingTurn) => pendingTurn.questionReportActionID === questionReportActionID);
        if (!turn) {
            continue;
        }
        const turns = entry.turns.filter((pendingTurn) => pendingTurn !== turn);
        if (entry.count === 0 && turns.length === 0) {
            store.delete(key);
        } else {
            store.set(key, {...entry, turns});
        }
        notifyListeners(entry.reportID, entry.agentAccountID);
        return {entry, turn};
    }
    return undefined;
}

/** Stops waiting for a message after its reply landed or the server finished with it. Other messages keep waiting. */
function completeTurn(questionReportActionID: string) {
    removeTurn(questionReportActionID);
}

/**
 * Moves a message to the report the server chose for the reply. The client predicts a new thread, but the server
 * can answer in an existing thread or in the DM. The original start time is kept, so the move does not extend the
 * safety window.
 */
function moveTurn(questionReportActionID: string, destinationReportID: string) {
    const source = [...store.values()].find((entry) => entry.reportID !== destinationReportID && entry.turns.some((turn) => turn.questionReportActionID === questionReportActionID));
    if (!source) {
        return;
    }
    const removed = removeTurn(questionReportActionID);
    if (!removed) {
        return;
    }
    const key = getAgentStoreKey(destinationReportID, source.agentAccountID);
    const existing = store.get(key);
    const destination = existing && isFresh(existing) ? existing : undefined;
    store.set(key, {
        reportID: destinationReportID,
        agentAccountID: source.agentAccountID,
        count: destination?.count ?? 0,
        startedAt: Math.max(destination?.startedAt ?? 0, source.startedAt),
        baselineActionID: destination ? destination.baselineActionID : source.baselineActionID,
        turns: [...(destination?.turns ?? []).filter((turn) => turn.questionReportActionID !== questionReportActionID), removed.turn],
    });
    notifyListeners(destinationReportID, source.agentAccountID);
}

/**
 * Applies the server's decision for a message. A send can be reported by a different tab than the one that made it,
 * so the message is found by its ID wherever this tab tracks it.
 */
function reconcile(status: ConciergeProcessingStatus) {
    if (status.isProcessing) {
        moveTurn(status.reportActionID, status.reportID);
        return;
    }
    completeTurn(status.reportActionID);
}

function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export default {
    getEntry,
    getPendingCount,
    increment,
    addTurn,
    clear,
    completeTurn,
    reconcile,
    subscribe,
};

export {MAX_AGE_MS};
export type {PendingTurn};
