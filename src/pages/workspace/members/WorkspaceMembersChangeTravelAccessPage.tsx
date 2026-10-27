import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import {setPolicyTravelMemberAccess} from '@libs/actions/Policy/Travel';
import type {TravelMemberAccessTarget} from '@libs/actions/Policy/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberChangeTravelAccess, canMemberWrite, isWorkspaceProvisionedForTravel} from '@libs/PolicyUtils';
import {getMemberLoginByAccountID} from '@libs/WorkArrangementUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type TravelBulkActionOption = ListItem & {
    /** Whether choosing this option lets the selected members book travel. */
    value: boolean;
    text: string;
    alternateText: string;
};

type WorkspaceMembersChangeTravelAccessPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_CHANGE_TRAVEL_ACCESS> & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

/**
 * Turns travel on or off for every member selected on the workspace members page.
 */
function WorkspaceMembersChangeTravelAccessPage({policy, personalDetails, route}: WorkspaceMembersChangeTravelAccessPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [selection, selectionMetadata] = useOnyx(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_BULK_EDIT);

    // Members picked on another workspace's member list are left out, even when they also belong to this one
    const selectedAccountIDs = selection?.policyID === policyID ? selection.accountIDs : undefined;

    // The selection only lives in memory, so it is gone when the page is opened from a link or after a refresh
    const hasSelectedMembers = isLoadingOnyxValue(selectionMetadata) || !!selectedAccountIDs?.length;
    const canChangeTravelAccess = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.TRAVEL) && isWorkspaceProvisionedForTravel(policy?.travelSettings);

    // Members still being added have an optimistic accountID the server doesn't know yet, so they are left out, along
    // with anyone whose travel access this member can't change. Members without a loaded accountID never reach the selection.
    const selectedMembers: TravelMemberAccessTarget[] = (selectedAccountIDs ?? []).flatMap((accountID) => {
        const email = personalDetails?.[accountID]?.login ?? getMemberLoginByAccountID(policy, accountID);
        if (!email || policy?.employeeList?.[email]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || !canMemberChangeTravelAccess(policy, currentUserLogin, email)) {
            return [];
        }
        return [{email, accountID}];
    });

    const navigateBackToMembers = () => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    };

    const applyAction = ({value}: TravelBulkActionOption) => {
        if (!canChangeTravelAccess) {
            return;
        }

        // Every selected member can drop out of the list, for example by becoming an admin while this page is open
        if (selectedMembers.length === 0) {
            navigateBackToMembers();
            return;
        }

        setPolicyTravelMemberAccess(policy, selectedMembers, value);
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    };

    const options: TravelBulkActionOption[] = [
        {
            value: true,
            text: translate('workspace.moreFeatures.travel.members.turnOnTravel'),
            alternateText: translate('workspace.moreFeatures.travel.members.onDescription'),
            keyForList: 'turnOn',
        },
        {
            value: false,
            text: translate('workspace.moreFeatures.travel.members.turnOffTravel'),
            alternateText: translate('workspace.moreFeatures.travel.members.offDescription'),
            keyForList: 'turnOff',
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.TRAVEL}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canChangeTravelAccess || !hasSelectedMembers}
        >
            <ScreenWrapper
                testID="WorkspaceMembersChangeTravelAccessPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <Header>
                    <Header.BackButton onPress={navigateBackToMembers} />
                    <Header.Title title={translate('workspace.moreFeatures.travel.members.changeTravelAccess')} />
                </Header>
                <View style={[styles.flex1]}>
                    <SelectionList
                        ListItem={SingleSelectListItem}
                        data={options}
                        onSelectRow={applyAction}
                        shouldSingleExecuteRowSelect
                        alternateNumberOfSupportedLines={2}
                        disableKeyboardShortcuts
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMembersChangeTravelAccessPage);
