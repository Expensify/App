import ActivityIndicator from '@components/ActivityIndicator';
import NavigatorTabBarVisibilityProvider from '@components/Navigation/TabBarBottomContent/NavigatorTabBarVisibilityProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import {getSpan} from '@libs/telemetry/activeSpans';

import FreezeWrapper from '@navigation/AppNavigator/FreezeWrapper';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Tab Navigator containing Home, Inbox (Reports), Search, Insights, Settings, and Workspaces pages.
 */
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {lazy, Suspense, useEffect} from 'react';
import {View} from 'react-native';

// Do not lazy load Search navigator for performance reasons
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import TabNavigatorBar from './TabNavigatorBar';
import TabRootGestureController from './TabRootGestureController';

const LazyHomePage = lazy(() => import('@pages/home/HomePage'));
const LazyReportsSplitNavigator = lazy(() => import('./ReportsSplitNavigator'));
const LazySettingsSplitNavigator = lazy(() => import('./SettingsSplitNavigator'));
const LazyWorkspaceNavigator = lazy(() => import('./WorkspaceNavigator'));
const LazyInsightsPage = lazy(() => import('@pages/Insights/InsightsPage'));

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
            <ActivityIndicator size="large" />
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

const HomePageWithSuspense = withSuspense(LazyHomePage);

// Outside the Suspense so the lazy chunk load still shows LazyFallback instead of suspending into Freeze.
function HomePageScreen() {
    return (
        <FreezeWrapper>
            <HomePageWithSuspense />
        </FreezeWrapper>
    );
}
const ReportsSplitNavigatorScreen = withSuspense(LazyReportsSplitNavigator, CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
const SettingsSplitNavigatorScreen = withSuspense(LazySettingsSplitNavigator);
const WorkspaceNavigatorScreen = withSuspense(LazyWorkspaceNavigator);
const InsightsPageScreen = withSuspense(LazyInsightsPage);

const renderTabBar = ({state}: BottomTabBarProps) => <TabNavigatorBar state={state} />;

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

const TAB_SCREEN_OPTIONS_BASE = {
    headerShown: false,
    lazy: true,
    animation: 'none' as const,
    freezeOnBlur: true,
} as const;

function TabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();

    const screenOptions = {
        ...TAB_SCREEN_OPTIONS_BASE,
        sceneStyle: {flex: 1, backgroundColor: theme.appBG},
        tabBarPosition: shouldUseNarrowLayout ? ('bottom' as const) : ('left' as const),
    };

    return (
        <NavigatorTabBarVisibilityProvider>
            <TabRootGestureController />
            <Tab.Navigator
                backBehavior="fullHistory"
                tabBar={renderTabBar}
                screenOptions={screenOptions}
                screenLayout={bottomTabScreenLayoutWrapper}
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
                    name={SCREENS.INSIGHTS}
                    component={InsightsPageScreen}
                />
                <Tab.Screen
                    name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                    component={WorkspaceNavigatorScreen}
                />
                <Tab.Screen
                    name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                    component={SettingsSplitNavigatorScreen}
                />
            </Tab.Navigator>
        </NavigatorTabBarVisibilityProvider>
    );
}

export default TabNavigator;
