import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type {DropdownFieldRenderProps} from '@components/DropdownField';
import type {ListItem} from '@components/SelectionList/types';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';

import React from 'react';

import {getBulkEditCategoryChange} from './SearchEditMultipleUtils';

type SearchEditMultipleCategoryDropdownProps = DropdownFieldRenderProps & {
    /** Workspace the categories belong to */
    policyID: string | undefined;

    /** Category the draft already holds, so the list can mark it */
    selectedCategory: string;

    /** The current user, passed when every selected expense is theirs, so the list shows just the categories they can use */
    ownerAccountID?: number;

    /** The member who owns every selected expense, passed when that's someone else, so the list is split by what they can use */
    submitterAccountID?: number;
};

/**
 * The category list, in the container anchored to the bulk edit form's category row. Mounted only once the row is
 * opened, and records the pick on the draft the same way the full-page selector does.
 */
function SearchEditMultipleCategoryDropdown({policyID, selectedCategory, ownerAccountID, submitterAccountID, onClose, ...popoverProps}: SearchEditMultipleCategoryDropdownProps) {
    const saveCategory = (item: ListItem) => {
        // The list hands back an empty item when the picked category is tapped again, which drops the pending change.
        updateBulkEditDraftTransaction(getBulkEditCategoryChange(item.searchText ?? '', selectedCategory));
    };

    return (
        <CategoryPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            shouldShowHeader
            policyID={policyID}
            selectedCategory={selectedCategory}
            onSelected={saveCategory}
            ownerAccountID={ownerAccountID}
            submitterAccountID={submitterAccountID}
        />
    );
}

export default SearchEditMultipleCategoryDropdown;
