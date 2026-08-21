import {getPolicyCategories} from '@libs/actions/Policy/Category';

import {useEffect} from 'react';

import useNetwork from './useNetwork';

/**
 * Policy IDs whose categories we've already requested during this app session.
 * Kept at module level (not a per-instance ref) so that multiple picker instances
 * mounting for the same policy don't each fire a redundant `GetPolicyCategories`
 * read — `API.read` does not dedupe in-flight reads, so we guard here instead.
 */
const requestedPolicyCategoryIDs = new Set<string>();

/**
 * Fetches a policy's categories on demand when a category picker mounts.
 *
 * High-traffic accounts load Onyx data lazily, so on a fresh sign-in the
 * `policyCategories` collection can be missing or contain only the category
 * already on the expense. Any picker surface that reads categories from Onyx
 * without fetching (inline cells, bulk edit, etc.) then shows just the selected
 * category. Centralizing the fetch here means every picker consumer backfills the
 * full list on demand.
 *
 * The fetch fires once per policyID per session, unconditionally (not gated on the
 * current category count): the client has no reliable "collection is complete"
 * signal, and a partial collection is indistinguishable from a full one, so gating
 * on a count would miss the "only the selected category is present" case. The read
 * is idempotent, so re-fetching simply refreshes to the authoritative set.
 */
function useLoadPolicyCategories(policyID: string | undefined) {
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (isOffline || !policyID || requestedPolicyCategoryIDs.has(policyID)) {
            return;
        }
        requestedPolicyCategoryIDs.add(policyID);
        getPolicyCategories(policyID);
    }, [policyID, isOffline]);
}

export default useLoadPolicyCategories;
