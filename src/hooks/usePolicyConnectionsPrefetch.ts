import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';

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
 * Fetches `policy.connections` lazily for a non-active workspace. `withPolicyConnections`
 * uses this to hydrate connections before rendering an accounting-adjacent page, and callers
 * that need the connection data without wrapping (e.g. `WorkspaceInitialPage` deciding whether
 * to render the Vendors row) pass a scoped `enabled` gate to opt in.
 *
 * The hook itself only bails on the shared safety guards — Onyx flag still hydrating, offline,
 * no policy loaded, no accounting/connections on the policy, already fetched — that need to
 * stay in sync across callers so callers don't reinvent them.
 */
function usePolicyConnectionsPrefetch(policy: OnyxEntry<OnyxTypes.Policy>, enabled: boolean): PrefetchState {
    const {isOffline} = useNetwork();
    const [hasBeenFetched, hasBeenFetchedResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${policy?.id}`);
    const isLoadingFetchedFlag = isLoadingOnyxValue(hasBeenFetchedResult);
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
