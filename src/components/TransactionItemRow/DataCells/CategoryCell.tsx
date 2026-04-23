import React from 'react';
import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';
import type {ListItem} from '@components/SelectionList/types';
import {EditableCell, usePopoverEditState} from '@components/Table/EditableCell';
import type {EditableProps} from '@components/Table/EditableCell';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

type CategoryCellProps = TransactionDataCellProps &
    EditableProps<string> & {
        policyID?: string;
    };

function CategoryCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem, canEdit, onSave, policyID}: CategoryCellProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Folder']);
    const styles = useThemeStyles();
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing} = usePopoverEditState({canEdit});

    // For display: decoded category name for user-readable text
    const categoryForDisplay = isCategoryMissing(transactionItem?.category) ? '' : getDecodedCategoryName(transactionItem?.category ?? '');

    // For picker comparison: raw category name (empty if missing, matches IOURequestStepCategory)
    const categoryForComparison = isCategoryMissing(transactionItem?.category) ? '' : (transactionItem?.category ?? '');

    const handleCategorySelected = (item: ListItem) => {
        onSave?.(item.keyForList);
        cancelEditing();
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
