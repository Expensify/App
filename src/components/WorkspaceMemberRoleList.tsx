import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getSelectableRoles} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import type {ConfirmButtonOptions, ListItem} from './SelectionList/types';

import FormHelpMessage from './FormHelpMessage';
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

    /** When provided, restricts the selectable roles to this set (e.g. an Authorized Payer may only be an Admin or Payments Admin) */
    allowedRoles?: Array<ValueOf<typeof CONST.POLICY.ROLE>>;

    /** When provided, the list confirms the pick with a button instead of applying it as soon as a row is pressed */
    confirmButtonOptions?: ConfirmButtonOptions<ListItemType>;

    /** Shown above the confirm button, for a confirmation pressed without a role picked */
    errorMessage?: string;
};

function WorkspaceMemberRoleList({
    role,
    policy,
    navigateBackTo = undefined,
    isLoading = false,
    onSelectRole = () => {},
    allowedRoles = undefined,
    confirmButtonOptions = undefined,
    errorMessage = '',
}: WorkspaceMemberRoleListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const workspaceRoles: ListItemType[] = [
        {
            value: CONST.POLICY.ROLE.ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.ADMIN),
            alternateText: translate('workspace.common.adminAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.ADMIN,
            keyForList: CONST.POLICY.ROLE.ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.AUDITOR,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.AUDITOR),
            alternateText: translate('workspace.common.auditorAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.AUDITOR,
            keyForList: CONST.POLICY.ROLE.AUDITOR,
        },
        {
            value: CONST.POLICY.ROLE.CARD_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.CARD_ADMIN),
            alternateText: translate('workspace.common.cardAdminAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.CARD_ADMIN,
            keyForList: CONST.POLICY.ROLE.CARD_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.PEOPLE_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.PEOPLE_ADMIN),
            alternateText: translate('workspace.common.peopleAdminAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.PEOPLE_ADMIN,
            keyForList: CONST.POLICY.ROLE.PEOPLE_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.PAYMENTS_ADMIN),
            alternateText: translate('workspace.common.paymentsAdminAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.PAYMENTS_ADMIN,
            keyForList: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.USER,
            text: translate('common.member'),
            alternateText: translate('workspace.common.memberAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.USER,
            keyForList: CONST.POLICY.ROLE.USER,
        },
    ];

    const selectableRoles = getSelectableRoles(policy, currentUserLogin, allowedRoles);
    const availableRoleItems: ListItemType[] = workspaceRoles.filter((item) => selectableRoles.includes(item.value));

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
                        confirmButtonOptions={confirmButtonOptions}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={availableRoleItems.find((item) => item.isSelected)?.keyForList}
                        addBottomSafeAreaPadding
                    >
                        {!!errorMessage && (
                            <View style={[styles.ph3, styles.mb3]}>
                                <FormHelpMessage
                                    isError
                                    message={errorMessage}
                                />
                            </View>
                        )}
                    </SelectionList>
                </View>
            )}
        </>
    );
}

export default WorkspaceMemberRoleList;
export type {ListItemType};
