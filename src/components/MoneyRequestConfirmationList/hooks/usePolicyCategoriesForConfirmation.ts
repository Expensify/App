import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Owns the policy-category subscriptions for the confirmation flow.
 *
 * Reads both the real and draft policy categories for the given policyID and returns
 * whichever is present (real takes precedence, falling back to draft for transactions
 * tied to a draft policy).
 */
function usePolicyCategoriesForConfirmation(policyID: string | undefined) {
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`);
    return policyCategoriesReal ?? policyCategoriesDraft;
}

export default usePolicyCategoriesForConfirmation;
