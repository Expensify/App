/**
 * In-memory record of the {optimisticAccountID: realAccountID} agent mappings received this session. Middleware
 * registers mappings before the request queue drains so actions can resolve IDs before the Onyx update is flushed.
 * Persisted mappings are also registered when the replacement listener starts.
 *
 * Own module because the middleware also registers mappings and cannot import the lazy-loaded
 * replaceOptimisticAgentWithActualAgent without pulling navigation into the startup path.
 */
const resolvedAgentAccountIDs = new Map<number, number>();

// Optimistic accountIDs whose mapping arrived in a CreateAgent response this tab applied. On web, Onyx saves the whole
// value of a key from the writing tab's own cache. Only this tab's cache is sure to hold the real agent from that
// response, so only this tab may clear the optimistic agent's shared data.
const agentAccountIDsReceivedInThisTab = new Set<number>();

function isValidAgentAccountID(accountID: unknown): accountID is number {
    return typeof accountID === 'number' && Number.isSafeInteger(accountID) && accountID > 0;
}

function registerAgentAccountIDMapping(optimisticAccountID: number, realAccountID: number) {
    resolvedAgentAccountIDs.set(optimisticAccountID, realAccountID);
}

function markAgentAccountIDMappingReceivedInThisTab(optimisticAccountID: number) {
    agentAccountIDsReceivedInThisTab.add(optimisticAccountID);
}

function wasAgentAccountIDMappingReceivedInThisTab(optimisticAccountID: number): boolean {
    return agentAccountIDsReceivedInThisTab.has(optimisticAccountID);
}

function resolveAgentAccountID(accountID: number): number {
    return resolvedAgentAccountIDs.get(accountID) ?? accountID;
}

export {isValidAgentAccountID, markAgentAccountIDMappingReceivedInThisTab, registerAgentAccountIDMapping, resolveAgentAccountID, wasAgentAccountIDMappingReceivedInThisTab};
