import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabRootScrollViewMarker from '@components/Navigation/TabBarBottomContent/TabRootScrollViewMarker';
import useTabRootScreenWrapperProps from '@components/Navigation/TabBarBottomContent/useTabRootScreenWrapperProps';
import useTabRootScrollProps from '@components/Navigation/TabBarBottomContent/useTabRootScrollProps';
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
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getInsights} from '@libs/actions/Insights';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboard as InsightsDashboardRecord, InsightsDashboardID} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useEffectEvent} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsChartQuery} from './insightsQueries';
import type {InsightsDashboardChart, InsightsDashboardState} from './resolveDashboardState';

import InsightsChartWidget from './charts/InsightsChartWidget';
import InsightsPageControls from './controls/InsightsPageControls';
import INSIGHTS_DASHBOARD_SPECS, {getVisibleCharts} from './dashboardSpecs';
import {getQueryGroupBy} from './insightsGroupByUtils';
import buildInsightsJsonQuery from './insightsQueries';
import InsightsTabSelector from './InsightsTabSelector';
import {getDashboardState, hasDashboardResponse, INSIGHTS_DASHBOARD_STATE} from './resolveDashboardState';
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

    /** Changes how the headline chart aggregates: the time bucket, or Running total */
    onGroupByChange: (update: Partial<InsightsFilters>) => void;
};

