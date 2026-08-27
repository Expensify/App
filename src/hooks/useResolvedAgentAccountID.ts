import {backfillOptimisticAccountIDMappingCreatedAt} from '@libs/actions/Agent';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

/**
 * Resolves an agent's optimistic accountID to the real one CreateAgent assigns, via the derived
 * `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_ENTRIES` (combining the mapping and its createdAt timestamp into one
 * always-in-sync source), so an agent screen opened on the optimistic accountID (even after a reload) shows the
 * real agent instead of "Hmm... it's not here".
 *
 * Without a stamped `createdAt`, an entry is invisible to createAgent()'s pruning and never expires — this can
 * happen when the mapping arrives via sync from another device/tab that resolved it first.
 *
 * @returns `[resolvedAccountID, isMappingLoaded]` - a not-found screen should wait for `isMappingLoaded` to avoid a
 *          brief not-found flash while the mapping loads. No-op (returns the input) when there's no mapping entry.
 */
function useResolvedAgentAccountID(routeAccountID: number): [number, boolean] {
    const [entry, entryMetadata] = useOnyx(ONYXKEYS.DERIVED.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_ENTRIES, {selector: (entries) => entries?.[routeAccountID]});

    useEffect(() => {
        if (entry?.realAccountID === undefined || entry.createdAt !== undefined || entryMetadata.status !== 'loaded') {
            return;
        }
        backfillOptimisticAccountIDMappingCreatedAt(routeAccountID);
    }, [entry?.realAccountID, entry?.createdAt, entryMetadata.status, routeAccountID]);

    return [entry?.realAccountID ?? routeAccountID, entryMetadata.status === 'loaded'];
}

export default useResolvedAgentAccountID;
