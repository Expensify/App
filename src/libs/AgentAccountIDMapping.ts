/**
 * In-memory record of the {optimisticAccountID: realAccountID} agent mappings consumed this session.
 *
 * It is kept in memory because the OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING Onyx entry is cleared once consumed, so
 * this is the only way a late caller can still translate an optimistic accountID it captured earlier (e.g. an
 * agent settings screen that was opened before the reconciliation redirect).
 *
 * It lives in its own module because both the ReplaceOptimisticAgentAccountID middleware and
 * replaceOptimisticAgentWithActualAgent register mappings, and the latter is deliberately lazy-loaded after the
 * splash screen: importing it from the middleware (registered during app setup) would pull its navigation
 * dependencies into the startup path.
 */
const consumedOptimisticAccountIDs = new Map<number, number>();

function registerAgentAccountIDMapping(optimisticAccountID: number, realAccountID: number) {
    consumedOptimisticAccountIDs.set(optimisticAccountID, realAccountID);
}

function resolveAgentAccountID(accountID: number): number {
    return consumedOptimisticAccountIDs.get(accountID) ?? accountID;
}

export {registerAgentAccountIDMapping, resolveAgentAccountID};
