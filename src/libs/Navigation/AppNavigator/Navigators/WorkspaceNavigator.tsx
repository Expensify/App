/**
 * Stack Navigator containing WorkspacesList and WorkspaceSplit screens.
 */
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TabNavigatorParamList, WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import createWorkspaceNavigator from '@navigation/AppNavigator/createWorkspaceNavigator';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import DomainSplitNavigator from './DomainSplitNavigator';
import WorkspaceSplitNavigator from './WorkspaceSplitNavigator';

const Stack = createWorkspaceNavigator<WorkspaceNavigatorParamList>();

// Read by the screen options function below. Set by handleReplaceFullscreenUnderRHP when the
// workspace tab is collapsed to a freshly-created workspace, so the entering split navigator
// does not play SLIDE_FROM_RIGHT (which on iOS native-stack would otherwise be deferred and
// replayed after the RHP dismiss, briefly revealing the collapsed-away WorkspacesList).
function hasNoEnterAnimationFlag(params: unknown): boolean {
    return !!(params as {_noEnterAnimation?: boolean} | undefined)?._noEnterAnimation;
}

function WorkspaceNavigator({route}: PlatformStackScreenProps<TabNavigatorParamList, typeof NAVIGATORS.WORKSPACE_NAVIGATOR>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // On narrow layout, use slide animation and enable swipe-back gesture on native platforms from WorkspaceInitialPage and DomainInitialPage.
    // When the leaf route carries `_noEnterAnimation` (set atomically with the navigation state change in
    // handleReplaceFullscreenUnderRHP for `collapseTabToLeaf`), suppress the slide so the screen mounts instantly.
    const buildSplitNavigatorOptions = ({route: screenRoute}: {route: {params?: unknown}}) => {
        if (!shouldUseNarrowLayout || hasNoEnterAnimationFlag(screenRoute.params)) {
            return {animation: Animations.NONE};
        }
        return {animation: Animations.SLIDE_FROM_RIGHT, gestureEnabled: true};
    };

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
            />
            <Stack.Screen
                name={NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR}
                options={buildSplitNavigatorOptions}
                component={WorkspaceSplitNavigator}
            />
            <Stack.Screen
                name={NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR}
                options={buildSplitNavigatorOptions}
                component={DomainSplitNavigator}
            />
        </Stack.Navigator>
    );
}

export default WorkspaceNavigator;
