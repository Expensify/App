import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import type {ListItemType} from '@components/WorkspaceMemberRoleList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useRedirectSubmitWorkspaceFeatureUpgrade from '@hooks/useRedirectSubmitWorkspaceFeatureUpgrade';
import {updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberManageRole} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

type WorkspaceMemberDetailsRolePageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE> & {
        /** Personal details of all users */
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkspaceMemberDetailsRolePage({policy, personalDetails, route}: WorkspaceMemberDetailsRolePageProps) {
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];
    const canManageSelectedMemberRole = canMemberManageRole(policy, currentUserLogin, member?.role);
    useRedirectSubmitWorkspaceFeatureUpgrade({
        policy,
        backTo: ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID),
        upgradeFeatureAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.alias,
    });

    const changeRole = ({value}: ListItemType) => {
        if (value === member?.role) {
            return;
        }
        if (!canMemberManageRole(policy, currentUserLogin, value)) {
            return;
        }
        updateWorkspaceMembersRole(policy, [memberLogin], [accountID], value);
        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canManageSelectedMemberRole}
        >
            <ScreenWrapper
                testID="WorkspaceMemberDetailsRolePage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <WorkspaceMemberRoleList
                    role={member?.role}
                    policy={policy}
                    onSelectRole={changeRole}
                    navigateBackTo={ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsRolePage);
