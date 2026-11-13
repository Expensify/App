/**
 * Adds workspace category creation only while an inline picker is mounted, keeping its subscriptions out of closed expense rows.
 */
import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type {CategoryPickerModalProps} from '@components/CategoryPicker/CategoryPickerModal';
import type {TransactionItemRowProps} from '@components/TransactionItemRow/types';

import useCreateAndApplyCategory from '@hooks/useCreateAndApplyCategory';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import usePolicyData from '@hooks/usePolicyData';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {canCreateCategoryInSitu} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Creation permissions need the complete workspace, not a partial Search snapshot.
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

type InlineCategoryPickerProps = Omit<CategoryPickerModalProps, 'onCreateCategory'> & {
    /** Receives the updated categories so inline validation includes the category just created. */
    onSave?: TransactionItemRowProps['onEditCategory'];
};

function InlineCategoryPicker({policyID, onSave, ...pickerProps}: InlineCategoryPickerProps) {
    const currentUser = useCurrentUserPersonalDetails();
    const [canAddCategory] = useOnyxWithoutSnapshots(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`, {
        selector: (policy) => canCreateCategoryInSitu(policy, currentUser.login),
    });
    const policyData = usePolicyData(canAddCategory ? policyID : undefined);
    // A draft policy can have default categories; creating on it would replace them instead of updating a workspace.
    const canCreateSearchedCategory = !!policyID && !!canAddCategory && policyData.policy?.id === policyID;
    const createAndApplyCategory = useCreateAndApplyCategory({
        policyID,
        policyData,
        updateCategory: (category, categories) => {
            onSave?.(category, categories);
        },
    });

    return (
        <CategoryPickerModal
            {...pickerProps}
            policyID={policyID}
            onCreateCategory={canCreateSearchedCategory ? createAndApplyCategory : undefined}
        />
    );
}

export default InlineCategoryPicker;
