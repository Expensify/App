import ActivityIndicator from '@components/ActivityIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import {getSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import React, {lazy, Suspense, useEffect} from 'react';
import {View} from 'react-native';

/**
 * The tab screens, code split so a tab's chunk is fetched the first time it is opened. Native has no chunks to
 * fetch, so it takes the sibling module that hands the components over directly and never shows the fallback.
 */
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

const HomePageScreen = withSuspense(LazyHomePage);
const ReportsSplitNavigatorScreen = withSuspense(LazyReportsSplitNavigator, CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
const SettingsSplitNavigatorScreen = withSuspense(LazySettingsSplitNavigator);
const WorkspaceNavigatorScreen = withSuspense(LazyWorkspaceNavigator);
const InsightsPageScreen = withSuspense(LazyInsightsPage);

export {HomePageScreen, ReportsSplitNavigatorScreen, SettingsSplitNavigatorScreen, WorkspaceNavigatorScreen, InsightsPageScreen};
