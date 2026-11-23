import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';
import useRedirectSubmitWorkspaceFeatureUpgrade from '@hooks/useRedirectSubmitWorkspaceFeatureUpgrade';

import {setWorkspaceInviteRoleDraft} from '@libs/actions/Policy/Member';
import Log from '@libs/Log';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberAssignElevatedRole, canMemberAssignRole, canRoleCreateExpenses, EXPENSE_CREATOR_ROLES, goBackFromInvalidPolicy, isSubmitPolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React from 'react';

import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const CARD_INVITE_SCREENS = new Set<string>([SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER, SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW]);

function getRouteNameFromPath(path: Route): string | undefined {
    try {
        return findFocusedRoute(getStateFromPath(path))?.name;
    } catch (error) {
        Log.warn('[DynamicWorkspaceInviteMessageRolePage] Failed to resolve opener route from back path', {path, error});
        return undefined;
    }
}

type DynamicWorkspaceInviteMessageRolePageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE_ROLE>;

function DynamicWorkspaceInviteMessageRolePage({policy, route}: DynamicWorkspaceInviteMessageRolePageProps) {
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [roleFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${route.params.policyID}`);
    const previousRouteName = useNavigationState((state) => {
        const currentRouteIndex = state.routes.findIndex((stackRoute) => stackRoute.key === route.key);
        return currentRouteIndex > 0 ? state.routes.at(currentRouteIndex - 1)?.name : undefined;
    });
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_INVITE_MESSAGE_ROLE.path);
    const openerScreenName = previousRouteName ?? getRouteNameFromPath(backPath);
    // Cardholders must be able to create expenses, so card invite flows hide roles without that permission.
    const isCardInviteFlow = !!openerScreenName && CARD_INVITE_SCREENS.has(openerScreenName);
    const allowedRoles = isCardInviteFlow ? EXPENSE_CREATOR_ROLES : undefined;
    const selectedRoleFromOnyx = !isCardInviteFlow || canRoleCreateExpenses(roleFromOnyx) ? roleFromOnyx : undefined;
    // Submit workspaces only allow inviting editors. Keep this default aligned with WorkspaceInviteMessageComponent so the
    // role row pre-selects Editor before the user picks anything.
    const role = selectedRoleFromOnyx ?? (isSubmitPolicy(policy) ? CONST.POLICY.ROLE.EDITOR : CONST.POLICY.ROLE.USER);
    useRedirectSubmitWorkspaceFeatureUpgrade({
        policy,
        backTo: backPath,
        upgradeFeatureAlias: CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.alias,
    });

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canMemberAssignElevatedRole(policy, currentUserLogin)}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                testID="WorkspaceInviteMessageRolePage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <WorkspaceMemberRoleList
                    role={role}
                    policy={policy}
                    allowedRoles={allowedRoles}
                    onSelectRole={({value}) => {
                        if (!canMemberAssignRole(policy, currentUserLogin, value) || (allowedRoles && !allowedRoles.includes(value))) {
                            return;
                        }
                        setWorkspaceInviteRoleDraft(route.params.policyID, value);
                        Navigation.setNavigationActionToMicrotaskQueue(() => {
                            Navigation.goBack(backPath);
                        });
                    }}
                    navigateBackTo={backPath}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(DynamicWorkspaceInviteMessageRolePage);
