import {getRules} from '@libs/actions/Policy/Rules';

import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useEffect} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Fetches the `rules_` collection for a screen that reads it without opening a workspace.
 *
 * Merchant rules used to arrive on the policy, so anything holding a policy could read them. They now
 * live in their own collection that only `GetRules` populates, which leaves screens reached from the
 * workspaces list or from Home reading an empty collection. Where that collection decides whether an
 * option is offered at all, an empty read silently drops the rules rather than showing a stale count.
 *
 * `GetRules` takes no parameters and its response SETs the whole collection, so this fetches once per
 * session rather than on every mount. The shared guards live here so callers cannot drift apart.
 */
function useRulesPrefetch(enabled = true) {
    const {isOffline} = useNetwork();
    const [hasBeenFetched, hasBeenFetchedResult] = useOnyx(ONYXKEYS.HAS_RULES_DATA_BEEN_FETCHED);
    const isFetchNeeded = enabled && !isLoadingOnyxValue(hasBeenFetchedResult) && !isOffline && !hasBeenFetched;

    useEffect(() => {
        if (!isFetchNeeded) {
            return;
        }
        getRules();
    }, [isFetchNeeded]);
}

export default useRulesPrefetch;
