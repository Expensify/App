import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';

import type {UseConfirmationPolicyDataParams} from './types';

import usePolicyCategoriesForConfirmation from './usePolicyCategoriesForConfirmation';
import usePolicyTagsForConfirmation from './usePolicyTagsForConfirmation';

/**
 * Everything the confirmation reads from the workspace: the resolved policy, its categories and tags, and whether
 * the user still has to pick a workspace.
 */
function useConfirmationPolicyData({transaction, policyID, action, iouType, isPerDiemRequest}: UseConfirmationPolicyDataParams) {
    const policyCategories = usePolicyCategoriesForConfirmation(policyID);
    const {policyTags, policyTagLists} = usePolicyTagsForConfirmation(policyID);
    const {shouldSelectPolicy, policyForMovingExpenses} = usePolicyForMovingExpenses();

    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyID,
        action,
        iouType,
        isPerDiemRequest,
    });

    return {policy, policyForMovingExpenses, policyCategories, policyTags, policyTagLists, shouldSelectPolicy};
}

export default useConfirmationPolicyData;
