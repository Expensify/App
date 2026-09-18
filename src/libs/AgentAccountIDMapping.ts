/**
 * In-memory record of the {optimisticAccountID: realAccountID} agent mappings received this session. Middleware
 * registers mappings before the request queue drains so actions can resolve IDs before the Onyx update is flushed.
 * Persisted mappings are also registered when the replacement listener starts.
 *
 * Own module because the middleware also registers mappings and cannot import the lazy-loaded
 * replaceOptimisticAgentWithActualAgent without pulling navigation into the startup path.
 */
const consumedOptimisticAccountIDs = new Map<number, number>();

function registerAgentAccountIDMapping(optimisticAccountID: number, realAccountID: number) {
    consumedOptimisticAccountIDs.set(optimisticAccountID, realAccountID);
}

function resolveAgentAccountID(accountID: number): number {
    return consumedOptimisticAccountIDs.get(accountID) ?? accountID;
}

export {registerAgentAccountIDMapping, resolveAgentAccountID};
