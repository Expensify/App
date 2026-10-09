import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import type {ListItemType} from '@components/WorkspaceMemberRoleList';

import useApproveOnlyRoleBlockedModal from '@hooks/useApproveOnlyRoleBlockedModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useRedirectSubmitWorkspaceFeatureUpgrade from '@hooks/useRedirectSubmitWorkspaceFeatureUpgrade';
import useRuleBotGuardModal from '@hooks/useRuleBotGuardModal';

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
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const showRuleBotGuardModal = useRuleBotGuardModal();
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];
    const [selectedRole, setSelectedRole] = useState<ValueOf<typeof CONST.POLICY.ROLE>>();
    const canManageSelectedMemberRole = canMemberAssignRole(policy, currentUserLogin, member?.role);
    // The Authorized Payer (reimburser) must stay a valid payer, so restrict them to the roles that can pay (for example Admin or Payments Admin).
    const isReimburser = isPolicyReimburser(policy, memberLogin);
    const allowedRoles = getAllowedRolesForMember(policy, memberLogin);
    useRedirectSubmitWorkspaceFeatureUpgrade({
        policy,
        backTo: ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID),
        upgradeFeatureAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.alias,
    });

    const {showApproveOnlyBlockedModal, showRoleUpdateErrorModal} = useApproveOnlyRoleBlockedModal();

    const saveRole = () => {
        // The save button stays disabled until a different role is picked, so selectedRole is always set here.
        const value = selectedRole;
        if (!value || value === member?.role) {
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
        if (value === CONST.POLICY.ROLE.APPROVE_ONLY) {
            updateWorkspaceMembersRole(policy, [memberLogin], [accountID], value)
                .then((response) => {
                    const blockedReasons = response?.data?.blockedReasons ?? [];
                    if (blockedReasons.length > 0) {
                        showApproveOnlyBlockedModal(blockedReasons);
                        return;
                    }
                    // The action already set the failure on the member row, so only keep the user here to see the error modal.
                    if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                        showRoleUpdateErrorModal();
                        return;
                    }
                    Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
                })
                .catch(() => {
                    showRoleUpdateErrorModal();
                });
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
                    role={selectedRole ?? member?.role}
                    policy={policy}
                    onSelectRole={(item: ListItemType) => setSelectedRole(item.value)}
                    allowedRoles={allowedRoles}
                    navigateBackTo={ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)}
                />
                <FixedFooter addBottomSafeAreaPadding>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={saveRole}
                        isDisabled={!selectedRole || selectedRole === member?.role}
                    >
                        <Button.Text>{translate('common.save')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsRolePage);
