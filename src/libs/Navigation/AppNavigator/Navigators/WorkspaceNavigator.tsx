/**
 * Stack Navigator containing WorkspacesList and WorkspaceSplit screens.
 */
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import createWorkspaceNavigator from '@navigation/AppNavigator/createWorkspaceNavigator';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import variables from '@styles/variables';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import DomainSplitNavigator from './DomainSplitNavigator';
import WorkspaceSplitNavigator from './WorkspaceSplitNavigator';

const Stack = createWorkspaceNavigator<WorkspaceNavigatorParamList>();

function WorkspaceNavigator({route}: PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.WORKSPACE_NAVIGATOR>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // On narrow layout, use slide animation and enable swipe-back gesture on native platforms from WorkspaceInitialPage and DomainInitialPage.
    const splitNavigatorOptions = shouldUseNarrowLayout ? {animation: Animations.SLIDE_FROM_RIGHT, gestureEnabled: true} : {animation: Animations.NONE};
    const styles = useThemeStyles();

    // This hook preloads the screens of adjacent tabs to make changing tabs faster.
    usePreloadFullScreenNavigators();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: Animations.NONE,
            }}
            parentRoute={route}
        >
            <Stack.Screen
                name={SCREENS.WORKSPACES_LIST}
                component={WorkspacesListPage}
                options={{
                    web: {
                        cardStyle: [!shouldUseNarrowLayout ? {paddingLeft: variables.navigationTabBarSize} : styles.h100],
                    },
                }}
            />
            <Stack.Screen
                name={NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR}
                options={splitNavigatorOptions}
                component={WorkspaceSplitNavigator}
            />
            <Stack.Screen
                name={NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR}
                options={splitNavigatorOptions}
                component={DomainSplitNavigator}
            />
        </Stack.Navigator>
    );
}

export default WorkspaceNavigator;
