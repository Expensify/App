import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';

import {useEffect} from 'react';

import useNetwork from './useNetwork';

/**
 * Policy IDs whose tags we've already requested during this app session.
 * Kept at module level (not a per-instance ref) so that multiple picker instances
 * mounting for the same policy don't each fire a redundant `OpenPolicyTagsPage`
 * read — `API.read` does not dedupe in-flight reads, so we guard here instead.
 */
const requestedPolicyTagIDs = new Set<string>();

/**
 * Fetches a policy's tags on demand when a tag picker mounts.
 *
 * High-traffic accounts load Onyx data lazily, so on a fresh sign-in the
 * `policyTags` collection can be missing or contain only the tag already on the
 * expense. Any picker surface that reads tags from Onyx without fetching (inline
 * cells, bulk edit, the IOU tag step, etc.) then shows just the selected tag.
 * Centralizing the fetch here means every picker consumer backfills the full list
 * on demand.
 *
 * The fetch fires once per policyID per session, unconditionally (not gated on the
 * current tag count): the client has no reliable "collection is complete" signal,
 * and a partial collection is indistinguishable from a full one, so gating on a
 * count would miss the "only the selected tag is present" case. The read is
 * idempotent, so re-fetching simply refreshes to the authoritative set.
 *
 * Note: `OpenPolicyTagsPage` is the only tag read command available to the client
 * today (there is no narrow per-transaction tag read), so it is used here.
 */
function useLoadPolicyTags(policyID: string | undefined) {
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (isOffline || !policyID || requestedPolicyTagIDs.has(policyID)) {
            return;
        }
        requestedPolicyTagIDs.add(policyID);
        openPolicyTagsPage(policyID);
    }, [policyID, isOffline]);
}

export default useLoadPolicyTags;
