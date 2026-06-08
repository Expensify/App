/**
 * Builds the composite key used by the per-agent AgentZero in-memory stores
 * (`AgentZeroOptimisticStore` and `AgentZeroReasoningStore`). Agent accountIDs are numeric, so
 * `:` never collides with either part of the key.
 */
function getAgentStoreKey(reportID: string, agentAccountID: number): string {
    return `${reportID}:${agentAccountID}`;
}

export default getAgentStoreKey;