function InsightsDashboardContent({state, headlineChart, supportingCharts, filters, onRetry, onGroupByChange}: InsightsDashboardContentProps) {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);
    const triggerScrollEvent = useScrollEventEmitter();
    const isEmptyState = state === INSIGHTS_DASHBOARD_STATE.NO_EXPENSES || state === INSIGHTS_DASHBOARD_STATE.EMPTY;
    const scrollProps = useTabRootScrollProps(isEmptyState ? [styles.flexGrow1, styles.flexShrink0] : [styles.flexGrow1, pageGutter, styles.pb5], {
        hasBottomSafeAreaPadding: true,
        hasOfflineIndicatorPadding: true,
        fillsVisibleArea: isEmptyState,
    });

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

    if (state === INSIGHTS_DASHBOARD_STATE.LOADING) {
        return (
            <View style={styles.flex1}>
                <FullScreenLoadingIndicator shouldUseGoBackButton={false} />
            </View>
        );
    }

    if (isEmptyState) {
        return (
            <TabRootScrollViewMarker>
                <ScrollView
                    {...scrollProps}
                    addBottomSafeAreaPadding
                >
                    {state === INSIGHTS_DASHBOARD_STATE.NO_EXPENSES ? <InsightsNoExpensesState /> : <InsightsEmptyState />}
                </ScrollView>
            </TabRootScrollViewMarker>
        );
    }

    // Wide layout stacks the cards in two independent columns, so a short card doesn't leave a gap under it
    const columns = shouldUseNarrowLayout ? [supportingCharts] : [supportingCharts.filter((chart, index) => index % 2 === 0), supportingCharts.filter((chart, index) => index % 2 === 1)];

    return (
        <TabRootScrollViewMarker>
            <ScrollView
                style={styles.insightsDashboardScrollView}
                onScroll={triggerScrollEvent}
                scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
                {...scrollProps}
                addBottomSafeAreaPadding
            >
                <View style={styles.insightsDashboardLayout(shouldUseNarrowLayout)}>
                    <InsightsChartWidget
                        chart={headlineChart.chart}
                        queryJSON={headlineChart.queryJSON}
                        snapshot={headlineChart.snapshot}
                        previousPeriodQueryJSON={headlineChart.previousPeriodQueryJSON}
                        previousPeriodSnapshot={headlineChart.previousPeriodSnapshot}
                        averageTotal={headlineChart.averageTotal}
                        isDashboardLoaded={headlineChart.isDashboardLoaded}
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
                                {columnCharts.map(({chart, queryJSON, snapshot, previousPeriodQueryJSON, previousPeriodSnapshot, averageTotal, isDashboardLoaded}) => (
                                    <InsightsChartWidget
                                        key={chart.graphKey}
                                        chart={chart}
                                        queryJSON={queryJSON}
                                        snapshot={snapshot}
                                        previousPeriodQueryJSON={previousPeriodQueryJSON}
                                        previousPeriodSnapshot={previousPeriodSnapshot}
                                        averageTotal={averageTotal}
                                        isDashboardLoaded={isDashboardLoaded}
                                        filters={filters}
                                        onRetry={onRetry}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </TabRootScrollViewMarker>
    );
}

/** Checks whether any stored response said the account has expenses. */
function hasStoredResponseWithExpenses(dashboards: OnyxCollection<InsightsDashboardRecord>): boolean {
    return Object.values(dashboards ?? {}).some((dashboard) => dashboard?.hasResults === true);
}

function InsightsDashboard({dashboardID, accessibleDashboards}: {dashboardID: InsightsDashboardID; accessibleDashboards: InsightsDashboardID[]}) {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const tabRootScreenWrapperProps = useTabRootScreenWrapperProps(NAVIGATION_TABS.INSIGHTS);
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {login} = useCurrentUserPersonalDetails();
    const [policies, policiesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {filters, defaultFilters, isResolved, setFilters} = useInsightsFilters(dashboardID);
    const {headlineChart: headlineSpec, supportingCharts: supportingSpecs} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    const eligibleCharts = getVisibleCharts(supportingSpecs, policies, filters.policyIDs, login);
    const eligibleGraphKeys = eligibleCharts.map(({graphKey}) => graphKey).join(',');
    const query = isResolved && !isLoadingOnyxValue(policiesMetadata) ? buildInsightsJsonQuery(dashboardID, filters, eligibleCharts) : undefined;
    const hash = query?.hash;
    // The bucket actually queried, which Running total resolves to a real day/month bucket. Toggling Running total alone leaves this unchanged, so it stays a client-side transform with no refetch.
    const queryGroupBy = isResolved ? getQueryGroupBy(filters) : undefined;

    const requestDashboard = () => {
        if (!query || hash === undefined || isOffline) {
            return;
        }
        getInsights(dashboardID, hash, query.jsonQuery, query.snapshotHashes);
    };

    const onRequestConditionsChanged = useEffectEvent(() => {
        requestDashboard();
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        onRequestConditionsChanged();
        // Leaves out jsonQuery so toggling Compare mode doesn't refetch, since every response covers it. The effective bucket and the eligible charts are listed because the hash leaves them out, so changing them triggers a refetch while a pure Running total toggle does not.
    }, [dashboardID, hash, queryGroupBy, eligibleGraphKeys, isFocused, isOffline]);

    const [dashboard] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS}${dashboardID}_${hash}`);
    const [isKnownToHaveExpenses = false] = useOnyx(ONYXKEYS.COLLECTION.INSIGHTS, {selector: hasStoredResponseWithExpenses});
    // Until the filters and workspaces load, the charts have no query to read data for, so they show their loading state
    const visibleChartQueries = query
        ? [query.headlineChart, ...query.supportingCharts]
        : [headlineSpec, ...eligibleCharts].map((chart): InsightsChartQuery => ({chart, queryJSON: undefined}));
    const snapshots = useMultipleSnapshots(
        visibleChartQueries.flatMap(({queryJSON, previousPeriodQueryJSON}) =>
            [queryJSON, previousPeriodQueryJSON].flatMap((chartQueryJSON) => (chartQueryJSON ? [String(chartQueryJSON.hash)] : [])),
        ),
    );
    const charts: InsightsDashboardChart[] = visibleChartQueries.map((chartQuery) => ({
        ...chartQuery,
        snapshot: chartQuery.queryJSON ? snapshots[chartQuery.queryJSON.hash] : undefined,
        previousPeriodSnapshot: chartQuery.previousPeriodQueryJSON ? snapshots[chartQuery.previousPeriodQueryJSON.hash] : undefined,
        averageTotal: dashboard?.graphs?.[chartQuery.chart.graphKey]?.average,
        isDashboardLoaded: hasDashboardResponse(dashboard),
    }));
    const [headlineChart, ...supportingCharts] = charts;
    const state = getDashboardState(dashboard, isOffline, charts, isKnownToHaveExpenses);

    const tabSelector =
        accessibleDashboards.length > 1 ? (
            <InsightsTabSelector
                activeDashboardID={dashboardID}
                dashboardIDs={accessibleDashboards}
            />
        ) : null;

    const pageControls =
        state !== INSIGHTS_DASHBOARD_STATE.NO_EXPENSES ? (
            <InsightsPageControls
                filters={filters}
                defaultFilters={defaultFilters}
                onChange={setFilters}
            />
        ) : null;

    return (
        <ScreenWrapper
            shouldShowOfflineIndicatorInWideScreen
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            {...tabRootScreenWrapperProps}
            testID="InsightsPage"
        >
            <TopBar
                breadcrumbLabel={translate('common.insights')}
                shouldDisplayHelpButton
            />
            {shouldUseNarrowLayout ? (
                <>
                    {!!tabSelector && <View style={[pageGutter, styles.pb3]}>{tabSelector}</View>}
                    {pageControls}
                </>
            ) : (
                (!!tabSelector || !!pageControls) && (
                    <View style={[pageGutter, styles.pb5, styles.insightsPageControlsContainer]}>
                        <View style={[styles.centeredContentWidthLimiter, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                            {tabSelector}
                            {pageControls}
                        </View>
                    </View>
                )
            )}
            <View style={styles.flex1}>
                <Animated.View
                    key={state}
                    entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                    exiting={FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                    style={StyleSheet.absoluteFill}
                >
                    <InsightsDashboardContent
                        state={state}
                        headlineChart={headlineChart}
                        supportingCharts={supportingCharts}
                        filters={filters}
                        onRetry={requestDashboard}
                        onGroupByChange={setFilters}
                    />
                </Animated.View>
            </View>
        </ScreenWrapper>
    );
}

export default InsightsDashboard;
