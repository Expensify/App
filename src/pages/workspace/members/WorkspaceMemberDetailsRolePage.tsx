import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isControlPolicy} from '@libs/PolicyUtils';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';
import AccessOrNotFoundWrapper from '../AccessOrNotFoundWrapper';

type ListItemType = ListItem<ValueOf<typeof CONST.POLICY.ROLE>> & {
    value: ValueOf<typeof CONST.POLICY.ROLE>;
    text: string;
    alternateText: string;
    isSelected: boolean;
};

type WorkspaceMemberDetailsRolePageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE> & {
        /** Personal details of all users */
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkspaceMemberDetailsRolePage({policy, personalDetails, route}: WorkspaceMemberDetailsRolePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];

    const roleItems: ListItemType[] = useMemo(() => {
        const items: ListItemType[] = [
            {
                value: CONST.POLICY.ROLE.ADMIN,
                text: translate('common.admin'),
                alternateText: translate('workspace.common.adminAlternateText'),
                isSelected: member?.role === CONST.POLICY.ROLE.ADMIN,
                keyForList: CONST.POLICY.ROLE.ADMIN,
            },
            {
                value: CONST.POLICY.ROLE.AUDITOR,
                text: translate('common.auditor'),
                alternateText: translate('workspace.common.auditorAlternateText'),
                isSelected: member?.role === CONST.POLICY.ROLE.AUDITOR,
                keyForList: CONST.POLICY.ROLE.AUDITOR,
            },
            {
                value: CONST.POLICY.ROLE.USER,
                text: translate('common.member'),
                alternateText: translate('workspace.common.memberAlternateText'),
                isSelected: member?.role === CONST.POLICY.ROLE.USER,
                keyForList: CONST.POLICY.ROLE.USER,
            },
        ];

        if (isControlPolicy(policy)) {
            return items;
        }
        return member?.role === CONST.POLICY.ROLE.AUDITOR ? items : items.filter((item) => item.value !== CONST.POLICY.ROLE.AUDITOR);
    }, [member?.role, translate, policy]);

    const changeRole = useCallback(
        ({value}: ListItemType) => {
            if (value === member?.role) {
                return;
            }
            updateWorkspaceMembersRole(policyID, [memberLogin], [accountID], value);
            Navigation.goBack();
        },
        [accountID, member?.role, memberLogin, policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID={WorkspaceMemberDetailsRolePage.displayName}
                includePaddingTop={false}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton title={translate('common.role')} />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <SelectionList
                        data={roleItems}
                        ListItem={RadioListItem}
                        onSelectRow={changeRole}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedItemKey={roleItems.find((item) => item.isSelected)?.keyForList}
                        addBottomSafeAreaPadding
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceMemberDetailsRolePage.displayName = 'WorkspaceMemberDetailsRolePage';

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsRolePage);
