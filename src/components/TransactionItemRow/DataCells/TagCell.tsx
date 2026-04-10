import React, {useMemo} from 'react';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';
import type {EditableProps} from '@components/Table/EditableCell';
import {EditableCell, usePopoverEditState} from '@components/Table/EditableCell';
import TagPickerModal from '@components/TagPicker/TagPickerModal';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasDependentTags} from '@libs/PolicyUtils';
import {getTagForDisplay} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type TransactionDataCellProps from './TransactionDataCellProps';

type TagCellProps = TransactionDataCellProps &
    EditableProps<string> & {
        policyID?: string;
    };

function TagCell({canEdit, onSave, shouldUseNarrowLayout, shouldShowTooltip, transactionItem, policyID}: TagCellProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Tag']);
    const styles = useThemeStyles();
    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing} = usePopoverEditState({canEdit});

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const policyHasDependentTags = useMemo(() => hasDependentTags(policy, policyTags), [policy, policyTags]);

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
                <TagPickerModal
                    policyID={policyID}
                    selectedTag={transactionItem?.tag ?? ''}
                    transactionTag={transactionItem?.tag}
                    hasDependentTags={policyHasDependentTags}
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
