import type {EditableProps} from '@components/EditableCell';
import {EditableCell, usePopoverEditState} from '@components/EditableCell';
import TagPickerModal from '@components/TagPicker/TagPickerModal';
import TextWithTooltip from '@components/TextWithTooltip';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getTagGLCode, hasAnyTagGLCode, hasDependentTags} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists} from '@src/types/onyx';

import React from 'react';

import type TransactionDataCellProps from './TransactionDataCellProps';

type TagGLCodeCellProps = TransactionDataCellProps &
    EditableProps<string> & {
        policyID?: string;
        policy?: Policy;
        policyTagLists?: PolicyTagLists;
    };

/**
 * Same shape as `CategoryGLCodeCell`: the code lives on the workspace tag, so editing picks the tag that owns the
 * code rather than rewriting the code. Multi-level tags produce one code per level joined into a single string, so
 * there is no single value to pick. `canEditTag` already refuses them, so the cell stays read-only there. Like the
 * category cell, the picker always shows each tag's GL code, regardless of the workspace's tag GL code setting, and
 * the cell stays read-only when no tag on the workspace has a GL code.
 */
function TagGLCodeCell({canEdit: canEditTag, onSave, shouldShowTooltip, transactionItem, policyID, policy: policyProp, policyTagLists}: TagGLCodeCellProps) {
    const styles = useThemeStyles();
    const [tagsLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${policyID}`);

    // On a lazy-loaded workspace `policyTagLists` may hold only the expense's own tag until the picker fetches the full
    // list, so "no GL codes" is only trusted after that fetch. Otherwise the picker never mounts and never loads them.
    const canEdit = !!canEditTag && (!tagsLoadingState?.hasOnceLoaded || hasAnyTagGLCode(policyTagLists));

    const [livePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policy = livePolicy ? {...policyProp, ...livePolicy} : policyProp;

    const policyHasDependentTags = hasDependentTags(policy, policyTags);

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: transactionItem?.tag ?? '',
        onSave,
    });

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
                    shouldShowGLCode
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    shouldMeasureAnchorPositionFromTop={!isInverted}
                    onSelected={handleSave}
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip={shouldShowTooltip}
                text={getTagGLCode(policyTagLists, transactionItem.tag)}
                numberOfLines={1}
                style={[styles.lineHeightLarge, styles.justifyContentCenter]}
            />
        </EditableCell>
    );
}

export default TagGLCodeCell;
