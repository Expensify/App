/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Settings, and Workspaces pages.
 */
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {findFocusedRoute, useNavigation, useNavigationState} from '@react-navigation/native';
import React, {lazy, Suspense, useEffect} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import TabNavigatorBar from './TabNavigatorBar';

const LazyHomePage = lazy(() => import('@pages/home/HomePage'));
const LazyReportsSplitNavigator = lazy(() => import('./ReportsSplitNavigator'));
const LazySearchFullscreenNavigator = lazy(() => import('./SearchFullscreenNavigator'));
const LazySettingsSplitNavigator = lazy(() => import('./SettingsSplitNavigator'));
const LazyWorkspaceNavigator = lazy(() => import('./WorkspaceNavigator'));

function withSuspense<P extends Record<string, unknown>>(LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>) {
    function SuspenseWrapper(props: P) {
        const styles = useThemeStyles();
        return (
            <Suspense
                fallback={
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.appBG]}>
                        <ActivityIndicator
                            size="large"
                            reasonAttributes={{context: 'TabNavigator.LazyTab'}}
                        />
                    </View>
                }
            >
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <LazyComponent {...props} />
            </Suspense>
        );
    }
    return SuspenseWrapper;
}

const HomePageScreen = withSuspense(LazyHomePage);
const ReportsSplitNavigatorScreen = withSuspense(LazyReportsSplitNavigator);
const SearchFullscreenNavigatorScreen = withSuspense(LazySearchFullscreenNavigator);
const SettingsSplitNavigatorScreen = withSuspense(LazySettingsSplitNavigator);
const WorkspaceNavigatorScreen = withSuspense(LazyWorkspaceNavigator);

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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);

    useEffect(() => {
        if (!shouldUseNarrowLayout || !parentNavigation) {
            return;
        }
        const isRootScreen = TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(focusedRouteName ?? '');
        parentNavigation.setOptions({gestureEnabled: !isRootScreen});
    }, [focusedRouteName, shouldUseNarrowLayout, parentNavigation]);

    const screenOptions = {
        ...TAB_SCREEN_OPTIONS_BASE,
        sceneStyle: {flex: 1, backgroundColor: theme.appBG},
        tabBarPosition: shouldUseNarrowLayout ? ('bottom' as const) : ('left' as const),
    };

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            tabBar={renderTabBar}
            screenOptions={screenOptions}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePageScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigatorScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigatorScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigatorScreen}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigatorScreen}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
