import React from 'react';
import TextWithIconCell from '@components/SelectionListWithSections/Search/TextWithIconCell';
import type {EditableProps} from '@components/Table/EditableCell';
import {EditableCell, usePopoverEditState} from '@components/Table/EditableCell';
import TagPickerModal from '@components/TagPicker/TagPickerModal';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTagForDisplay} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

type TagCellProps = TransactionDataCellProps &
    EditableProps<string> & {
        policyID?: string;
    };

function TagCell({canEdit, onSave, shouldUseNarrowLayout, shouldShowTooltip, transactionItem, policyID}: TagCellProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Tag']);
    const styles = useThemeStyles();
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing} = usePopoverEditState();

    const handleTagSelected = (tag: string) => {
        onSave?.(tag);
        cancelEditing();
    };

    const tagForDisplay = getTagForDisplay(transactionItem);

    const displayContent = shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={icons.Tag}
            showTooltip={shouldShowTooltip}
            text={tagForDisplay}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={tagForDisplay}
            numberOfLines={2}
            style={[styles.lineHeightLarge, styles.preWrap, styles.justifyContentCenter]}
        />
    );

    return (
        <EditableCell
            canEdit={canEdit && !!policyID}
            isEditing={isEditing}
            onStartEditing={startEditing}
            anchorRef={anchorRef}
            popoverContent={
                <TagPickerModal
                    policyID={policyID}
                    selectedTag={transactionItem?.tag ?? ''}
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    shouldMeasureAnchorPositionFromTop={!isInverted}
                    onSelected={handleTagSelected}
                />
            }
        >
            {displayContent}
        </EditableCell>
    );
}

export default TagCell;
