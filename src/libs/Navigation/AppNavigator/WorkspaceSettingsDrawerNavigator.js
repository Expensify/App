import React from 'react';

// Screens
import BaseDrawerNavigator from './BaseDrawerNavigator';
import WorkspaceCardPage from '../../../pages/workspace/workspaceCard/WorkspaceCardPage';
import WorkspaceMembersPage from '../../../pages/workspace/WorkspaceMembersPage';
import WorkspaceInitialPage from '../../../pages/workspace/WorkspaceInitialPage';

const WorkspaceSettingsDrawerNavigator = () => (
    <BaseDrawerNavigator
        // eslint-disable-next-line react/jsx-props-no-spreading
        drawerContent={props => <WorkspaceInitialPage {...props} />}
        screens={[
            {
                name: 'WorkspaceCard',
                component: WorkspaceCardPage,
                initialParams: {},
            },
            {
                name: 'WorkspacePeople',
                component: WorkspaceMembersPage,
                initialParams: {},
            },
        ]}
    />
);

WorkspaceSettingsDrawerNavigator.displayName = 'WorkspaceSettingsDrawerNavigator';

export default WorkspaceSettingsDrawerNavigator;
