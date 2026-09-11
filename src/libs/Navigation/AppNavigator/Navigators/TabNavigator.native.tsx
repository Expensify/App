import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {NavigationLayoutContextProvider} from '@libs/Navigation/AppNavigator/NavigationLayoutContext';
import useNavigationLayoutPolicy from '@libs/Navigation/AppNavigator/useNavigationLayoutPolicy';
import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import HomePage from '@pages/home/HomePage';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Settings, and Workspaces pages.
 */
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {NavigationAction, NavigationState, Router, TabNavigationState} from '@react-navigation/native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import TabNavigatorBar from './TabNavigatorBar';
import WorkspaceNavigator from './WorkspaceNavigator';

const renderTabBar = ({state}: BottomTabBarProps) => <TabNavigatorBar state={state} />;

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded — swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.SETTINGS.ROOT]);

const TAB_SCREEN_OPTIONS_BASE = {
    headerShown: false,
    lazy: true,
    animation: 'none' as const,
    freezeOnBlur: true,
} as const;

function TabNavigator() {
    const {shouldUseNarrowLayout: shouldUseNarrowLayoutFallback} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const navigationLayoutPolicy = useNavigationLayoutPolicy(isBetaEnabled(CONST.BETAS.NATIVE_RESPONSIVE_LAYOUT));
    const layoutMode = navigationLayoutPolicy?.mode ?? 'narrow';
    const shouldUseNarrowLayout = layoutMode ? layoutMode === 'narrow' : shouldUseNarrowLayoutFallback;
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const route = useRoute();
    // The Tab.Navigator's own state lives at `parentState.routes[i].state`. We can't read it via
    // `useNavigationState((s) => s)` here because TabNavigator's body runs before <Tab.Navigator>
    // mounts, so the nearest navigation listener context is still the parent stack's.
    const tabState = useNavigationState((parentState) => parentState.routes.find((r) => r.key === route.key)?.state as NavigationState | undefined);

    useEffect(() => {
        if (!parentNavigation) {
            return;
        }
        if (!shouldUseNarrowLayout) {
            parentNavigation.setOptions({gestureEnabled: false});
            return;
        }
        const isRootScreen = TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(focusedRouteName ?? '');
        parentNavigation.setOptions({gestureEnabled: !isRootScreen});
    }, [focusedRouteName, shouldUseNarrowLayout, parentNavigation]);

    useEffect(() => {
        // stale === false distinguishes a fully realized NavigationState from a PartialState.
        if (!tabState || tabState.stale !== false) {
            return;
        }
        setPreservedNavigatorState(route.key, tabState);
    }, [tabState, route.key]);

    // The slicing optimization in useCustomRootStackNavigatorState can unmount and later remount
    // this TAB_NAVIGATOR. Without restoration it would default to index 0. We restore the saved
    // state by overriding the bottom-tab router's getInitialState — the same pattern SplitRouter
    // uses for its split navigators.
    const tabRouterOverride = <Action extends NavigationAction>(
        originalRouter: Router<TabNavigationState<TabNavigatorParamList>, Action>,
    ): Partial<Router<TabNavigationState<TabNavigatorParamList>, Action>> => ({
        getInitialState: (configOptions) => {
            const preserved = getPreservedNavigatorState<TabNavigationState<TabNavigatorParamList>>(route.key);
            return preserved ? originalRouter.getRehydratedState(preserved, configOptions) : originalRouter.getInitialState(configOptions);
        },
    });

    const screenOptions = {
        ...TAB_SCREEN_OPTIONS_BASE,
        sceneStyle: {flex: 1, backgroundColor: theme.appBG},
        tabBarPosition: shouldUseNarrowLayout ? ('bottom' as const) : ('left' as const),
    };

    return (
        <NavigationLayoutContextProvider policy={navigationLayoutPolicy}>
            <View
                style={[
                    styles.flex1,
                    !shouldUseNarrowLayout && StyleUtils.getPaddingLeft(navigationLayoutPolicy?.safeAreaInsets.left ?? 0),
                    !shouldUseNarrowLayout && StyleUtils.getPaddingRight(navigationLayoutPolicy?.safeAreaInsets.right ?? 0),
                ]}
            >
                <Tab.Navigator
                    backBehavior="fullHistory"
                    tabBar={renderTabBar}
                    screenOptions={screenOptions}
                    screenLayout={bottomTabScreenLayoutWrapper}
                    UNSTABLE_router={tabRouterOverride}
                >
                    <Tab.Screen
                        name={SCREENS.HOME}
                        component={HomePage}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                        component={ReportsSplitNavigator}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                        component={SearchFullscreenNavigator}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                        component={SettingsSplitNavigator}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                        component={WorkspaceNavigator}
                    />
                </Tab.Navigator>
            </View>
        </NavigationLayoutContextProvider>
    );
}

export default TabNavigator;
