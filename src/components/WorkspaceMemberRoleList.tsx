import {emailSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
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
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    const isPolicyControl = isControlPolicy(policy);
    const canAssignAdminRole = isPolicyAdmin(policy, currentUserEmail);

    const availableRoleItems: ListItemType[] = [];
    if (canAssignAdminRole) {
        availableRoleItems.push({
            value: CONST.POLICY.ROLE.ADMIN,
            text: translate('common.admin'),
            alternateText: translate('workspace.common.adminAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.ADMIN,
            keyForList: CONST.POLICY.ROLE.ADMIN,
        });
    }
    // Auditor only exists on Control workspaces.
    if (isPolicyControl) {
        availableRoleItems.push({
            value: CONST.POLICY.ROLE.AUDITOR,
            text: translate('common.auditor'),
            alternateText: translate('workspace.common.auditorAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.AUDITOR,
            keyForList: CONST.POLICY.ROLE.AUDITOR,
        });
    }
    // Editor only exists on Submit workspaces.
    if (isSubmitPolicy(policy)) {
        availableRoleItems.push({
            value: CONST.POLICY.ROLE.EDITOR,
            text: translate('common.editor'),
            alternateText: translate('workspace.common.editorAlternateText'),
            isSelected: role === CONST.POLICY.ROLE.EDITOR,
            keyForList: CONST.POLICY.ROLE.EDITOR,
        });
    }
    availableRoleItems.push({
        value: CONST.POLICY.ROLE.USER,
        text: translate('common.member'),
        alternateText: translate('workspace.common.memberAlternateText'),
        isSelected: role === CONST.POLICY.ROLE.USER,
        keyForList: CONST.POLICY.ROLE.USER,
    });

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
