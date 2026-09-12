import {EditableCell, usePopoverEditState} from '@components/EditableCell';
import Text from '@components/Text';
import WorkspaceMemberRolePickerModal from '@components/WorkspaceMemberRolePickerModal';

import useLocalize from '@hooks/useLocalize';

import {getAllowedRolesForMember} from '@libs/PolicyUtils';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type WorkspaceMemberRoleCellProps = {
    role: string | undefined;
    policy: OnyxEntry<Policy>;
    memberLogin: string;
    canEdit?: boolean;
    onSave?: (role: string | undefined) => void;
};

function WorkspaceMemberRoleCell({role, policy, memberLogin, canEdit, onSave}: WorkspaceMemberRoleCellProps) {
    const {translate} = useLocalize();
    const roleLabel = translate('workspace.common.roleName', role);

    const {isEditing, anchorRef, isPopoverVisible, popoverPosition, isInverted, startEditing, cancelEditing, handleSave} = usePopoverEditState({
        canEdit,
        value: role,
        onSave,
    });

    const allowedRoles = getAllowedRolesForMember(policy, memberLogin);

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
                    onSelected={(selectedRole) => {
                        handleSave(selectedRole);
                    }}
                />
            }
        >
            <Text numberOfLines={1}>{roleLabel}</Text>
        </EditableCell>
    );
}

export default WorkspaceMemberRoleCell;
