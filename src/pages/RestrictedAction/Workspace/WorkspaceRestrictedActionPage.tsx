import React from 'react';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RestrictedActionParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceAdminRestrictedAction from './WorkspaceAdminRestrictedAction';
import WorkspaceOwnerRestrictedAction from './WorkspaceOwnerRestrictedAction';
import WorkspaceUserRestrictedAction from './WorkspaceUserRestrictedAction';

type WorkspaceRestrictedActionPageProps = PlatformStackScreenProps<RestrictedActionParamList, typeof SCREENS.RESTRICTED_ACTION_ROOT>;

function WorkspaceRestrictedActionPage({
    route: {
        params: {policyID},
    },
}: WorkspaceRestrictedActionPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const policy = usePolicy(policyID);

    // Workspace Owner
    if (PolicyUtils.isPolicyOwner(policy, session?.accountID ?? -1)) {
        return <WorkspaceOwnerRestrictedAction />;
    }

    // Workspace Admin
    if (PolicyUtils.isPolicyAdmin(policy, session?.email)) {
        return <WorkspaceAdminRestrictedAction policyID={policyID} />;
    }

    // Workspace User
    if (PolicyUtils.isPolicyUser(policy, session?.email)) {
        return <WorkspaceUserRestrictedAction policyID={policyID} />;
    }

    return <NotFoundPage />;
}

export default WorkspaceRestrictedActionPage;
