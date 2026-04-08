import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {setMoneyRequestCategory, setMoneyRequestTag} from '@libs/actions/IOU';
import {insertTagIntoTransactionTagsString} from '@libs/IOUUtils';
import {getTag} from '@libs/TransactionUtils';
import type {Policy, PolicyCategories, PolicyTagLists, Transaction} from '@src/types/onyx';

type FieldAutoSelectorProps = {
    transactionID: string | undefined;
    transaction: OnyxEntry<Transaction>;
    policyCategories: OnyxEntry<PolicyCategories>;
    policyTagLists: Array<ValueOf<PolicyTagLists>>;
    policyTags: OnyxEntry<PolicyTagLists>;
    policy: OnyxEntry<Policy>;
    shouldShowCategories: boolean;
    isCategoryRequired: boolean;
    iouCategory: string | undefined;
    isMovingTransactionFromTrackExpense: boolean;
};

/**
 * Side-effect-only component that auto-selects the only enabled category
 * and required single tags when the confirmation list mounts.
 */
function FieldAutoSelector({
    transactionID,
    transaction,
    policyCategories,
    policyTagLists,
    policyTags,
    policy,
    shouldShowCategories,
    isCategoryRequired,
    iouCategory,
    isMovingTransactionFromTrackExpense,
}: FieldAutoSelectorProps) {
    // Auto select the category if there is only one enabled category and it is required
    useEffect(() => {
        const enabledCategories = Object.values(policyCategories ?? {}).filter((category) => category.enabled);
        if (!transactionID || iouCategory || !shouldShowCategories || enabledCategories.length !== 1 || !isCategoryRequired) {
            return;
        }
        setMoneyRequestCategory(transactionID, enabledCategories.at(0)?.name ?? '', policy, isMovingTransactionFromTrackExpense);
        // Keep 'transaction' out to ensure that we auto select the option only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowCategories, policyCategories, isCategoryRequired, policy?.id]);

    // Auto select the tag if there is only one enabled tag and it is required
    useEffect(() => {
        if (!transactionID) {
            return;
        }

        let updatedTagsString = getTag(transaction);
        for (const [index, tagList] of policyTagLists.entries()) {
            const isTagListRequired = tagList.required ?? false;
            if (!isTagListRequired) {
                continue;
            }
            const enabledTags = Object.values(tagList.tags).filter((tag) => tag.enabled);
            if (enabledTags.length !== 1 || getTag(transaction, index)) {
                continue;
            }
            updatedTagsString = insertTagIntoTransactionTagsString(updatedTagsString, enabledTags.at(0)?.name ?? '', index, policy?.hasMultipleTagLists ?? false);
        }
        if (updatedTagsString !== getTag(transaction) && updatedTagsString) {
            setMoneyRequestTag(transactionID, updatedTagsString);
        }
        // Keep 'transaction' out to ensure that we auto select the option only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionID, policyTagLists, policyTags]);

    return null;
}

FieldAutoSelector.displayName = 'FieldAutoSelector';

export default FieldAutoSelector;
