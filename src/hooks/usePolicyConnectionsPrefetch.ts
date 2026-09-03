import {clearPolicyConnectionsStaleMarker, openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isXeroVendorMatchingActive} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

import useAppFocusEvent from './useAppFocusEvent';
import useIsScreenFocused from './useIsScreenFocused';
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
    const [refreshDeadline] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTIONS_REFRESH_DEADLINE}${getNonEmptyStringOnyxID(policy?.id)}`);
    const isLoadingFetchedFlag = !!policy?.id && isLoadingOnyxValue(hasBeenFetchedResult);
    const isFetchNeeded = enabled && !isLoadingFetchedFlag && !isOffline && !!policy && (!!policy.areConnectionsEnabled || !isEmptyObject(policy.connections)) && !hasBeenFetched;

    useEffect(() => {
        if (!isFetchNeeded || !policy?.id) {
            return;
        }
        openPolicyAccountingPage(policy.id);
    }, [policy?.id, isFetchNeeded]);

    // The lazy fetch above runs at most once per policy per device, so it can't pick up a connection that was
    // created after it ran. `markPolicyConnectionsAsStale` marks that case, and the refresh below is what
    // actually re-reads the config.
    //
    // The only flow that sets the marker today is the Xero setup handoff, and the field that handoff is
    // expected to produce is `xero.config.isConfigured` — the same field the Vendors toggle reads. Checking it
    // directly is what lets the marker survive a refresh that lands while the sync is still running, instead of
    // clearing on the first response and stranding the stale value.
    const isRefreshResolved = isXeroVendorMatchingActive(policy);
    const isScreenFocused = useIsScreenFocused();

    // Two triggers, because neither one covers both platforms. On web the setup opens OldDot in a separate
    // browser tab, so the user comes back to an already-mounted screen and only the window focus event fires.
    // On native the setup runs in an in-app WebView, so the app is never backgrounded and `AppState` never
    // leaves `active` — there the screen regaining focus is the only signal.
    const [appFocusCount, setAppFocusCount] = useState(0);
    useAppFocusEvent(() => setAppFocusCount((count) => count + 1));

    useEffect(() => {
        if (!enabled || !policy?.id || !refreshDeadline || !isScreenFocused || isOffline) {
            return;
        }
        if (isRefreshResolved || Date.now() > refreshDeadline) {
            clearPolicyConnectionsStaleMarker(policy.id);
            return;
        }
        openPolicyAccountingPage(policy.id);
    }, [enabled, policy?.id, refreshDeadline, isScreenFocused, isOffline, isRefreshResolved, appFocusCount]);

    return {isFetchNeeded, isLoadingFetchedFlag, hasBeenFetched};
}

export default usePolicyConnectionsPrefetch;
