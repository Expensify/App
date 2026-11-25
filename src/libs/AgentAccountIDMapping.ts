import ONYXKEYS from '@src/ONYXKEYS';
import type {Agent} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

/**
 * In-memory record of the {optimisticAccountID: realAccountID} agent mappings received this session. Middleware
 * registers mappings before the request queue drains so actions can resolve IDs before the Onyx update is flushed.
 * Persisted mappings are also registered when the replacement listener starts.
 *
 * Own module because the middleware also registers mappings and cannot import the lazy-loaded
 * replaceOptimisticAgentWithActualAgent without pulling navigation into the startup path.
 */
const resolvedAgentAccountIDs = new Map<number, number>();
const realAgentAccountIDs = new Set<number>();

function isValidAgentAccountID(accountID: unknown): accountID is number {
    return typeof accountID === 'number' && Number.isSafeInteger(accountID) && accountID > 0;
}

function registerAgentAccountIDMapping(optimisticAccountID: number, realAccountID: number) {
    resolvedAgentAccountIDs.set(optimisticAccountID, realAccountID);
    realAgentAccountIDs.add(realAccountID);
}

function isMappedRealAgentAccountID(accountID: number): boolean {
    return realAgentAccountIDs.has(accountID);
}

function resolveAgentAccountID(accountID: number): number {
    return resolvedAgentAccountIDs.get(accountID) ?? accountID;
}

// The agent records this tab's cache holds, kept up to date by replaceOptimisticAgentWithActualAgent, which already reads
// the agents collection. Agent actions check it before an optimistic write to a real agent's record: another tab's writes
// reach this tab key by key, and a merge into a record this tab does not hold yet would save a record without its prompt.
let heldAgentRecords: OnyxCollection<Agent>;

function setHeldAgentRecords(agents: OnyxCollection<Agent>) {
    heldAgentRecords = agents;
}

function hasAgentRecord(accountID: number): boolean {
    return !!heldAgentRecords?.[`${ONYXKEYS.COLLECTION.AGENT}${accountID}`];
}

// A new agent's temporary record carries the name and avatar its screens fall back to; a save keeps them current.
function hasAgentFallback(accountID: number): boolean {
    return heldAgentRecords?.[`${ONYXKEYS.COLLECTION.AGENT}${accountID}`]?.fallbackDisplayName !== undefined;
}

export {hasAgentFallback, hasAgentRecord, isMappedRealAgentAccountID, isValidAgentAccountID, registerAgentAccountIDMapping, resolveAgentAccountID, setHeldAgentRecords};
