import {backfillOptimisticAccountIDMappingCreatedAt} from '@libs/actions/Agent';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

/**
 * Resolves an agent's optimistic accountID to the real one CreateAgent assigns, via the persisted
 * `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING`, so an agent screen opened on the optimistic accountID (even after a reload)
 * shows the real agent instead of "Hmm... it's not here". Persisted because the backend sends the mapping only once.
 *
 * Also backfills `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT` for entries this device notices without one — a
 * mapping entry can arrive via sync from another device/tab that resolved it first, so this device never got the
 * chance to stamp it itself. Without a timestamp an entry is invisible to createAgent()'s pruning and never expires.
 *
 * @returns `[resolvedAccountID, isMappingLoaded]` - a not-found screen should wait for `isMappingLoaded` to avoid a
 *          brief not-found flash while the mapping loads. No-op (returns the input) when there's no mapping entry.
 */
function useResolvedAgentAccountID(routeAccountID: number): [number, boolean] {
    const [realAccountID, mappingMetadata] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {selector: (mapping) => mapping?.[routeAccountID]});
    const [createdAt, createdAtMetadata] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT, {selector: (mapping) => mapping?.[routeAccountID]});

    useEffect(() => {
        if (realAccountID === undefined || createdAt !== undefined || createdAtMetadata.status !== 'loaded') {
            return;
        }
        backfillOptimisticAccountIDMappingCreatedAt(routeAccountID);
    }, [realAccountID, createdAt, createdAtMetadata.status, routeAccountID]);

    return [realAccountID ?? routeAccountID, mappingMetadata.status === 'loaded'];
}

export default useResolvedAgentAccountID;
