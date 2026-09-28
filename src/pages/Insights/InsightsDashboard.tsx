import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getInsights} from '@libs/actions/Insights';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboard as InsightsDashboardRecord, InsightsDashboardID} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useEffectEvent} from 'react';
import {View} from 'react-native';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsDashboardChart, InsightsDashboardState} from './resolveDashboardState';

import InsightsChartWidget from './charts/InsightsChartWidget';
import InsightsPageControls from './controls/InsightsPageControls';
import INSIGHTS_DASHBOARD_SPECS, {getVisibleCharts} from './dashboardSpecs';
import buildInsightsJsonQuery from './insightsQueries';
import {getDashboardState, INSIGHTS_DASHBOARD_STATE} from './resolveDashboardState';
import InsightsEmptyState from './states/InsightsEmptyState';
import InsightsNoExpensesState from './states/InsightsNoExpensesState';
import useInsightsFilters from './useInsightsFilters';

type InsightsDashboardContentProps = {
    dashboard: OnyxEntry<InsightsDashboardRecord>;
    state: InsightsDashboardState;
    headlineChart: InsightsDashboardChart;

    /** Charts in the grid below the headline, left out when no workspace in scope is eligible for them */
    supportingCharts: InsightsDashboardChart[];

    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Called by the retry button to request the dashboard again */
    onRetry: () => void;

    /** Changes the time bucket the headline chart aggregates into */
    onGroupByChange: (groupBy: InsightsFilters['groupBy']) => void;
};

function InsightsDashboardContent({dashboard, state, headlineChart, supportingCharts, filters, onRetry, onGroupByChange}: InsightsDashboardContentProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);

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

    if (state === INSIGHTS_DASHBOARD_STATE.NO_EXPENSES || state === INSIGHTS_DASHBOARD_STATE.EMPTY) {
        return (
            <ScrollView
                contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}
                addBottomSafeAreaPadding
            >
                {state === INSIGHTS_DASHBOARD_STATE.NO_EXPENSES ? <InsightsNoExpensesState /> : <InsightsEmptyState />}
            </ScrollView>
        );
    }

    // Wide layout stacks the cards in two independent columns, so a short card doesn't leave a gap under it
    const columns = shouldUseNarrowLayout ? [supportingCharts] : [supportingCharts.filter((chart, index) => index % 2 === 0), supportingCharts.filter((chart, index) => index % 2 === 1)];

    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}
            addBottomSafeAreaPadding
        >
            <View style={styles.insightsDashboardLayout}>
                <InsightsChartWidget
                    chart={headlineChart.chart}
                    queryJSON={headlineChart.queryJSON}
                    snapshot={headlineChart.snapshot}
                    dashboard={dashboard}
                    filters={filters}
                    onRetry={onRetry}
                    onGroupByChange={onGroupByChange}
                />
                <View style={styles.insightsChartGrid}>
                    {columns.map((columnCharts, columnIndex) => (
                        <View
                            // eslint-disable-next-line react/no-array-index-key -- columns are fixed positions
                            key={columnIndex}
                            style={[styles.flex1, styles.insightsChartColumn]}
                        >
                            {columnCharts.map(({chart, queryJSON, snapshot}) => (
                                <InsightsChartWidget
                                    key={chart.graphKey}
                                    chart={chart}
                                    queryJSON={queryJSON}
                                    snapshot={snapshot}
                                    dashboard={dashboard}
                                    filters={filters}
                                    onRetry={onRetry}
                                />
                            ))}
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
    const {login} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {filters, defaultFilters, isResolved, setFilters} = useInsightsFilters(dashboardID);

    const query = isResolved ? buildInsightsJsonQuery(dashboardID, filters) : undefined;
    const jsonQuery = query?.jsonQuery;
    const hash = query?.hash;

    const requestDashboard = () => {
        if (!query || !jsonQuery || hash === undefined || isOffline) {
            return;
        }
        getInsights(dashboardID, hash, jsonQuery, query.snapshotHashes);
    };

    const onRequestConditionsChanged = useEffectEvent(() => {
        requestDashboard();
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        onRequestConditionsChanged();
    }, [dashboardID, jsonQuery, hash, isFocused, isOffline]);

    const [dashboard] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS}${dashboardID}_${hash}`);
    const {headlineChart: headlineSpec, supportingCharts: supportingSpecs} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    const eligibleCharts = getVisibleCharts(supportingSpecs, policies, filters.policyIDs, login);
    // Until the filters resolve, the charts have no query to read data for, so they show their loading state
    const visibleChartQueries = query
        ? [query.headlineChart, ...query.supportingCharts.filter(({chart}) => eligibleCharts.includes(chart))]
        : [headlineSpec, ...eligibleCharts].map((chart) => ({chart, queryJSON: undefined}));
    const snapshots = useMultipleSnapshots(visibleChartQueries.flatMap(({queryJSON}) => (queryJSON ? [String(queryJSON.hash)] : [])));
    const charts: InsightsDashboardChart[] = visibleChartQueries.map((chartQuery) => ({
        ...chartQuery,
        snapshot: chartQuery.queryJSON ? snapshots[chartQuery.queryJSON.hash] : undefined,
    }));
    const [headlineChart, ...supportingCharts] = charts;
    const state = getDashboardState(dashboard, isOffline, charts);

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
            {state !== INSIGHTS_DASHBOARD_STATE.NO_EXPENSES && (
                <InsightsPageControls
                    filters={filters}
                    defaultFilters={defaultFilters}
                    onChange={setFilters}
                />
            )}
            <InsightsDashboardContent
                dashboard={dashboard}
                state={state}
                headlineChart={headlineChart}
                supportingCharts={supportingCharts}
                filters={filters}
                onRetry={requestDashboard}
                onGroupByChange={(groupBy) => setFilters({groupBy})}
            />
        </ScreenWrapper>
    );
}

export default InsightsDashboard;
