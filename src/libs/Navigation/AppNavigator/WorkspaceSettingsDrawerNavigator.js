import React from 'react';

// Screens
import BaseDrawerNavigator from './BaseDrawerNavigator';
import WorkspaceCardPage from '../../../pages/workspace/WorkspaceCardPage';
import WorkspacePeoplePage from '../../../pages/workspace/WorkspacePeoplePage';
import WorkspaceSidebar from '../../../pages/workspace/WorkspaceSidebar';

const WorkspaceSettingsDrawerNavigator = () => (
    <BaseDrawerNavigator
        // eslint-disable-next-line react/jsx-props-no-spreading
        drawerContent={props => <WorkspaceSidebar {...props} />}
        screens={[
            {
                name: 'WorkspaceCard',
                component: WorkspaceCardPage,
                initialParams: {},
            },
            {
                name: 'WorkspacePeople',
                component: WorkspacePeoplePage,
                initialParams: {},
            },
        ]}
    />
);

WorkspaceSettingsDrawerNavigator.displayName = 'WorkspaceSettingsDrawerNavigator';

export default WorkspaceSettingsDrawerNavigator;
