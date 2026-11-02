import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import type {ListItem} from '@components/SelectionList/types';

import useOnyx from '@hooks/useOnyx';
import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type CategoryFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked value is written to */
    transactionID: string;

    /** Expense the picked category is written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Policy the categories belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Category the expense already holds, so the list can mark it */
    selectedCategory: string;
};

/**
 * The category list, anchored to the category row of a saved expense. Mounted only once the row is opened, and saves
 * through the same hook the full-page selector uses.
 */
function CategoryFieldDropdown({transactionID, transaction, transactionThreadReport, policy, selectedCategory, onClose, ...popoverProps}: CategoryFieldDropdownProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policy?.id)}`);

    const {updateCategory} = useUpdateTransactionCategory({
        transactionID,
        transaction,
        report: transactionThreadReport,
        policy,
        policyCategories,
        isEditing: true,
        isEditingSplit: false,
    });

    const handleSelected = (item: ListItem) => {
        // `CategoryPickerModal` hands back an empty item when the selected category is tapped again, clearing it.
        updateCategory(item.searchText ?? '');
    };

    return (
        <CategoryPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            policyID={policy?.id}
            selectedCategory={selectedCategory}
            onSelected={handleSelected}
        />
    );
}

export default CategoryFieldDropdown;
