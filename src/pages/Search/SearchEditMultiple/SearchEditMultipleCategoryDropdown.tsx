import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import type {ListItem} from '@components/SelectionList/types';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';

import React from 'react';

import {getBulkEditCategoryChange} from './SearchEditMultipleUtils';

type SearchEditMultipleCategoryDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** Workspace the categories belong to */
    policyID: string | undefined;

    /** Category the draft already holds, so the list can mark it */
    selectedCategory: string;
};

/**
 * The category list, in the container anchored to the bulk edit form's category row. Mounted only once the row is
 * opened, and records the pick on the draft the same way the full-page selector does.
 */
function SearchEditMultipleCategoryDropdown({policyID, selectedCategory, onClose, ...popoverProps}: SearchEditMultipleCategoryDropdownProps) {
    const saveCategory = (item: ListItem) => {
        // The list hands back an empty item when the picked category is tapped again, which drops the pending change.
        updateBulkEditDraftTransaction(getBulkEditCategoryChange(item.searchText ?? '', selectedCategory));
    };

    return (
        <CategoryPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            policyID={policyID}
            selectedCategory={selectedCategory}
            onSelected={saveCategory}
        />
    );
}

export default SearchEditMultipleCategoryDropdown;
