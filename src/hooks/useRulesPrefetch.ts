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
 *
 * Returns whether the collection is still on its way, which a screen that decides something from a rule's
 * absence has to wait for. Onyx hydrates the collection as empty long before the response lands, so without
 * this a deep linked screen reads "no such rule" for a rule that exists.
 */
function useRulesPrefetch(enabled = true): {areRulesLoading: boolean} {
    const {isOffline} = useNetwork();
    const [hasBeenFetched, hasBeenFetchedResult] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_RULES_DATA_BEEN_FETCHED);
    const [isLoadingRules] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_RULES);
    const isFlagLoading = isLoadingOnyxValue(hasBeenFetchedResult);
    const isFetchNeeded = enabled && !isFlagLoading && !isOffline && !hasBeenFetched && !isLoadingRules;

    useEffect(() => {
        if (!isFetchNeeded) {
            return;
        }
        getRules();
    }, [isFetchNeeded]);

    // `isFetchNeeded` and `isFlagLoading` cover the renders before the effect has run, which are the ones a
    // guard reading the collection would otherwise resolve against nothing. Offline there is nothing to wait for.
    return {areRulesLoading: enabled && !isOffline && (isFlagLoading || isFetchNeeded || !!isLoadingRules)};
}

export default useRulesPrefetch;
