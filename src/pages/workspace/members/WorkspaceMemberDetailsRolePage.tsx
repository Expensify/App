import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import type {ListItemType} from '@components/WorkspaceMemberRoleList';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useRedirectSubmitWorkspaceFeatureUpgrade from '@hooks/useRedirectSubmitWorkspaceFeatureUpgrade';
import useRuleBotGuardModal from '@hooks/useRuleBotGuardModal';
import useSingleExecution from '@hooks/useSingleExecution';
import useWorkspaceMemberFromRoute from '@hooks/useWorkspaceMemberFromRoute';

import {updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
import {isRuleBotEnforcingRules} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAllowedRolesForMember, isPolicyReimburser} from '@libs/PolicyMemberRoleUtils';
import {canMemberAssignRole, canRolePay} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';

type WorkspaceMemberDetailsRolePageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE> & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkspaceMemberDetailsRolePage({policy, personalDetails, route}: WorkspaceMemberDetailsRolePageProps) {
    const routeAccountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const showRuleBotGuardModal = useRuleBotGuardModal();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {memberLogin, accountID} = useWorkspaceMemberFromRoute(policy, personalDetails, routeAccountID);
    const member = policy?.employeeList?.[memberLogin];
    const [selectedRole, setSelectedRole] = useState<ValueOf<typeof CONST.POLICY.ROLE>>();
    const canManageSelectedMemberRole = canMemberAssignRole(policy, currentUserLogin, member?.role);
    // The Authorized Payer (reimburser) must stay a valid payer, so restrict them to the roles that can pay (for example Admin or Payments Admin).
    const isReimburser = isPolicyReimburser(policy, memberLogin);
    const allowedRoles = getAllowedRolesForMember(policy, memberLogin);
    // Go back with the route's accountID so it matches the details screen below, which keeps the optimistic accountID it was opened with.
    const memberDetailsRoute = ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, routeAccountID);
    useRedirectSubmitWorkspaceFeatureUpgrade({
        policy,
        backTo: memberDetailsRoute,
        upgradeFeatureAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.alias,
    });

    const saveRole = () => {
        if (!selectedRole || selectedRole === member?.role) {
            return;
        }
        if (!canMemberAssignRole(policy, currentUserLogin, selectedRole)) {
            return;
        }
        // Guard the direct-navigation path: a reimburser must stay a valid payer, so reject any role that cannot pay.
        if (isReimburser && !canRolePay(selectedRole)) {
            return;
        }
        if (selectedRole !== CONST.POLICY.ROLE.ADMIN && isRuleBotEnforcingRules(accountID, policy)) {
            showRuleBotGuardModal('changeRole', policyID);
            return;
        }
        updateWorkspaceMembersRole(policy, [memberLogin], [accountID], selectedRole);
        Navigation.goBack(memberDetailsRoute);
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
                    role={selectedRole ?? member?.role}
                    policy={policy}
                    onSelectRole={(item: ListItemType) => setSelectedRole(item.value)}
                    allowedRoles={allowedRoles}
                    navigateBackTo={memberDetailsRoute}
                    confirmButtonOptions={{
                        showButton: true,
                        text: translate('common.save'),
                        onConfirm: singleExecution(saveRole),
                        isDisabled: !selectedRole || selectedRole === member?.role,
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsRolePage);
