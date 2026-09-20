import {EditableCell, usePopoverEditState} from '@components/EditableCell';
import Text from '@components/Text';
import WorkspaceMemberRolePickerModal, {useWorkspaceMemberRolePickerPopover} from '@components/WorkspaceMemberRolePickerModal';

import useLocalize from '@hooks/useLocalize';

import {getAllowedRolesForMember} from '@libs/PolicyUtils';

import type CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';

type WorkspaceMemberRoleCellProps = {
    role: ValueOf<typeof CONST.POLICY.ROLE> | undefined;
    policy: OnyxEntry<Policy>;
    memberLogin: string;
    canEdit?: boolean;
    onSave?: (role: ValueOf<typeof CONST.POLICY.ROLE>) => void;
};

function WorkspaceMemberRoleCell({role, policy, memberLogin, canEdit, onSave}: WorkspaceMemberRoleCellProps) {
    const {translate} = useLocalize();
    const roleLabel = translate('workspace.common.roleName', role);
    const allowedRoles = getAllowedRolesForMember(policy, memberLogin);
    const {popoverHeight} = useWorkspaceMemberRolePickerPopover({policy, selectedRole: role, allowedRoles});

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: role,
        onSave,
        popoverHeight,
    });

    return (
        <EditableCell
            canEdit={canEdit}
            isEditing={isEditing}
            onStartEditing={startEditing}
            anchorRef={anchorRef}
            popoverContent={
                <WorkspaceMemberRolePickerModal
                    policy={policy}
                    selectedRole={role}
                    allowedRoles={allowedRoles}
                    isVisible={isPopoverVisible}
                    onClose={cancelEditing}
                    anchorPosition={popoverPosition}
                    shouldMeasureAnchorPositionFromTop={!isInverted}
                    onSelected={handleSave}
                />
            }
        >
            <Text numberOfLines={1}>{roleLabel}</Text>
        </EditableCell>
    );
}

export default WorkspaceMemberRoleCell;
