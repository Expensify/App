/**
 * Inline-editable limit type cell for the workspace Expensify cards table. Opens a limit type
 * picker popover and saves through the caller's persistence handler.
 */
import {EditableCell, usePopoverEditState} from '@components/EditableCell';
import TextWithTooltip from '@components/TextWithTooltip';
import WorkspaceExpensifyCardLimitTypePickerModal from '@components/WorkspaceExpensifyCardLimitTypePickerModal';

import useLocalize from '@hooks/useLocalize';

import {getDefaultExpensifyCardLimitType, getTranslationKeyForLimitType} from '@libs/CardUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Card, Policy} from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type WorkspaceExpensifyCardLimitTypeCellProps = {
    limitType: CardLimitType | undefined;
    card: Card;
    policy: OnyxEntry<Policy>;
    canEdit?: boolean;
    onSave?: (limitType: CardLimitType | undefined) => void;
};

function WorkspaceExpensifyCardLimitTypeCell({limitType, card, policy, canEdit, onSave}: WorkspaceExpensifyCardLimitTypeCellProps) {
    const {translate} = useLocalize();
    const currentLimitType = limitType ?? getDefaultExpensifyCardLimitType(policy);
    const limitTypeLabel = translate(getTranslationKeyForLimitType(currentLimitType));

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: currentLimitType,
        onSave,
        popoverHeight: variables.optionRowHeight * Object.keys(CONST.EXPENSIFY_CARD.LIMIT_TYPES).length,
    });

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            anchorRef={anchorRef}
            popoverContent={
                <WorkspaceExpensifyCardLimitTypePickerModal
                    policy={policy}
                    card={card}
                    selectedLimitType={currentLimitType}
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    shouldMeasureAnchorPositionFromTop={!isInverted}
                    onSelected={(selectedLimitType) => {
                        handleSave(selectedLimitType);
                    }}
                />
            }
        >
            <TextWithTooltip
                shouldShowTooltip
                numberOfLines={1}
                text={limitTypeLabel}
            />
        </EditableCell>
    );
}

export default WorkspaceExpensifyCardLimitTypeCell;
