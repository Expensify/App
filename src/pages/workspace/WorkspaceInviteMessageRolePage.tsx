import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceMemberRoleList from '@components/WorkspaceMemberRoleList';
import useOnyx from '@hooks/useOnyx';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {setWorkspaceInviteRoleDraft} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type WorkspaceInviteMessageRolePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE_ROLE>;

function WorkspaceInviteMessageRolePage({policy, route}: WorkspaceInviteMessageRolePageProps) {
    const [role = CONST.POLICY.ROLE.USER, roleResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${route.params.policyID}`, {
        canBeMissing: true,
    });
    const viewportOffsetTop = useViewportOffsetTop();
    const isOnyxLoading = isLoadingOnyxValue(roleResult);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                testID="WorkspaceInviteMessageRolePage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={{marginTop: viewportOffsetTop}}
            >
                <WorkspaceMemberRoleList
                    role={role}
                    policy={policy}
                    isLoading={isOnyxLoading}
                    onSelectRole={({value}) => {
                        setWorkspaceInviteRoleDraft(route.params.policyID, value);
                        Navigation.setNavigationActionToMicrotaskQueue(() => {
                            Navigation.goBack(route.params.backTo);
                        });
                    }}
                    navigateBackTo={route.params.backTo}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceInviteMessageRolePage);
