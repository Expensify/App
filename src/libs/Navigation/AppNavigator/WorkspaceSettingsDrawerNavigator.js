import React from 'react';

// Screens
import BaseDrawerNavigator from './baseDrawerNavigator';
import WorkspaceCardPage from '../../../pages/workspace/WorkspaceCardPage';
import WorkspaceSidebar from '../../../pages/workspace/WorkspaceSidebar';

const WorkspaceSettingsDrawerNavigator = () => (
    <BaseDrawerNavigator
        drawerContent={() => <WorkspaceSidebar />}
        screens={[
            {
                name: 'WorkspaceCard',
                component: WorkspaceCardPage,
                initialParams: {},
            }
        ]}
    />
);

WorkspaceSettingsDrawerNavigator.displayName = 'WorkspaceSettingsDrawerNavigator';

export default WorkspaceSettingsDrawerNavigator;
