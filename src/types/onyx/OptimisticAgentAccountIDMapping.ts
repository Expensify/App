/**
 * Maps an agent's optimistic (client-generated) accountID to the real accountID the backend assigns once CreateAgent resolves.
 * Backend-populated via CreateAgent's onyxData; persisted so the optimistic accountID still resolves after a reload.
 */
type OptimisticAgentAccountIDMapping = Record<string, number>;

export default OptimisticAgentAccountIDMapping;
