import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import type {ListItemType} from '@components/WorkspaceMemberRoleList';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import useRedirectSubmitWorkspaceFeatureUpgrade from '@hooks/useRedirectSubmitWorkspaceFeatureUpgrade';
import useRuleBotGuardModal from '@hooks/useRuleBotGuardModal';

import {clearMembersSelectedForRoleChange, discardMembersSelectedForRoleChange, updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
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

import React, {useEffect, useRef, useState} from 'react';

type WorkspaceMembersRolePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_ROLE>;

function WorkspaceMembersRolePage({policy, route}: WorkspaceMembersRolePageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const showRuleBotGuardModal = useRuleBotGuardModal();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [selectedLogins, selectedLoginsMetadata] = useOnyx(ONYXKEYS.RAM_ONLY_WORKSPACE_MEMBERS_SELECTED_FOR_ROLE_CHANGE);
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));
    const memberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails, true);

    // A selection left behind by an earlier visit belongs to the workspace it was made on, so it is ignored here.
    const memberLogins = selectedLogins?.policyID === policyID ? selectedLogins.logins : [];
    const memberRoles = memberLogins.map((login) => policy?.employeeList?.[login]?.role);
    const canManageSelectedMemberRoles = memberRoles.every((role) => canMemberManageMemberWithRole(policy, currentUserLogin, role));

    // Only offer a role as already picked when the whole selection shares it, so a mixed selection starts with nothing
    // selected and the member has to make a deliberate choice.
    const sharedRole = memberRoles.length > 0 ? Object.values(CONST.POLICY.ROLE).find((role) => memberRoles.every((memberRole) => memberRole === role)) : undefined;
    const [draftRole, setDraftRole] = useState<ValueOf<typeof CONST.POLICY.ROLE>>();
    // Counted rather than flagged, so a Save pressed again with still nothing picked reads the error out again.
    const [rejectedSaveCount, setRejectedSaveCount] = useState(0);
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

    // Leaving without saving drops the selection, so coming back to this screen through history cannot apply a role to
    // members the table no longer has selected.
    const hasSaved = useRef(false);
    useEffect(
        () => () => {
            if (hasSaved.current) {
                return;
            }
            discardMembersSelectedForRoleChange();
        },
        [],
    );

    const saveAndGoBack = () => {
        if (!selectedRole) {
            setRejectedSaveCount((count) => count + 1);
            return;
        }

        const loginsToUpdate = memberLogins.filter((login) => policy?.employeeList?.[login]?.role !== selectedRole);
        const accountIDsToUpdate = loginsToUpdate.map((login) => memberEmailsToAccountIDs[login]).filter((accountID) => accountID !== undefined);

        if (loginsToUpdate.length > 0) {
            if (selectedRole !== CONST.POLICY.ROLE.ADMIN && loginsToUpdate.some((login) => isRuleBotEnforcingRules(memberEmailsToAccountIDs[login], policy))) {
                showRuleBotGuardModal('changeRole', policyID);
                return;
            }

            updateWorkspaceMembersRole(policy, loginsToUpdate, accountIDsToUpdate, selectedRole);
        }

        hasSaved.current = true;
        clearMembersSelectedForRoleChange(policyID);
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
                    onSelectRole={({value}: ListItemType) => {
                        setDraftRole(value);
                        setRejectedSaveCount(0);
                    }}
                    allowedRoles={allowedRoles}
                    navigateBackTo={ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)}
                    confirmButtonOptions={{
                        showButton: true,
                        text: translate('common.save'),
                        onConfirm: saveAndGoBack,
                    }}
                    errorMessage={rejectedSaveCount > 0 ? translate('common.error.pleaseSelectOne') : ''}
                    errorAnnouncementKey={rejectedSaveCount}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMembersRolePage);
