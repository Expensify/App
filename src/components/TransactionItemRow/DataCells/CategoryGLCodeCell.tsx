import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import {EditableCell, usePopoverEditState} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';
import type {ListItem} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCategoryGLCode, hasAnyCategoryGLCode, isCategoryMissing} from '@libs/CategoryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';

import React from 'react';

import type TransactionDataCellProps from './TransactionDataCellProps';

type CategoryGLCodeCellProps = TransactionDataCellProps &
    EditableProps<string> & {
        policyID?: string;
        policyCategories?: PolicyCategories;
    };

/**
 * A GL code belongs to the workspace category, not to the expense, so there is nothing on the expense to write.
 * Editing the cell therefore reassigns the expense to the category that owns the picked GL code, which is what makes
 * the category name update alongside it. The picker always lists each category with its GL code underneath, even when
 * the workspace hides GL codes in the regular category picker, because the code is what the user is picking here.
 * Codes shared by several categories stay distinguishable by name. When no category on the workspace has a GL code
 * there is nothing to pick, so the cell stays read-only.
 */
function CategoryGLCodeCell({shouldShowTooltip, transactionItem, canEdit: canEditCategory, onSave, policyID, policyCategories}: CategoryGLCodeCellProps) {
    const styles = useThemeStyles();
    const [categoriesLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_CATEGORIES_LOADING_STATE}${policyID}`);

    // On a lazy-loaded workspace `policyCategories` may hold only the expense's own category until the picker fetches
    // the full list, so "no GL codes" is only trusted after that fetch. Otherwise the picker never mounts and never
    // loads them.
    const canEdit = !!canEditCategory && (!categoriesLoadingState?.hasOnceLoaded || hasAnyCategoryGLCode(policyCategories));

    const categoryForComparison = isCategoryMissing(transactionItem?.category) ? '' : (transactionItem?.category ?? '');

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: categoryForComparison,
        onSave,
    });

    const handleCategorySelected = (item: ListItem) => {
        handleSave(item.keyForList);
    };

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            anchorRef={anchorRef}
            popoverContent={
                <CategoryPickerModal
                    policyID={policyID}
                    selectedCategory={categoryForComparison}
                    shouldAlwaysShowGLCode
                    searchInputThreshold={CONST.INLINE_EDIT_PICKER_SEARCH_INPUT_THRESHOLD}
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    shouldMeasureAnchorPositionFromTop={!isInverted}
                    onSelected={handleCategorySelected}
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip={shouldShowTooltip}
                text={getCategoryGLCode(policyCategories, transactionItem.category)}
                numberOfLines={1}
                style={[styles.lineHeightLarge, styles.justifyContentCenter]}
            />
        </EditableCell>
    );
}

export default CategoryGLCodeCell;
