import React from 'react';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import WorkspaceInviteMessageComponent from './members/WorkspaceInviteMessageComponent';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type DynamicWorkspaceInviteMessagePageProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE>;

function DynamicWorkspaceInviteMessagePage({policy, route, currentUserPersonalDetails}: DynamicWorkspaceInviteMessagePageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_INVITE_MESSAGE.path);

    return (
        <WorkspaceInviteMessageComponent
            policy={policy}
            policyID={route.params.policyID}
            backTo={backPath}
            currentUserPersonalDetails={currentUserPersonalDetails}
        />
    );
}

export default withPolicyAndFullscreenLoading(withCurrentUserPersonalDetails(DynamicWorkspaceInviteMessagePage));
