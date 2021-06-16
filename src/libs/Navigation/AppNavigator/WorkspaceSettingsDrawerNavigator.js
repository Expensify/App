import React from 'react';

// Screens
import BaseDrawerNavigator from './baseDrawerNavigator';
import WorkspaceCard from '../../../pages/workspace/WorkspaceCard';
import WorkspaceSidebar from '../../../pages/workspace/WorkspaceSidebar';

const WorkspaceSettingsDrawerNavigator = () => (
    <BaseDrawerNavigator
        drawerContent={() => <WorkspaceSidebar />}
        screens={[
            {
                name: 'WorkspaceCard',
                component: WorkspaceCard,
                initialParams: {},
            },
        ]}
    />
);

WorkspaceSettingsDrawerNavigator.displayName = 'WorkspaceSettingsDrawerNavigator';

export default WorkspaceSettingsDrawerNavigator;
