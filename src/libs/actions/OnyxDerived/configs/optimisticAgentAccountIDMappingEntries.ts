import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OptimisticAgentAccountIDMappingEntriesDerivedValue} from '@src/types/onyx';

/**
 * Combines OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING (backend-owned) and OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT
 * (client-owned) into one key per optimistic accountID, so consumers read a single always-in-sync source instead
 * of two parallel keys that would otherwise have to be kept manually in lockstep.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_ENTRIES,
    dependencies: [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT],
    compute: ([mapping, createdAtByOptimisticAccountID]) => {
        if (!mapping) {
            return {};
        }

        const entries: OptimisticAgentAccountIDMappingEntriesDerivedValue = {};
        for (const [optimisticAccountID, realAccountID] of Object.entries(mapping)) {
            if (realAccountID === undefined) {
                continue;
            }
            entries[optimisticAccountID] = {realAccountID, createdAt: createdAtByOptimisticAccountID?.[optimisticAccountID]};
        }
        return entries;
    },
});
