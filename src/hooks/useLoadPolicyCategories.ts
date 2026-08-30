import {getPolicyCategories} from '@libs/actions/Policy/Category';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Policy IDs whose categories we have already refreshed during this app session.
 * Kept at module level rather than a per instance ref so that multiple picker instances mounting for the same
 * policy do not each fire a redundant `GetPolicyCategories` read. `API.read` does not dedupe in flight reads,
 * so we guard here instead.
 */
const refreshedPolicyCategoryIDs = new Set<string>();

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
 * The refresh fires once per policyID per session, unconditionally (not gated on the
 * current category count): the client has no reliable "collection is complete"
 * signal, and a partial collection is indistinguishable from a full one, so gating
 * on a count would miss the "only the selected category is present" case. The read
 * is idempotent, so re-fetching simply refreshes to the authoritative set.
 *
 * While the collection is still absent from Onyx the refresh is retried instead of
 * being skipped, because an absent collection means the read never landed: it
 * failed, the connection dropped right after the online check, or Onyx was cleared
 * by a sign-out. Recording an attempt forever would leave the picker stuck on its
 * loading state for the rest of the session.
 */
function useLoadPolicyCategories(policyID: string | undefined) {
    const {isOffline} = useNetwork();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const hasCategories = policyCategories !== undefined;

    useEffect(() => {
        if (isOffline || !policyID) {
            return;
        }
        if (hasCategories && refreshedPolicyCategoryIDs.has(policyID)) {
            return;
        }
        refreshedPolicyCategoryIDs.add(policyID);
        getPolicyCategories(policyID);
    }, [policyID, isOffline, hasCategories]);
}

export default useLoadPolicyCategories;
