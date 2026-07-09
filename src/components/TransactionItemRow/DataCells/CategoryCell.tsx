import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';
import type {ListItem} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import {EditableCell, usePopoverEditState} from '@components/TransactionItemRow/EditableCell';
import type {EditableProps} from '@components/TransactionItemRow/EditableCell';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedFullCategoryName, isCategoryMissing} from '@libs/CategoryUtils';

import React from 'react';

import type TransactionDataCellProps from './TransactionDataCellProps';

type CategoryCellProps = TransactionDataCellProps &
    EditableProps<string> & {
        policyID?: string;
    };

function CategoryCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem, canEdit, onSave, policyID}: CategoryCellProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Folder']);
    const styles = useThemeStyles();

    // For display: decoded category name for user-readable text
    const categoryForDisplay = isCategoryMissing(transactionItem?.category) ? '' : getDecodedFullCategoryName(transactionItem?.category ?? '');

    // For picker comparison: raw category name (empty if missing, matches IOURequestStepCategory)
    const categoryForComparison = isCategoryMissing(transactionItem?.category) ? '' : (transactionItem?.category ?? '');

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: categoryForComparison,
        onSave,
    });

    const handleCategorySelected = (item: ListItem) => {
        handleSave(item.keyForList);
    };

    const displayContent = shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={icons.Folder}
            showTooltip={shouldShowTooltip}
            text={categoryForDisplay}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={categoryForDisplay}
            numberOfLines={1}
            style={[styles.lineHeightLarge, styles.justifyContentCenter]}
        />
    );

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
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    shouldMeasureAnchorPositionFromTop={!isInverted}
                    onSelected={handleCategorySelected}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default CategoryCell;
