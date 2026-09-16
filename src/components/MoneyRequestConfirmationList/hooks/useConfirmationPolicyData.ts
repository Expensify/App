import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';

import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import usePolicyCategoriesForConfirmation from './usePolicyCategoriesForConfirmation';
import usePolicyTagsForConfirmation from './usePolicyTagsForConfirmation';

type UseConfirmationPolicyDataParams = {
    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Policy ID the confirmation was opened with, usually the report's */
    policyID?: string;

    action: IOUAction;
    iouType: IOUType;
    isPerDiemRequest: boolean;
};

/**
 * The policy side of the confirmation, resolved once for everything that reads the same workspace: the field
 * sections, the form-error machinery, the validation gate. Bundling the reads here keeps the four subscriptions
 * — the resolved policy, its categories and tags, and whether the user still has to pick a workspace — in one
 * place instead of four call sites the confirmation had to keep in sync.
 *
 * The reads themselves stay with their own subscription hooks (`usePolicyCategoriesForConfirmation` and friends),
 * which each own an Onyx key and are unit-tested on their own; this hook only composes them.
 */
function useConfirmationPolicyData({transaction, policyID, action, iouType, isPerDiemRequest}: UseConfirmationPolicyDataParams) {
    const policyCategories = usePolicyCategoriesForConfirmation(policyID);
    const {policyTags, policyTagLists} = usePolicyTagsForConfirmation(policyID);
    const {shouldSelectPolicy} = usePolicyForMovingExpenses();

    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyID,
        action,
        iouType,
        isPerDiemRequest,
    });

    return {policy, policyCategories, policyTags, policyTagLists, shouldSelectPolicy};
}

export default useConfirmationPolicyData;
