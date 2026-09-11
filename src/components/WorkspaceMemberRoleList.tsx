import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {canMemberAssignRole} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import type {LocalizedTranslate} from './LocaleContextProvider';
import type {ListItem} from './SelectionList/types';

import HeaderWithBackButton from './HeaderWithBackButton';
import SelectionList from './SelectionList';
import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';

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

    /** When provided, restricts the selectable roles to this set. */
    allowedRoles?: Array<ValueOf<typeof CONST.POLICY.ROLE>>;
};

/**
 * Roles a member can be assigned, in the same order as the role-selection page.
 * Filters by what the current user may assign and any extra restriction (for example an Authorized Payer).
 */
function getAssignableWorkspaceMemberRoleItems(
    translate: LocalizedTranslate,
    currentRole: string | undefined,
    policy: OnyxEntry<Policy>,
    currentUserLogin: string,
    allowedRoles?: Array<ValueOf<typeof CONST.POLICY.ROLE>>,
): ListItemType[] {
    const workspaceRoles: ListItemType[] = [
        {
            value: CONST.POLICY.ROLE.ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.ADMIN),
            alternateText: translate('workspace.common.adminAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.ADMIN,
            keyForList: CONST.POLICY.ROLE.ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.AUDITOR,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.AUDITOR),
            alternateText: translate('workspace.common.auditorAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.AUDITOR,
            keyForList: CONST.POLICY.ROLE.AUDITOR,
        },
        {
            value: CONST.POLICY.ROLE.CARD_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.CARD_ADMIN),
            alternateText: translate('workspace.common.cardAdminAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.CARD_ADMIN,
            keyForList: CONST.POLICY.ROLE.CARD_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.PEOPLE_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.PEOPLE_ADMIN),
            alternateText: translate('workspace.common.peopleAdminAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.PEOPLE_ADMIN,
            keyForList: CONST.POLICY.ROLE.PEOPLE_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.PAYMENTS_ADMIN),
            alternateText: translate('workspace.common.paymentsAdminAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.PAYMENTS_ADMIN,
            keyForList: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.USER,
            text: translate('common.member'),
            alternateText: translate('workspace.common.memberAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.USER,
            keyForList: CONST.POLICY.ROLE.USER,
        },
    ];

    return workspaceRoles.filter((item) => canMemberAssignRole(policy, currentUserLogin, item.value) && (!allowedRoles || allowedRoles.includes(item.value)));
}

function WorkspaceMemberRoleList({role, policy, navigateBackTo = undefined, isLoading = false, onSelectRole = () => {}, allowedRoles = undefined}: WorkspaceMemberRoleListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const availableRoleItems = getAssignableWorkspaceMemberRoleItems(translate, role, policy, currentUserLogin, allowedRoles);

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
                    />
                </View>
            )}
        </>
    );
}

export default WorkspaceMemberRoleList;
export {getAssignableWorkspaceMemberRoleItems};
export type {ListItemType};
