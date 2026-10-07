import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import {ChartTooltipBoundaryContext} from '@components/Charts/context/ChartTooltipBoundaryContext';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getInsights} from '@libs/actions/Insights';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {ComponentRef} from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useEffectEvent, useRef} from 'react';
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

function InsightsDashboardContent({state, headlineChart, supportingCharts, filters, onRetry, onGroupByChange}: InsightsDashboardContentProps) {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);
    const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);

    const measureTooltipBoundary = (callback: MeasureInWindowOnSuccessCallback) => scrollViewRef.current?.getNativeScrollRef()?.measureInWindow(callback);

    const didRequestFail = state === INSIGHTS_DASHBOARD_STATE.ERROR || state === INSIGHTS_DASHBOARD_STATE.STALE;

    if (didRequestFail) {
        const failureViewByState = {
            [INSIGHTS_DASHBOARD_STATE.STALE]: {
                title: translate('search.searchResults.staleResults.title'),
                subtitle: translate('search.searchResults.staleResults.subtitle'),
                illustration: 'ChartSync',
                illustrationWidth: variables.iconSizeUltraLarge,
                illustrationHeight: variables.iconSizeUltraLarge,
                buttonTranslationKey: 'search.searchResults.staleResults.buttonText',
            },
            [INSIGHTS_DASHBOARD_STATE.ERROR]: {
                title: translate('errorPage.title', {isBreakLine: shouldUseNarrowLayout}),
                subtitle: translate('errorPage.subtitle'),
                buttonTranslationKey: 'common.tryAgain',
            },
        } as const;
        return (
            <FullPageErrorView
                shouldShow
                onButtonPress={onRetry}
                {...failureViewByState[state]}
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
            ref={scrollViewRef}
            style={styles.insightsDashboardScrollView}
            contentContainerStyle={[styles.flexGrow1, pageGutter, styles.pb5]}
            addBottomSafeAreaPadding
        >
            <ChartTooltipBoundaryContext.Provider value={measureTooltipBoundary}>
                <View style={styles.insightsDashboardLayout(shouldUseNarrowLayout)}>
                    <InsightsChartWidget
                        chart={headlineChart.chart}
                        queryJSON={headlineChart.queryJSON}
                        snapshot={headlineChart.snapshot}
                        filters={filters}
                        onRetry={onRetry}
                        onGroupByChange={onGroupByChange}
                    />
                    <View style={styles.insightsChartGrid(shouldUseNarrowLayout)}>
                        {columns.map((columnCharts, columnIndex) => (
                            <View
                                // eslint-disable-next-line react/no-array-index-key -- columns are fixed positions
                                key={columnIndex}
                                style={[styles.flex1, styles.insightsChartColumn(shouldUseNarrowLayout)]}
                            >
                                {columnCharts.map(({chart, queryJSON, snapshot}) => (
                                    <InsightsChartWidget
                                        key={chart.graphKey}
                                        chart={chart}
                                        queryJSON={queryJSON}
                                        snapshot={snapshot}
                                        filters={filters}
                                        onRetry={onRetry}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                </View>
            </ChartTooltipBoundaryContext.Provider>
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
    const {isBetaEnabled} = usePermissions();

    const query = isResolved ? buildInsightsJsonQuery(dashboardID, filters, isBetaEnabled(CONST.BETAS.INSIGHTS_COMPARE)) : undefined;
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
