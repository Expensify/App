import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Policy IDs whose tags we have already refreshed this session. Kept at module level so that multiple pickers mounting
 * for the same policy do not each fire a redundant `OpenPolicyTagsPage` read, since `API.read` does not dedupe in
 * flight reads.
 */
const refreshedPolicyTagIDs = new Set<string>();

/**
 * Fetches a policy's tags on demand when a tag picker mounts, so a lazy-loaded account does not show only the tag
 * already on the expense. The read is idempotent and fires once per policyID per session, but is retried while the
 * collection is still absent from Onyx. `OpenPolicyTagsPage` is the only tag read available to the client today.
 */
function useLoadPolicyTags(policyID: string | undefined) {
    const {isOffline} = useNetwork();
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const hasTags = policyTags !== undefined;

    useEffect(() => {
        if (isOffline || !policyID) {
            return;
        }
        if (hasTags && refreshedPolicyTagIDs.has(policyID)) {
            return;
        }
        refreshedPolicyTagIDs.add(policyID);
        openPolicyTagsPage(policyID);
    }, [policyID, isOffline, hasTags]);
}

export default useLoadPolicyTags;
