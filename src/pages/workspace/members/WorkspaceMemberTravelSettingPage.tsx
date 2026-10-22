import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyTravelMemberAccess, setPolicyTravelMemberRole} from '@libs/actions/Policy/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberUseTravel, getTravelMemberRole, isPolicyAdmin, isWorkspaceProvisionedForTravel} from '@libs/PolicyUtils';
import {getTravelMemberRoleOptions, isTravelMemberRole} from '@libs/TravelMemberOptionUtils';
import type {TravelMemberOption} from '@libs/TravelMemberOptionUtils';
import {getMemberLoginByAccountID} from '@libs/WorkArrangementUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type TravelAccessOption = ListItem & {
    /** Whether choosing this option lets the member book travel. */
    value: boolean;
    text: string;
    alternateText: string;
    isSelected: boolean;
};

type WorkspaceMemberTravelSettingPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    (
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_TRAVEL_ACCESS>
        | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_TRAVEL_ROLE>
    ) & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

/**
 * Changes one member's travel access or travel role from their member details. The travel role route shows the role
 * picker, and the travel access route shows whether the member can book travel.
 */
function WorkspaceMemberTravelSettingPage({policy, personalDetails, route}: WorkspaceMemberTravelSettingPageProps) {
    const isTravelRolePage = route.name === SCREENS.WORKSPACE.MEMBER_TRAVEL_ROLE;
    const policyID = route.params.policyID;
    const accountID = Number(route.params.accountID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const memberLogin = personalDetails?.[accountID]?.login ?? getMemberLoginByAccountID(policy, accountID);
    const member = {email: memberLogin, accountID};
    const canChangeTravelSetting = isPolicyAdmin(policy) && isWorkspaceProvisionedForTravel(policy?.travelSettings) && !!policy?.employeeList?.[memberLogin];
    const canUseTravel = canMemberUseTravel(policy, memberLogin);
    const travelRole = getTravelMemberRole(policy, memberLogin);

    const navigateBackToDetails = () => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    };

    const changeTravelRole = ({value}: TravelMemberOption) => {
        if (canChangeTravelSetting && isTravelMemberRole(value)) {
            setPolicyTravelMemberRole(policy, [member], value);
        }
        navigateBackToDetails();
    };

    const changeTravelAccess = ({value}: TravelAccessOption) => {
        if (canChangeTravelSetting) {
            setPolicyTravelMemberAccess(policy, [member], value);
        }
        navigateBackToDetails();
    };

    const travelAccessOptions: TravelAccessOption[] = [
        {
            value: true,
            text: translate('workspace.moreFeatures.travel.members.on'),
            alternateText: translate('workspace.moreFeatures.travel.members.onDescription'),
            isSelected: canUseTravel,
            keyForList: 'on',
        },
        {
            value: false,
            text: translate('workspace.moreFeatures.travel.members.off'),
            alternateText: translate('workspace.moreFeatures.travel.members.offDescription'),
            isSelected: !canUseTravel,
            keyForList: 'off',
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canChangeTravelSetting}
        >
            <ScreenWrapper
                testID="WorkspaceMemberTravelSettingPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <Header>
                    <Header.BackButton onPress={navigateBackToDetails} />
                    <Header.Title title={translate(isTravelRolePage ? 'workspace.moreFeatures.travel.members.travelRole' : 'workspace.moreFeatures.travel.members.travelAccess')} />
                </Header>
                <View style={[styles.flex1]}>
                    {isTravelRolePage ? (
                        <SelectionList
                            ListItem={SingleSelectListItem}
                            data={getTravelMemberRoleOptions(translate, travelRole)}
                            onSelectRow={changeTravelRole}
                            shouldSingleExecuteRowSelect
                            shouldUpdateFocusedIndex
                            alternateNumberOfSupportedLines={2}
                            disableKeyboardShortcuts
                        />
                    ) : (
                        <SelectionList
                            ListItem={SingleSelectListItem}
                            data={travelAccessOptions}
                            onSelectRow={changeTravelAccess}
                            shouldSingleExecuteRowSelect
                            shouldUpdateFocusedIndex
                            alternateNumberOfSupportedLines={2}
                            disableKeyboardShortcuts
                        />
                    )}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberTravelSettingPage);
