import {emailSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy, isPolicyAdmin, isSubmitPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import HeaderWithBackButton from './HeaderWithBackButton';
import SelectionList from './SelectionList';
import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from './SelectionList/types';

type ListItemType = ListItem<ValueOf<typeof CONST.POLICY.ROLE>> & {
    value: ValueOf<typeof CONST.POLICY.ROLE>;
    text: string;
    alternateText: string;
    isSelected: boolean;
};

type WorkspaceMemberRoleListProps = {
    role: string | undefined;
    policy: OnyxEntry<Policy>;
    navigateBackTo?: Route;
    isLoading?: boolean;
    onSelectRole?: (value: ListItemType) => void;
};

function WorkspaceMemberRoleList({role, policy, navigateBackTo = undefined, isLoading = false, onSelectRole = () => {}}: WorkspaceMemberRoleListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const canUseSubmit2026 = isBetaEnabled(CONST.BETAS.SUBMIT_2026);
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    const workspaceRoles: ListItemType[] = [
        {
            value: CONST.POLICY.ROLE.ADMIN,
            text: translate('common.admin'),
            alternateText: translate('workspace.common.adminAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.ADMIN,
            keyForList: CONST.POLICY.ROLE.ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.AUDITOR,
            text: translate('common.auditor'),
            alternateText: translate('workspace.common.auditorAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.AUDITOR,
            keyForList: CONST.POLICY.ROLE.AUDITOR,
        },
        {
            value: CONST.POLICY.ROLE.EDITOR,
            text: translate('common.editor'),
            alternateText: translate('workspace.common.editorAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.EDITOR,
            keyForList: CONST.POLICY.ROLE.EDITOR,
        },
        {
            value: CONST.POLICY.ROLE.USER,
            text: translate('common.member'),
            alternateText: translate('workspace.common.memberAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.USER,
            keyForList: CONST.POLICY.ROLE.USER,
        },
    ];

    const isPolicyControl = isControlPolicy(policy);
    const isPolicySubmit2026 = canUseSubmit2026 && isSubmitPolicy(policy);
    // Only strict admins can assign the ADMIN role. Editors (e.g. Submit workspace owners) can
    // invite/manage members but must not be able to escalate anyone to admin.
    const canAssignAdminRole = isPolicyAdmin(policy, currentUserEmail);
    const availableRoleItems: ListItemType[] = workspaceRoles
        .filter((item) => {
            if (item.value === CONST.POLICY.ROLE.AUDITOR && !isPolicyControl) {
                return false;
            }
            if (item.value === CONST.POLICY.ROLE.ADMIN && !canAssignAdminRole) {
                return false;
            }
            // Editor and Member are mutually exclusive across plan types: Submit workspaces only allow Editor
            // (Member would be a misleading no-op since the backend forces Editor), and other plans only allow
            // Member (Editor doesn't exist there).
            if ((item.value === CONST.POLICY.ROLE.EDITOR && !isPolicySubmit2026) || (item.value === CONST.POLICY.ROLE.USER && isPolicySubmit2026)) {
                return false;
            }
            return true;
        })
        // On Submit workspaces the only valid role is Editor — there's nothing to choose, so render the row
        // as read-only rather than letting the user tap a no-op selection.
        .map((item) => (isPolicySubmit2026 ? {...item, isInteractive: false} : item));

    return (
        <>
            <HeaderWithBackButton
                title={translate('common.role')}
                onBackButtonPress={() => Navigation.goBack(navigateBackTo)}
            />
            {!isLoading && (
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <SelectionList
                        data={availableRoleItems}
                        ListItem={SingleSelectListItem}
                        onSelectRow={onSelectRole}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={availableRoleItems.find((item) => item.isSelected)?.keyForList}
                        addBottomSafeAreaPadding
                        alternateNumberOfSupportedLines={2}
                    />
                </View>
            )}
        </>
    );
}

export default WorkspaceMemberRoleList;
export type {ListItemType};
