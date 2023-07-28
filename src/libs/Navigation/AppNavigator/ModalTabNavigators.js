import _ from 'underscore';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import styles from '../../../styles/styles';

const defaultScreenOptions = {
    cardStyle: styles.navigationScreenCardStyle,
    headerShown: false,
};

/**
 * Create a tab navigator with an array of sub-screens.
 *
 * @param {Object[]} screens array of screen config objects
 * @returns {Function}
 */
 function createModalTabNavigator(screens) {
    const TabNavigator = createBottomTabNavigator();
    return () => (
        <TabNavigator.Navigator tabBar={() => undefined} screenOptions={defaultScreenOptions}>
            {_.map(screens, (screen) => (
                <TabNavigator.Screen
                    key={screen.name}
                    name={screen.name}
                    getComponent={screen.getComponent}
                    initialParams={screen.initialParams}
                />
            ))}
        </TabNavigator.Navigator>
    );
}

// We use getComponent/require syntax so that file used by screens are not loaded until we need them.
const NewChatModalTabNavigator = createModalTabNavigator([
    {
        getComponent: () => {
            const NewChatPage = require('../../../pages/NewChatPage').default;
            return NewChatPage;
        },
        name: 'NewChat_Root',
    },
    {
        getComponent: () => {
            const WorkspaceNewRoomPage = require('../../../pages/workspace/WorkspaceNewRoomPage').default;
            return WorkspaceNewRoomPage;
        },
        name: 'Workspace_NewRoom',
    },
]);

export {
    // eslint-disable-next-line import/prefer-default-export
    NewChatModalTabNavigator,
};
