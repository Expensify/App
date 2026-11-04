import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyTravelMemberAccess} from '@libs/actions/Policy/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberChangeTravelAccess, canMemberUseTravel, isWorkspaceProvisionedForTravel} from '@libs/PolicyUtils';
import {getTravelMemberAccessOptions} from '@libs/TravelMemberOptionUtils';
import type {TravelMemberOption} from '@libs/TravelMemberOptionUtils';
import {getMemberLoginByAccountID} from '@libs/WorkArrangementUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type WorkspaceMemberTravelSettingPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_TRAVEL_ACCESS> & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

/**
 * Changes whether one member can book travel, from their member details.
 */
function WorkspaceMemberTravelSettingPage({policy, personalDetails, route}: WorkspaceMemberTravelSettingPageProps) {
    const policyID = route.params.policyID;
    const accountID = Number(route.params.accountID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const memberLogin = personalDetails?.[accountID]?.login ?? getMemberLoginByAccountID(policy, accountID);
    const member = {email: memberLogin, accountID};
    // A member still being added has an optimistic accountID the server doesn't know yet
    const canChangeTravelSetting =
        canMemberChangeTravelAccess(policy, currentUserLogin, memberLogin) &&
        isWorkspaceProvisionedForTravel(policy?.travelSettings) &&
        !!policy?.employeeList?.[memberLogin] &&
        policy.employeeList[memberLogin]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    const canUseTravel = canMemberUseTravel(policy, memberLogin);

    const navigateBackToDetails = () => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    };

    const changeTravelAccess = ({value}: TravelMemberOption) => {
        if (canChangeTravelSetting) {
            setPolicyTravelMemberAccess(policy, [member], value);
        }
        navigateBackToDetails();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.TRAVEL}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canChangeTravelSetting}
        >
            <ScreenWrapper
                testID="WorkspaceMemberTravelSettingPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <Header>
                    <Header.BackButton onPress={navigateBackToDetails} />
                    <Header.Title title={translate('workspace.moreFeatures.travel.members.travelAccess')} />
                </Header>
                <View style={[styles.flex1]}>
                    <SelectionList
                        ListItem={SingleSelectListItem}
                        data={getTravelMemberAccessOptions(translate, canUseTravel)}
                        onSelectRow={changeTravelAccess}
                        shouldSingleExecuteRowSelect
                        shouldUpdateFocusedIndex
                        alternateNumberOfSupportedLines={2}
                        disableKeyboardShortcuts
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberTravelSettingPage);
