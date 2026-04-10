import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {setMoneyRequestCategory} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {Policy, PolicyCategories, Transaction} from '@src/types/onyx';

type CategoryDefaultsSetterProps = {
    transactions: Transaction[];
    transactionIDs: string[];
    existingTransaction: OnyxEntry<Transaction>;
    policyCategories: OnyxEntry<PolicyCategories>;
    policy: OnyxEntry<Policy>;
    isDistanceRequest: boolean;
    requestType: string | undefined;
    isMovingTransactionFromTrackExpense: boolean;
};

/**
 * Side-effect-only component that handles two category-related effects:
 * 1. Resets cleared categories back to their last saved value
 * 2. Sets the default distance category for distance requests
 */
function CategoryDefaultsSetter({
    transactions,
    transactionIDs,
    existingTransaction,
    policyCategories,
    policy,
    isDistanceRequest,
    requestType,
    isMovingTransactionFromTrackExpense,
}: CategoryDefaultsSetterProps) {
    useEffect(() => {
        for (const item of transactions) {
            if (!item.category) {
                // If the expense had his category cleared due to unsaved changes (i.e. changing to recipient to one that does not have category)
                // then we should reset the category to it's last saved value
                const existingCategory = existingTransaction?.category;
                if (existingCategory) {
                    const isExistingCategoryEnabled = policyCategories?.[existingCategory]?.enabled;
                    if (isExistingCategoryEnabled) {
                        setMoneyRequestCategory(item.transactionID, existingCategory, policy);
                    }
                }
                continue;
            }
        }
        // We don't want to clear out category every time the transactions change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policy?.id, policyCategories, transactions.length]);

    const policyDistance = Object.values(policy?.customUnits ?? {}).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const defaultCategory = policyDistance?.defaultCategory ?? '';

    useEffect(() => {
        for (const item of transactions) {
            if (!isDistanceRequest || !!item?.category) {
                continue;
            }
            setMoneyRequestCategory(item.transactionID, defaultCategory, policy, isMovingTransactionFromTrackExpense);
        }
        // Prevent resetting to default when unselect category
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionIDs, requestType, defaultCategory, policy?.id]);

    return null;
}

CategoryDefaultsSetter.displayName = 'CategoryDefaultsSetter';

export default CategoryDefaultsSetter;
