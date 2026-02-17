import React, {useCallback} from 'react';
import CategoryPickerPopover from '@components/CategoryPicker/CategoryPickerPopover';
import TextWithIconCell from '@components/SelectionListWithSections/Search/TextWithIconCell';
import {EditableCell, usePopoverEditState} from '@components/Table/EditableCell';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

type CategoryCellProps = TransactionDataCellProps & {
    canEdit?: boolean;
    onSave?: (category: string) => void;
    policyID?: string;
};

function CategoryCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem, canEdit, onSave, policyID}: CategoryCellProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Folder']);
    const styles = useThemeStyles();
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, closePopover} = usePopoverEditState();

    const categoryForDisplay = isCategoryMissing(transactionItem?.category) ? '' : getDecodedCategoryName(transactionItem?.category ?? '');

    const handleCategorySelected = useCallback(
        (category: string) => {
            onSave?.(category);
            closePopover();
        },
        [onSave, closePopover],
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
                <CategoryPickerPopover
                    policyID={policyID}
                    selectedCategory={transactionItem?.category ?? ''}
                    isVisible={isPopoverVisible}
                    onClose={closePopover}
                    anchorRef={anchorRef}
                    anchorPosition={popoverPosition}
                    shouldPositionFromTop={!isInverted}
                    onCategorySelected={handleCategorySelected}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default CategoryCell;
