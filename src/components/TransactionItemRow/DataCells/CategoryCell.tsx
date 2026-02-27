import React, {useCallback} from 'react';
import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type {ListItem} from '@components/SelectionList/types';
import TextWithIconCell from '@components/SelectionListWithSections/Search/TextWithIconCell';
import {EditableCell, usePopoverEditState} from '@components/Table/EditableCell';
import type {EditableProps} from '@components/Table/EditableCell/types';
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
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing} = usePopoverEditState({
        anchorEdge: 'left',
    });

    const categoryForDisplay = isCategoryMissing(transactionItem?.category) ? '' : getDecodedCategoryName(transactionItem?.category ?? '');

    const handleCategorySelected = useCallback(
        (item: ListItem) => {
            if (item.keyForList) {
                onSave?.(String(item.keyForList));
            }
            cancelEditing();
        },
        [onSave, cancelEditing],
    );

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
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}
        />
    );

    return (
        <EditableCell
            canEdit={canEdit && !!policyID}
            isEditing={isEditing}
            onStartEditing={startEditing}
            anchorRef={anchorRef}
            popoverContent={
                <CategoryPickerModal
                    policyID={policyID}
                    selectedCategory={transactionItem?.category ?? ''}
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    shouldPositionFromTop={!isInverted}
                    onSelected={handleCategorySelected}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default CategoryCell;
