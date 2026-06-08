import useOnyx from '@hooks/useOnyx';
import {getTagLists} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Owns the policy-tag subscription for the confirmation flow.
 *
 * Reads policy tags for the given policyID and derives the ordered tag-list array used
 * by both the tag fields in the footer and the confirmation-validation hook.
 */
function usePolicyTagsForConfirmation(policyID: string | undefined) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policyTagLists = getTagLists(policyTags);
    return {policyTags, policyTagLists};
}

export default usePolicyTagsForConfirmation;
