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

function WorkspaceRestrictedActionPage({route}: WorkspaceRestrictedActionPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`);

    // Workspace Owner
    if (session?.accountID === policy?.ownerAccountID) {
        return <WorkspaceOwnerRestrictedAction policyID={route.params.policyID} />;
    }

    // Workspace Admin
    if (policy?.employeeList?.[session?.email ?? '']?.role === 'admin') {
        return <WorkspaceAdminRestrictedAction policyID={route.params.policyID} />;
    }

    // Workspace User
    if (policy?.employeeList?.[session?.email ?? '']?.role === 'user') {
        return <WorkspaceUserRestrictedAction policyID={route.params.policyID} />;
    }

    return <NotFoundPage />;
}

WorkspaceRestrictedActionPage.displayName = 'WorkspaceRestrictedActionPage';

export default WorkspaceRestrictedActionPage;
