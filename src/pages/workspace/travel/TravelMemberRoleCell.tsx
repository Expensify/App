import {EditableCell, usePopoverEditState} from '@components/EditableCell';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import React from 'react';

import type {TravelMemberRole} from './TravelMemberRolePickerModal';

import TravelMemberRolePickerModal, {getTravelMemberRoleName, useTravelMemberRolePickerPopover} from './TravelMemberRolePickerModal';

type TravelMemberRoleCellProps = {
    role: TravelMemberRole;

    /** Whether the current user can change the member's travel role */
    canEdit: boolean;

    onSave: (role: TravelMemberRole) => void;
};

function TravelMemberRoleCell({role, canEdit, onSave}: TravelMemberRoleCellProps) {
    const {translate} = useLocalize();
    const {popoverHeight: preferredPopoverHeight} = useTravelMemberRolePickerPopover(role);

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, popoverHeight, anchorAlignment, shouldOpenAbove, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: role,
        onSave,
        popoverHeight: preferredPopoverHeight,
    });

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            anchorRef={anchorRef}
            popoverContent={
                <TravelMemberRolePickerModal
                    selectedRole={role}
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    anchorAlignment={anchorAlignment}
                    popoverHeight={popoverHeight}
                    shouldMeasureAnchorPositionFromTop={!shouldOpenAbove}
                    shouldSwitchPositionIfOverflow={false}
                    onSelected={handleSave}
                />
            }
        >
            <Text
                numberOfLines={1}
                selectable
                dataSet={COPYABLE_TEXT_DATA_SET}
            >
                {getTravelMemberRoleName(translate, role)}
            </Text>
        </EditableCell>
    );
}

export default TravelMemberRoleCell;
