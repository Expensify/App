import React from 'react';

// Screens
import BaseDrawerNavigator from './baseDrawerNavigator';
import WorkspaceCardPage from '../../../pages/workspace/WorkspaceCardPage';
import WorkspacePeoplePage from '../../../pages/workspace/WorkspacePeoplePage';
import WorkspaceSidebar from '../../../pages/workspace/WorkspaceSidebar';

const WorkspaceSettingsDrawerNavigator = () => (
    <BaseDrawerNavigator
        drawerContent={() => <WorkspaceSidebar />}
        screens={[
            {
                name: 'WorkspaceCard',
                component: WorkspaceCardPage,
                initialParams: {},
            },
            {
                name: 'WorkspaceSettings_People',
                component: WorkspacePeoplePage,
                initialParams: {},
            },
        ]}
    />
);

WorkspaceSettingsDrawerNavigator.displayName = 'WorkspaceSettingsDrawerNavigator';

export default WorkspaceSettingsDrawerNavigator;
