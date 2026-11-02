/**
 * In-memory record of the {optimisticAccountID: realAccountID} agent mappings consumed this session. The Onyx
 * mapping entry is cleared once consumed, so this is the only way a late caller (e.g. an agent settings screen
 * opened before the redirect) can still translate an optimistic accountID.
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
