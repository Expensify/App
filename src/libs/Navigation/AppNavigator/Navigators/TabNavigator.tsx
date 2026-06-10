/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Settings, and Workspaces pages.
 */
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {findFocusedRoute, useNavigation, useNavigationState} from '@react-navigation/native';
import React, {lazy, Suspense, useEffect} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import GlobalNavBar, {GLOBAL_NAV_BAR_HEIGHT} from '@components/Navigation/GlobalNavBar';
import GlobalNavBarHeightContext from '@components/Navigation/GlobalNavBar/GlobalNavBarHeightContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import {getSpan} from '@libs/telemetry/activeSpans';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
// Do not lazy load Search navigator for performance reasons
import InsightsNavigator from './InsightsNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import TabNavigatorBar from './TabNavigatorBar';

const LazyHomePage = lazy(() => import('@pages/home/HomePage'));
const LazyReportsSplitNavigator = lazy(() => import('./ReportsSplitNavigator'));
const LazySettingsSplitNavigator = lazy(() => import('./SettingsSplitNavigator'));
const LazyWorkspaceNavigator = lazy(() => import('./WorkspaceNavigator'));

type LazyFallbackProps = {
    /** Sentry span to tag when this fallback renders. */
    tabSpanName?: string;
};

function LazyFallback({tabSpanName}: LazyFallbackProps) {
    const styles = useThemeStyles();

    // Lets Sentry split slow tab navigations into "lazy chunk fetch" vs "screen render" buckets.
    useEffect(() => {
        if (!tabSpanName) {
            return;
        }
        getSpan(tabSpanName)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LAZY_TAB_FALLBACK_SHOWN, true);
    }, [tabSpanName]);

    return (
        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.appBG]}>
            <ActivityIndicator
                size="large"
                reasonAttributes={{context: 'TabNavigator.LazyTab'}}
            />
        </View>
    );
}

function withSuspense<P extends Record<string, unknown>>(LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>, tabSpanName?: string) {
    function SuspenseWrapper(props: P) {
        return (
            <Suspense fallback={<LazyFallback tabSpanName={tabSpanName} />}>
                <LazyComponent {...props} />
            </Suspense>
        );
    }
    return SuspenseWrapper;
}

const HomePageScreen = withSuspense(LazyHomePage);
const ReportsSplitNavigatorScreen = withSuspense(LazyReportsSplitNavigator, CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
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

    const barHeight = shouldUseNarrowLayout ? 0 : GLOBAL_NAV_BAR_HEIGHT;
    const sceneStyle = shouldUseNarrowLayout
        ? {flex: 1, backgroundColor: theme.appBG, paddingTop: barHeight}
        : {
              flex: 1,
              backgroundColor: theme.appBG,
              paddingTop: barHeight,
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
              overflow: 'hidden' as const,
          };
    const screenOptions = {
        ...TAB_SCREEN_OPTIONS_BASE,
        sceneStyle,
        tabBarPosition: shouldUseNarrowLayout ? ('bottom' as const) : ('left' as const),
    };

    return (
        <GlobalNavBarHeightContext.Provider value={barHeight}>
            <View style={{flex: 1, backgroundColor: shouldUseNarrowLayout ? undefined : theme.hoverLight}}>
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
                        component={SearchFullscreenNavigator}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.INSIGHTS_NAVIGATOR}
                        component={InsightsNavigator}
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
                {!shouldUseNarrowLayout && (
                    <View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: variables.navigationTabBarSize,
                            right: 0,
                            borderTopLeftRadius: 16,
                            borderBottomLeftRadius: 16,
                            boxShadow: theme.shadow,
                            zIndex: 5,
                        }}
                    />
                )}
                {!shouldUseNarrowLayout && <GlobalNavBar />}
            </View>
        </GlobalNavBarHeightContext.Provider>
    );
}

export default TabNavigator;
