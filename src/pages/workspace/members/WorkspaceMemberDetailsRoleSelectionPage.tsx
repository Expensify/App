import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceMemberDetailsPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE_SELECTION>;

type ListItemType = {
    value: typeof CONST.POLICY.ROLE.ADMIN | typeof CONST.POLICY.ROLE.USER;
    text: string;
    isSelected: boolean;
    keyForList: typeof CONST.POLICY.ROLE.ADMIN | typeof CONST.POLICY.ROLE.USER;
};

function WorkspaceMemberDetailsRoleSelectionPage({policyMembers, route}: WorkspaceMemberDetailsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const accountID = Number(route.params.accountID) ?? 0;
    const policyID = route.params.policyID;
    const backTo = route.params.backTo ?? ('' as Route);
    const member = policyMembers?.[accountID];

    const items: ListItemType[] = [
        {
            value: CONST.POLICY.ROLE.ADMIN,
            text: translate('common.admin'),
            isSelected: member?.role === CONST.POLICY.ROLE.ADMIN,
            keyForList: CONST.POLICY.ROLE.ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.USER,
            text: translate('common.member'),
            isSelected: member?.role === CONST.POLICY.ROLE.USER,
            keyForList: CONST.POLICY.ROLE.USER,
        },
    ];

    const changeRole = ({value}: ListItemType) => {
        if (!member) {
            return;
        }

        Policy.updateWorkspaceMembersRole(route.params.policyID, [accountID], value);
        Navigation.goBack(backTo);
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper testID={WorkspaceMemberDetailsRoleSelectionPage.displayName}>
                    <HeaderWithBackButton
                        title={translate('common.role')}
                        onBackButtonPress={() => Navigation.goBack(backTo)}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                        <SelectionList
                            sections={[{data: items}]}
                            ListItem={RadioListItem}
                            onSelectRow={changeRole}
                            shouldDebounceRowSelect
                            initiallyFocusedOptionKey={items.find((item) => item.isSelected)?.keyForList}
                        />
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceMemberDetailsRoleSelectionPage.displayName = 'WorkspaceMemberDetailsRoleSelectionPage';

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsRoleSelectionPage);
