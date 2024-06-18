import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {RestrictedActionParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceAdminRestrictedAction from './WorkspaceAdminRestrictedAction';
import WorkspaceOwnerRestrictedAction from './WorkspaceOwnerRestrictedAction';
import WorkspaceUserRestrictedAction from './WorkspaceUserRestrictedAction';

type WorkspaceRestrictedActionPageProps = StackScreenProps<RestrictedActionParamList, typeof SCREENS.RESTRICTED_ACTION_ROOT>;

function WorkspaceRestrictedActionPage({
    route: {
        params: {policyID},
    },
}: WorkspaceRestrictedActionPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const userRole = policy?.employeeList?.[session?.email ?? '']?.role;

    // Workspace Owner
    if (session?.accountID === policy?.ownerAccountID) {
        return <WorkspaceOwnerRestrictedAction />;
    }

    // Workspace Admin
    if (userRole === 'admin') {
        return <WorkspaceAdminRestrictedAction policyID={policyID} />;
    }

    // Workspace User
    if (userRole === 'user') {
        return <WorkspaceUserRestrictedAction policyID={policyID} />;
    }

    return <NotFoundPage />;
}

WorkspaceRestrictedActionPage.displayName = 'WorkspaceRestrictedActionPage';

export default WorkspaceRestrictedActionPage;
