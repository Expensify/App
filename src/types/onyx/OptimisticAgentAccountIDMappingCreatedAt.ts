/**
 * Records when each OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING entry was written locally, in ms since epoch (Date.now()).
 * Client-only — the backend doesn't send a timestamp — so stale mapping entries can be pruned.
 */
type OptimisticAgentAccountIDMappingCreatedAt = Record<string, number>;

export default OptimisticAgentAccountIDMappingCreatedAt;
