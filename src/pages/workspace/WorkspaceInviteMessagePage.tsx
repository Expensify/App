import React from 'react';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';
import WorkspaceInviteMessageComponent from './members/WorkspaceInviteMessageComponent';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type WorkspaceInviteMessagePageProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE>;

function WorkspaceInviteMessagePage({policy, route, currentUserPersonalDetails}: WorkspaceInviteMessagePageProps) {
    return (
        <WorkspaceInviteMessageComponent
            policy={policy}
            policyID={route.params.policyID}
            backTo={route.params.backTo}
            currentUserPersonalDetails={currentUserPersonalDetails}
        />
    );
}

export default withPolicyAndFullscreenLoading(withCurrentUserPersonalDetails(WorkspaceInviteMessagePage));
