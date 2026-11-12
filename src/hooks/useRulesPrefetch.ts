import {getRules, resetRulesFetchState} from '@libs/actions/Policy/Rules';

import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useEffect, useState} from 'react';

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
 * `GetRules` takes no parameters and its response SETs the whole collection, so a successful fetch happens
 * once per session rather than on every mount. The shared guards live here so callers cannot drift apart.
 *
 * A failed fetch leaves the collection missing, so the next screen to need it asks again. Each mount asks at
 * most once, which is what stops a server error from retrying on every render while a screen stays open.
 *
 * Returns whether the collection is still on its way, which a screen that decides something from a rule's
 * absence has to wait for. Onyx hydrates the collection as empty long before the response lands, so without
 * this a deep linked screen reads "no such rule" for a rule that exists.
 *
 * Also returns whether the collection has actually arrived, which tells a settled wait that fetched the rules
 * apart from one that failed. A screen that resolved something against no rules needs that to know a retry has
 * given it something new to resolve against.
 */
function useRulesPrefetch(enabled = true): {areRulesLoading: boolean; haveRulesLoaded: boolean} {
    // Whether this mount has asked for the collection. A failed fetch leaves the fetched flag false, so without
    // this the hook would see a fetch as needed again the moment the in-flight flag cleared, on every render.
    const [hasAsked, setHasAsked] = useState(false);
    // Reconnecting is the only signal that a fetch which never settled is not still on its way.
    const {isOffline} = useNetwork({
        onReconnect: () => {
            setHasAsked(false);
            resetRulesFetchState();
        },
    });
    const [hasBeenFetched, hasBeenFetchedResult] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_RULES_DATA_BEEN_FETCHED);
    const [isLoadingRules] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_RULES);
    const [hasFetchFailed] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_RULES_FETCH_FAILED);
    const isFlagLoading = isLoadingOnyxValue(hasBeenFetchedResult);
    const isFetchNeeded = enabled && !isFlagLoading && !isOffline && !hasBeenFetched && !isLoadingRules && !hasAsked;
    // A fetch this mount sent is still on its way until one of the flags says otherwise. The request writes the
    // in-flight flag a tick after it is sent, and the collection must not read as settled in between.
    const isAwaitingResponse = hasAsked && !hasBeenFetched && !hasFetchFailed;

    useEffect(() => {
        if (!isFetchNeeded) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- whether this mount has asked is history, so it cannot be derived from the current render
        setHasAsked(true);
        getRules();
    }, [isFetchNeeded]);

    // `isFetchNeeded` and `isFlagLoading` cover the renders before the effect has run, which are the ones a
    // guard reading the collection would otherwise resolve against nothing. Offline there is nothing to wait for.
    // A failed fetch settles the wait rather than holding every reader of the collection for the rest of the
    // session, which is what telling it apart from a fetch still to send buys.
    return {areRulesLoading: enabled && !isOffline && (isFlagLoading || isFetchNeeded || isAwaitingResponse || !!isLoadingRules), haveRulesLoaded: !!hasBeenFetched};
}

export default useRulesPrefetch;
