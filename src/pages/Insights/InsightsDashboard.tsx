import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {SearchQueryString} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getInsights} from '@libs/actions/Insights';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboard as InsightsDashboardRecord, InsightsDashboardID} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useEffectEvent} from 'react';
import {View} from 'react-native';

import type {InsightsFilters} from './insightsFilters';

import InsightsChartWidget from './charts/InsightsChartWidget';
import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';
import buildInsightsJsonQuery from './insightsQueries';
import useInsightsFilters from './useInsightsFilters';

const INSIGHTS_DASHBOARD_STATE = {
    DATA: 'data',
    LOADING: 'loading',
    ERROR: 'error',
    OFFLINE: 'offline',
} as const;

type InsightsDashboardState = ValueOf<typeof INSIGHTS_DASHBOARD_STATE>;

/** Resolves the page's state for the query on screen from the dashboard's stored record. */
function getDashboardState(dashboard: OnyxEntry<InsightsDashboardRecord>, inputQuery: SearchQueryString | undefined, isOffline: boolean): InsightsDashboardState {
    if (!!inputQuery && dashboard?.inputQuery === inputQuery) {
        return INSIGHTS_DASHBOARD_STATE.DATA;
    }
    if (!!inputQuery && dashboard?.requestedQuery === inputQuery) {
        return INSIGHTS_DASHBOARD_STATE.LOADING;
    }
    if (Object.keys(dashboard?.errors ?? {}).length > 0) {
        return INSIGHTS_DASHBOARD_STATE.ERROR;
    }
    return isOffline ? INSIGHTS_DASHBOARD_STATE.OFFLINE : INSIGHTS_DASHBOARD_STATE.LOADING;
}

type InsightsDashboardContentProps = {
    dashboardID: InsightsDashboardID;
    state: InsightsDashboardState;

    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Asks for the dashboard again, offered to the reader when the last request failed */
    onRetry: () => void;
};

/** Everything below the top bar: the charts, or what stands in for them. */
function InsightsDashboardContent({dashboardID, state, filters, onRetry}: InsightsDashboardContentProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {login} = useCurrentUserPersonalDetails();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    if (state === INSIGHTS_DASHBOARD_STATE.ERROR) {
        return (
            <FullPageErrorView
                shouldShow
                title={translate('errorPage.title', {isBreakLine: shouldUseNarrowLayout})}
                subtitle={translate('errorPage.subtitle')}
                buttonTranslationKey="common.tryAgain"
                onButtonPress={onRetry}
            />
        );
    }

    if (state === INSIGHTS_DASHBOARD_STATE.OFFLINE) {
        return (
            <BlockingView
                icon={icons.OfflineCloud}
                iconColor={theme.offline}
                title={translate('common.youAppearToBeOffline')}
                subtitle={translate('common.thisFeatureRequiresInternet')}
                addBottomSafeAreaPadding
                addOfflineIndicatorBottomSafeAreaPadding
            />
        );
    }

    const {headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    const policiesInScope = Object.values(policies ?? {}).filter((policy) => !!policy && (filters.policyIDs.length === 0 || filters.policyIDs.includes(policy.id)));
    const visibleCharts = supportingCharts.filter(({isPolicyEligible}) => !isPolicyEligible || policiesInScope.some((policy) => !!policy && isPolicyEligible(policy, login)));

    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}
            addBottomSafeAreaPadding
        >
            <View style={styles.insightsDashboardLayout}>
                <InsightsChartWidget
                    dashboardID={dashboardID}
                    chart={headlineChart}
                    filters={filters}
                    groupByOverride={filters.groupBy}
                    onRetry={onRetry}
                />
                <View style={styles.insightsChartGrid}>
                    {visibleCharts.map((chart) => (
                        <View
                            key={chart.graphKey}
                            style={styles.insightsChartGridCell(shouldUseNarrowLayout)}
                        >
                            <InsightsChartWidget
                                dashboardID={dashboardID}
                                chart={chart}
                                filters={filters}
                                onRetry={onRetry}
                                containerStyles={styles.flex1}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

function InsightsDashboard({dashboardID}: {dashboardID: InsightsDashboardID}) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {filters, isResolved} = useInsightsFilters();

    const query = isResolved ? buildInsightsJsonQuery(dashboardID, filters) : undefined;
    const jsonQuery = query?.jsonQuery;
    const inputQuery = query?.inputQuery;

    const requestDashboard = () => {
        if (!jsonQuery || !inputQuery || isOffline) {
            return;
        }
        getInsights(dashboardID, jsonQuery, inputQuery);
    };

    const onQueryChanged = useEffectEvent(() => {
        requestDashboard();
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        onQueryChanged();
    }, [dashboardID, jsonQuery, inputQuery, isFocused, isOffline]);

    const [dashboard] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS}${dashboardID}`);

    return (
        <ScreenWrapper
            shouldShowOfflineIndicatorInWideScreen
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.INSIGHTS} />}
            testID="InsightsPage"
        >
            <TopBar
                breadcrumbLabel={translate('common.insights')}
                shouldDisplayHelpButton
            />
            <InsightsDashboardContent
                dashboardID={dashboardID}
                state={getDashboardState(dashboard, inputQuery, isOffline)}
                filters={filters}
                onRetry={requestDashboard}
            />
        </ScreenWrapper>
    );
}

export default InsightsDashboard;
