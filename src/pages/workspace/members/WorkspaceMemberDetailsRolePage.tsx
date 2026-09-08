import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import type {ListItemType} from '@components/WorkspaceMemberRoleList';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useRedirectSubmitWorkspaceFeatureUpgrade from '@hooks/useRedirectSubmitWorkspaceFeatureUpgrade';
import useRuleBotGuardModal from '@hooks/useRuleBotGuardModal';

import {updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
import {isRuleBotEnforcingRules} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberAssignRole, canRolePay, getReimburserEmail, PAYER_ROLES} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type WorkspaceMemberDetailsRolePageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE> & {
        /** Personal details of all users */
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkspaceMemberDetailsRolePage({policy, personalDetails, route}: WorkspaceMemberDetailsRolePageProps) {
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const showRuleBotGuardModal = useRuleBotGuardModal();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];
    const canManageSelectedMemberRole = canMemberAssignRole(policy, currentUserLogin, member?.role);
    // The Authorized Payer (reimburser) must stay a valid payer, so restrict them to the roles that can pay (for example Admin or Payments Admin).
    const reimburserEmail = getReimburserEmail(policy);
    const isReimburser = !!reimburserEmail && reimburserEmail === memberLogin;
    const allowedRoles = isReimburser ? [...PAYER_ROLES] : undefined;
    useRedirectSubmitWorkspaceFeatureUpgrade({
        policy,
        backTo: ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID),
        upgradeFeatureAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.alias,
    });

    const changeRole = ({value}: ListItemType) => {
        if (value === member?.role) {
            return;
        }
        if (!canMemberAssignRole(policy, currentUserLogin, value)) {
            return;
        }
        // Guard the direct-navigation path: a reimburser must stay a valid payer, so reject any role that cannot pay.
        if (isReimburser && !canRolePay(value)) {
            return;
        }
        if (value !== CONST.POLICY.ROLE.ADMIN && isRuleBotEnforcingRules(accountID, policy)) {
            showRuleBotGuardModal('changeRole', policyID);
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
                    allowedRoles={allowedRoles}
                    navigateBackTo={ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsRolePage);
