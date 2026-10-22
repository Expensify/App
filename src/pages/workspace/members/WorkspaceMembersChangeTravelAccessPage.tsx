import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import {setPolicyTravelMemberAccess, setPolicyTravelMemberRole} from '@libs/actions/Policy/Travel';
import type {TravelMemberAccessTarget} from '@libs/actions/Policy/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isPolicyAdmin, isWorkspaceProvisionedForTravel} from '@libs/PolicyUtils';
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
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

const TRAVEL_BULK_ACTIONS = {
    TURN_ON: 'turnOn',
    TURN_OFF: 'turnOff',
    MAKE_ADMINS: 'makeAdmins',
    MAKE_TRAVELERS: 'makeTravelers',
} as const;

type TravelBulkAction = ValueOf<typeof TRAVEL_BULK_ACTIONS>;

type TravelBulkActionOption = ListItem & {
    value: TravelBulkAction;
    text: string;
    alternateText: string;
};

type WorkspaceMembersChangeTravelAccessPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_CHANGE_TRAVEL_ACCESS> & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

/**
 * Changes travel access or the travel role of every member selected on the workspace members page. Access and role are
 * changed separately, so turning travel on keeps each member's travel role.
 */
function WorkspaceMembersChangeTravelAccessPage({policy, personalDetails, route}: WorkspaceMembersChangeTravelAccessPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selection, selectionMetadata] = useOnyx(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_BULK_EDIT);

    // Members picked on another workspace's member list are left out, even when they also belong to this one
    const selectedAccountIDs = selection?.policyID === policyID ? selection.accountIDs : undefined;

    // The selection only lives in memory, so it is gone when the page is opened from a link or after a refresh
    const hasSelectedMembers = isLoadingOnyxValue(selectionMetadata) || !!selectedAccountIDs?.length;
    const canChangeTravelAccess = isPolicyAdmin(policy) && isWorkspaceProvisionedForTravel(policy?.travelSettings);

    const selectedMembers: TravelMemberAccessTarget[] = (selectedAccountIDs ?? []).flatMap((accountID) => {
        const email = personalDetails?.[accountID]?.login ?? getMemberLoginByAccountID(policy, accountID);
        return email ? [{email, accountID}] : [];
    });

    const navigateBackToMembers = () => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    };

    const applyAction = ({value}: TravelBulkActionOption) => {
        if (!canChangeTravelAccess || selectedMembers.length === 0) {
            return;
        }

        if (value === TRAVEL_BULK_ACTIONS.TURN_ON || value === TRAVEL_BULK_ACTIONS.TURN_OFF) {
            setPolicyTravelMemberAccess(policy, selectedMembers, value === TRAVEL_BULK_ACTIONS.TURN_ON);
        } else {
            setPolicyTravelMemberRole(policy, selectedMembers, value === TRAVEL_BULK_ACTIONS.MAKE_ADMINS ? CONST.TRAVEL.MEMBER_ROLE.ADMIN : CONST.TRAVEL.MEMBER_ROLE.TRAVELER);
        }
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
    };

    const options: TravelBulkActionOption[] = [
        {
            value: TRAVEL_BULK_ACTIONS.TURN_ON,
            text: translate('workspace.moreFeatures.travel.members.turnOnTravel'),
            alternateText: translate('workspace.moreFeatures.travel.members.turnOnTravelDescription'),
            keyForList: TRAVEL_BULK_ACTIONS.TURN_ON,
        },
        {
            value: TRAVEL_BULK_ACTIONS.TURN_OFF,
            text: translate('workspace.moreFeatures.travel.members.turnOffTravel'),
            alternateText: translate('workspace.moreFeatures.travel.members.turnOffTravelDescription'),
            keyForList: TRAVEL_BULK_ACTIONS.TURN_OFF,
        },
        {
            value: TRAVEL_BULK_ACTIONS.MAKE_ADMINS,
            text: translate('workspace.moreFeatures.travel.members.makeTravelAdmins'),
            alternateText: translate('workspace.moreFeatures.travel.members.makeTravelAdminsDescription'),
            keyForList: TRAVEL_BULK_ACTIONS.MAKE_ADMINS,
        },
        {
            value: TRAVEL_BULK_ACTIONS.MAKE_TRAVELERS,
            text: translate('workspace.moreFeatures.travel.members.makeTravelers'),
            alternateText: translate('workspace.moreFeatures.travel.members.makeTravelersDescription'),
            keyForList: TRAVEL_BULK_ACTIONS.MAKE_TRAVELERS,
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
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
