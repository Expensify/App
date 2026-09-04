import {getPolicyCategories} from '@libs/actions/Policy/Category';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Policy IDs whose categories we have already refreshed this session. Kept at module level so that multiple pickers
 * mounting for the same policy do not each fire a redundant `GetPolicyCategories` read, since `API.read` does not
 * dedupe in flight reads.
 */
const refreshedPolicyCategoryIDs = new Set<string>();

/**
 * Fetches a policy's categories on demand when a category picker mounts, so a lazy-loaded account does not show only
 * the category already on the expense. The read is idempotent and fires once per policyID per session, but is retried
 * while the collection is still absent from Onyx, which means the read never landed.
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
