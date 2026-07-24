import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type PrefetchState = {
    isFetchNeeded: boolean;
    isLoadingFetchedFlag: boolean;
    hasBeenFetched: boolean | undefined;
};

/**
 * Fetches `policy.connections` lazily for a non-active workspace. Only the currently active
 * policy has its connections field populated at app start; anything else needs to trigger
 * `openPolicyAccountingPage` on-demand.
 *
 * Callers pass `enabled` to opt in — the hook stays inert unless the caller has a reason to
 * need the connection data. The shared safety guards (Onyx flag still hydrating, offline,
 * policy missing, no accounting connection to fetch, already fetched) live here so callers
 * can't drift out of sync.
 */
function usePolicyConnectionsPrefetch(policy: OnyxEntry<OnyxTypes.Policy>, enabled: boolean): PrefetchState {
    const {isOffline} = useNetwork();
    const [hasBeenFetched, hasBeenFetchedResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${getNonEmptyStringOnyxID(policy?.id)}`);
    const isLoadingFetchedFlag = !!policy?.id && isLoadingOnyxValue(hasBeenFetchedResult);
    const isFetchNeeded = enabled && !isLoadingFetchedFlag && !isOffline && !!policy && (!!policy.areConnectionsEnabled || !isEmptyObject(policy.connections)) && !hasBeenFetched;

    useEffect(() => {
        if (!isFetchNeeded || !policy?.id) {
            return;
        }
        openPolicyAccountingPage(policy.id);
    }, [policy?.id, isFetchNeeded]);

    return {isFetchNeeded, isLoadingFetchedFlag, hasBeenFetched};
}

export default usePolicyConnectionsPrefetch;
