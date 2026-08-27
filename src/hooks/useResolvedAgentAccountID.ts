import {backfillOptimisticAccountIDMappingCreatedAt} from '@libs/actions/Agent';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

/**
 * Resolves an agent's optimistic accountID to the real one CreateAgent assigns, via the persisted
 * `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING`, so an agent screen opened on the optimistic accountID (even after a reload)
 * shows the real agent instead of "Hmm... it's not here".
 *
 * The derived `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_ENTRIES` defers its first compute until all its dependency
 * connections are established, which can briefly lag behind the raw key on a cold cache — long enough to flash a
 * not-found page in between. It's still used for `createdAt` below, which has no such timing sensitivity.
 *
 * Without a stamped `createdAt`, an entry is invisible to createAgent()'s pruning and never expires — this can
 * happen when the mapping arrives via sync from another device/tab that resolved it first.
 *
 * @returns `[resolvedAccountID, isMappingLoaded]` - a not-found screen should wait for `isMappingLoaded` to avoid a
 *          brief not-found flash while the mapping loads. No-op (returns the input) when there's no mapping entry.
 */
function useResolvedAgentAccountID(routeAccountID: number): [number, boolean] {
    const [realAccountID, mappingMetadata] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {selector: (mapping) => mapping?.[routeAccountID]});
    const [createdAt, createdAtMetadata] = useOnyx(ONYXKEYS.DERIVED.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_ENTRIES, {selector: (entries) => entries?.[routeAccountID]?.createdAt});

    useEffect(() => {
        if (realAccountID === undefined || createdAt !== undefined || createdAtMetadata.status !== 'loaded') {
            return;
        }
        backfillOptimisticAccountIDMappingCreatedAt(routeAccountID);
    }, [realAccountID, createdAt, createdAtMetadata.status, routeAccountID]);

    return [realAccountID ?? routeAccountID, mappingMetadata.status === 'loaded'];
}

export default useResolvedAgentAccountID;
