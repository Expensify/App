/**
 * Adds workspace category creation only while an inline picker is mounted, keeping its subscriptions out of closed expense rows.
 */
import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type {CategoryPickerModalProps} from '@components/CategoryPicker/CategoryPickerModal';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import type {TransactionItemRowProps} from '@components/TransactionItemRow/types';

import useCreateAndApplyCategory from '@hooks/useCreateAndApplyCategory';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePolicyData from '@hooks/usePolicyData';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {canCreateCategoryInSitu} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import type {DistributedOmit} from 'type-fest';

import React from 'react';

type InlineCategoryPickerProps = DistributedOmit<CategoryPickerModalProps, 'onCreateCategory'> & {
    /** Receives the updated categories so inline validation includes the category just created. */
    onSave?: TransactionItemRowProps['onEditCategory'];
};

function InlineCategoryPickerContent({policyID, onSave, ...pickerProps}: InlineCategoryPickerProps) {
    const currentUser = useCurrentUserPersonalDetails();
    const [canAddCategory] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`, {
        selector: (policy) => canCreateCategoryInSitu(policy, currentUser.login),
    });
    const policyData = usePolicyData(canAddCategory ? policyID : undefined);
    const canCreateSearchedCategory = !!policyID && !!canAddCategory;
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

function InlineCategoryPicker(props: InlineCategoryPickerProps) {
    // Search snapshots may omit the workspace used to categorize an unreported expense.
    // Creation and disabled-category matching must use the same live data as permissions.
    return (
        <SearchScopeProvider isOnSearch={false}>
            <InlineCategoryPickerContent {...props} />
        </SearchScopeProvider>
    );
}

export default InlineCategoryPicker;
