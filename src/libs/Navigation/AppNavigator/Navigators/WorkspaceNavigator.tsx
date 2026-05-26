/**
 * Stack Navigator containing WorkspacesList and WorkspaceSplit screens.
 */
import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TabNavigatorParamList, WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import createWorkspaceNavigator from '@navigation/AppNavigator/createWorkspaceNavigator';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import DomainSplitNavigator from './DomainSplitNavigator';
import WorkspaceSplitNavigator from './WorkspaceSplitNavigator';

const Stack = createWorkspaceNavigator<WorkspaceNavigatorParamList>();

function WorkspaceNavigator({route}: PlatformStackScreenProps<TabNavigatorParamList, typeof NAVIGATORS.WORKSPACE_NAVIGATOR>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // One-shot suppression of WorkspaceSplitNavigator's enter slide. Set by
    // preInsertFullscreenUnderRHP when collapsing the tab to a freshly-created workspace, so iOS
    // native-stack doesn't run the deferred SLIDE_FROM_RIGHT after the RHP dismisses (which would
    // briefly reveal WORKSPACES_LIST underneath). Auto-clears after the next transitionEnd.
    const [suppressSplitEnterAnimation, setSuppressSplitEnterAnimation] = useState(false);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener(CONST.MODAL_EVENTS.DISABLE_WORKSPACE_SPLIT_ENTER_ANIMATION, () => {
            setSuppressSplitEnterAnimation(true);
        });
        return () => sub.remove();
    }, []);

    // On narrow layout, use slide animation and enable swipe-back gesture on native platforms from WorkspaceInitialPage and DomainInitialPage.
    const splitNavigatorOptions = shouldUseNarrowLayout && !suppressSplitEnterAnimation ? {animation: Animations.SLIDE_FROM_RIGHT, gestureEnabled: true} : {animation: Animations.NONE};

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
                options={splitNavigatorOptions}
                component={WorkspaceSplitNavigator}
                listeners={{
                    transitionEnd: () => {
                        if (!suppressSplitEnterAnimation) {
                            return;
                        }
                        setSuppressSplitEnterAnimation(false);
                    },
                }}
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
