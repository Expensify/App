import TagPickerModal from '@components/TagPicker/TagPickerModal';
import TextWithTooltip from '@components/TextWithTooltip';
import type {EditableProps} from '@components/TransactionItemRow/EditableCell';
import {EditableCell, usePopoverEditState} from '@components/TransactionItemRow/EditableCell';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getTagGLCode, hasDependentTags} from '@libs/PolicyUtils';

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
 * there is no single value to pick — `canEditTag` already refuses them and the cell stays read-only there.
 */
function TagGLCodeCell({canEdit, onSave, shouldShowTooltip, transactionItem, policyID, policy: policyProp, policyTagLists}: TagGLCodeCellProps) {
    const styles = useThemeStyles();

    const [livePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policy = livePolicy ? {...policyProp, ...livePolicy} : policyProp;

    const policyHasDependentTags = hasDependentTags(policy, policyTags);
    const shouldShowGLCode = !!policy?.showTagGLCodes && !!policy?.glCodes;

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
                    shouldShowGLCode={shouldShowGLCode}
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
