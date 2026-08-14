import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Resolves an agent's optimistic accountID to the real one CreateAgent assigns, via the persisted
 * `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING`, so an agent screen opened on the optimistic accountID (even after a reload)
 * shows the real agent instead of "Hmm... it's not here". Persisted because the backend sends the mapping only once.
 *
 * @returns `[resolvedAccountID, isMappingLoaded]` - a not-found screen should wait for `isMappingLoaded` to avoid a
 *          brief not-found flash while the mapping loads. No-op (returns the input) when there's no mapping entry.
 */
function useResolvedAgentAccountID(routeAccountID: number): [number, boolean] {
    const [realAccountID, mappingMetadata] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {selector: (mapping) => mapping?.[routeAccountID]});
    return [realAccountID ?? routeAccountID, mappingMetadata.status === 'loaded'];
}

export default useResolvedAgentAccountID;
