import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import type {ListItemType} from '@components/WorkspaceMemberRoleList';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import useRedirectSubmitWorkspaceFeatureUpgrade from '@hooks/useRedirectSubmitWorkspaceFeatureUpgrade';
import useRuleBotGuardModal from '@hooks/useRuleBotGuardModal';

import {clearMembersSelectedForRoleChange, updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
import {isRuleBotEnforcingRules} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberManageMemberWithRole, getMemberAccountIDsForWorkspace, getReimburserEmail, PAYER_ROLES} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ValueOf} from 'type-fest';

import React, {useEffect, useState} from 'react';

type WorkspaceMembersRolePageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_ROLE>;

function WorkspaceMembersRolePage({policy, route}: WorkspaceMembersRolePageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const showRuleBotGuardModal = useRuleBotGuardModal();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [selectedLogins, selectedLoginsMetadata] = useOnyx(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_ROLE_CHANGE);
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));
    const memberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails, true);

    const memberLogins = selectedLogins ?? [];
    const memberRoles = memberLogins.map((login) => policy?.employeeList?.[login]?.role);
    const canManageSelectedMemberRoles = memberRoles.every((role) => canMemberManageMemberWithRole(policy, currentUserLogin, role));

    // Only offer a role as already picked when the whole selection shares it, so a mixed selection starts with nothing
    // selected and the member has to make a deliberate choice.
    const sharedRole = memberRoles.every((role) => role === memberRoles.at(0)) ? memberRoles.at(0) : undefined;
    const [draftRole, setDraftRole] = useState<ValueOf<typeof CONST.POLICY.ROLE>>();
    const selectedRole = draftRole ?? sharedRole;

    // The Authorized Payer (reimburser) must stay a valid payer, so restrict the whole selection to the roles that can pay once it includes them.
    const reimburserEmail = getReimburserEmail(policy);
    const hasReimburser = !!reimburserEmail && memberLogins.includes(reimburserEmail);
    const allowedRoles = hasReimburser ? [...PAYER_ROLES] : undefined;

    useRedirectSubmitWorkspaceFeatureUpgrade({
        policy,
        backTo: ROUTES.WORKSPACE_MEMBERS.getRoute(policyID),
        upgradeFeatureAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.alias,
    });

    // The selection only lives in memory, so a reload or a deep link landing here directly has nothing to act on.
    const isSelectionLoading = isLoadingOnyxValue(selectedLoginsMetadata);
    const memberCount = memberLogins.length;
    useEffect(() => {
        if (isSelectionLoading || memberCount > 0) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    }, [isSelectionLoading, memberCount, policyID]);

    const saveAndGoBack = () => {
        if (!selectedRole) {
            return;
        }

        if (selectedRole !== CONST.POLICY.ROLE.ADMIN && memberLogins.some((login) => isRuleBotEnforcingRules(memberEmailsToAccountIDs[login], policy))) {
            showRuleBotGuardModal('changeRole', policyID);
            return;
        }

        const loginsToUpdate = memberLogins.filter((login) => policy?.employeeList?.[login]?.role !== selectedRole);
        const accountIDsToUpdate = loginsToUpdate.map((login) => memberEmailsToAccountIDs[login]).filter((accountID) => accountID !== undefined);

        updateWorkspaceMembersRole(policy, loginsToUpdate, accountIDsToUpdate, selectedRole);
        clearMembersSelectedForRoleChange();
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={memberCount > 0 && !canManageSelectedMemberRoles}
        >
            <ScreenWrapper
                testID="WorkspaceMembersRolePage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <WorkspaceMemberRoleList
                    role={selectedRole}
                    policy={policy}
                    onSelectRole={({value}: ListItemType) => setDraftRole(value)}
                    allowedRoles={allowedRoles}
                    navigateBackTo={ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)}
                    confirmButtonOptions={{
                        showButton: true,
                        text: translate('common.save'),
                        onConfirm: saveAndGoBack,
                        isDisabled: !selectedRole || selectedRole === sharedRole,
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMembersRolePage);
