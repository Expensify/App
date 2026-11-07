import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import {ChartCaptureContext} from '@components/Charts/context/ChartCaptureContext';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabRootScrollViewMarker from '@components/Navigation/TabBarBottomContent/TabRootScrollViewMarker';
import useTabRootScreenWrapperProps from '@components/Navigation/TabBarBottomContent/useTabRootScreenWrapperProps';
import useTabRootScrollProps from '@components/Navigation/TabBarBottomContent/useTabRootScrollProps';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getInsights} from '@libs/actions/Insights';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AIInsight, InsightsDashboard as InsightsDashboardRecord, InsightsDashboardID, InsightsScope} from '@src/types/onyx';
import viewRef from '@src/types/utils/viewRef';

import type {OnyxCollection} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useEffectEvent} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

import type {InsightsCaptureRef} from './exportInsightsDashboard/types';
import type {InsightsFilters} from './insightsFilters';
import type {InsightsChartQuery} from './insightsQueries';
import type {InsightsDashboardChart, InsightsDashboardState} from './resolveDashboardState';

import InsightsAICardRow from './ai/InsightsAICardRow';
import InsightsChartWidget from './charts/InsightsChartWidget';
import InsightsPageControls from './controls/InsightsPageControls';
import INSIGHTS_DASHBOARD_SPECS, {getVisibleCharts} from './dashboardSpecs';
import {getQueryGroupBy} from './insightsGroupByUtils';
import buildInsightsJsonQuery from './insightsQueries';
import InsightsTabSelector from './InsightsTabSelector';
import {getDashboardState, hasDashboardResponse, INSIGHTS_DASHBOARD_STATE} from './resolveDashboardState';
import InsightsEmptyState from './states/InsightsEmptyState';
import InsightsNoExpensesState from './states/InsightsNoExpensesState';
import useInsightsExport from './useInsightsExport';
import useInsightsFilters from './useInsightsFilters';

type InsightsDashboardContentProps = {
    dashboardID: InsightsDashboardID;
    state: InsightsDashboardState;
    aiInsights: AIInsight[] | undefined;
    insightsScope: InsightsScope;
    isLoadingAIInsights: boolean;
    headlineChart: InsightsDashboardChart;

    /** Charts in the grid below the headline, left out when no workspace in scope is eligible for them */
    supportingCharts: InsightsDashboardChart[];

    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Called by the retry button to request the dashboard again */
    onRetry: () => void;

    /** Changes how the headline chart aggregates: the time bucket, or Running total */
    onGroupByChange: (update: Partial<InsightsFilters>) => void;

    /** Ref on the scrolling dashboard content so the export includes cards below the fold */
    captureRef: InsightsCaptureRef;

    /** Page header rendered at the top of the scroller, so it scrolls away with the charts */
    children?: React.ReactNode;
};

function InsightsDashboardContent({
    dashboardID,
    state,
    aiInsights,
    insightsScope,
    isLoadingAIInsights,
    headlineChart,
    supportingCharts,
    filters,
    onRetry,
    onGroupByChange,
    captureRef,
    children,
}: InsightsDashboardContentProps) {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const shouldScrollMainHeader = useIsMobileWebLandscape();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);
    const triggerScrollEvent = useScrollEventEmitter();
    const isEmptyState = state === INSIGHTS_DASHBOARD_STATE.NO_EXPENSES || state === INSIGHTS_DASHBOARD_STATE.EMPTY;
    const scrollProps = useTabRootScrollProps(isEmptyState ? [styles.flexGrow1, styles.flexShrink0] : [styles.flexGrow1, !shouldScrollMainHeader && pageGutter, styles.pb5], {
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
            <>
                {children}
                <View
                    ref={viewRef(captureRef)}
                    collapsable={false}
                    style={styles.flex1}
                >
                    <FullPageErrorView
                        shouldShow
                        onButtonPress={onRetry}
                        {...failureViewByState[state]}
                    />
                </View>
            </>
        );
    }

    if (state === INSIGHTS_DASHBOARD_STATE.OFFLINE) {
        return (
            <>
                {children}
                <View
                    ref={viewRef(captureRef)}
                    collapsable={false}
                    style={styles.flex1}
                >
                    <BlockingView
                        icon={icons.OfflineCloud}
                        iconColor={theme.offline}
                        title={translate('common.youAppearToBeOffline')}
                        subtitle={translate('common.thisFeatureRequiresInternet')}
                        addBottomSafeAreaPadding
                        addOfflineIndicatorBottomSafeAreaPadding
                    />
                </View>
            </>
        );
    }

    if (state === INSIGHTS_DASHBOARD_STATE.LOADING) {
        return (
            <>
                {children}
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator size="large" />
                </View>
            </>
        );
    }

    if (isEmptyState) {
        return (
            <TabRootScrollViewMarker>
                <ScrollView
                    {...scrollProps}
                    addBottomSafeAreaPadding
                >
                    {children}
                    <View
                        ref={viewRef(captureRef)}
                        collapsable={false}
                        style={styles.flexGrow1}
                    >
                        {state === INSIGHTS_DASHBOARD_STATE.NO_EXPENSES ? <InsightsNoExpensesState /> : <InsightsEmptyState />}
                    </View>
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
                removeClippedSubviews={false}
            >
                {children}
                <View
                    ref={viewRef(captureRef)}
                    collapsable={false}
                    style={[styles.insightsDashboardLayout(shouldUseNarrowLayout), shouldScrollMainHeader && pageGutter]}
                >
                    {isBetaEnabled(CONST.BETAS.INSIGHTS_AI) && (
                        <InsightsAICardRow
                            insights={aiInsights}
                            insightsScope={insightsScope}
                            isLoading={isLoadingAIInsights}
                        />
                    )}
                    <InsightsChartWidget
                        dashboardID={dashboardID}
                        chart={headlineChart.chart}
                        queryJSON={headlineChart.queryJSON}
                        snapshot={headlineChart.snapshot}
                        previousPeriodQueryJSON={headlineChart.previousPeriodQueryJSON}
                        previousPeriodSnapshot={headlineChart.previousPeriodSnapshot}
                        averageTotal={headlineChart.averageTotal}
                        isDashboardLoaded={headlineChart.isDashboardLoaded}
                        filters={filters}
                        insightsScope={insightsScope}
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
                                        dashboardID={dashboardID}
                                        chart={chart}
                                        queryJSON={queryJSON}
                                        snapshot={snapshot}
                                        previousPeriodQueryJSON={previousPeriodQueryJSON}
                                        previousPeriodSnapshot={previousPeriodSnapshot}
                                        averageTotal={averageTotal}
                                        isDashboardLoaded={isDashboardLoaded}
                                        filters={filters}
                                        insightsScope={insightsScope}
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

/** Checks whether GetInsights has responded for any dashboard or filters. */
function hasStoredDashboardResponse(dashboards: OnyxCollection<InsightsDashboardRecord>): boolean {
    return Object.values(dashboards ?? {}).some(hasDashboardResponse);
}

function InsightsDashboard({dashboardID, accessibleDashboards}: {dashboardID: InsightsDashboardID; accessibleDashboards: InsightsDashboardID[]}) {
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const tabRootScreenWrapperProps = useTabRootScreenWrapperProps(NAVIGATION_TABS.INSIGHTS);
    const shouldScrollMainHeader = useIsMobileWebLandscape();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {login} = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {filters, defaultFilters, isResolved, setFilters} = useInsightsFilters(dashboardID);
    const {headerRef, controlsRef, contentRef, isExporting, isLoading: isChartLoading, exportDashboard, captureContext} = useInsightsExport(dashboardID, filters);
    const updateFilters = (update: Partial<InsightsFilters>) => {
        if (isExporting) {
            return;
        }
        setFilters(update);
    };
    const {headlineChart: headlineSpec, supportingCharts: supportingSpecs} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    const eligibleCharts = getVisibleCharts(supportingSpecs, policies, filters.policyIDs, login);
    const eligibleGraphKeys = eligibleCharts.map(({graphKey}) => graphKey).join(',');
    const query = isResolved ? buildInsightsJsonQuery(dashboardID, filters, eligibleCharts) : undefined;
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
    const [hasLoadedBefore = false] = useOnyx(ONYXKEYS.COLLECTION.INSIGHTS, {selector: hasStoredDashboardResponse});
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
    const state = getDashboardState(dashboard, isOffline, charts, hasLoadedBefore);

    const tabSelector =
        accessibleDashboards.length > 1 ? (
            <InsightsTabSelector
                activeDashboardID={dashboardID}
                dashboardIDs={accessibleDashboards}
            />
        ) : null;

    const pageControls =
        state !== INSIGHTS_DASHBOARD_STATE.NO_EXPENSES && state !== INSIGHTS_DASHBOARD_STATE.LOADING ? (
            <InsightsPageControls
                filters={filters}
                defaultFilters={defaultFilters}
                onChange={updateFilters}
                captureRef={controlsRef}
                onExport={exportDashboard}
                isExporting={isExporting}
                isExportDisabled={!isResolved || isChartLoading}
            />
        ) : null;

    const header = (
        <>
            <View
                ref={viewRef(headerRef)}
                collapsable={false}
            >
                <TopBar
                    breadcrumbLabel={translate('common.insights')}
                    shouldDisplayHelpButton
                />
            </View>
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
        </>
    );

    return (
        <ChartCaptureContext.Provider value={captureContext}>
            <ScreenWrapper
                shouldShowOfflineIndicatorInWideScreen
                enableEdgeToEdgeBottomSafeAreaPadding={false}
                {...tabRootScreenWrapperProps}
                testID="InsightsPage"
            >
                {!shouldScrollMainHeader && header}
                <View style={styles.flex1}>
                    <Animated.View
                        key={state}
                        entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                        exiting={FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                        style={StyleSheet.absoluteFill}
                    >
                        <InsightsDashboardContent
                            dashboardID={dashboardID}
                            state={state}
                            aiInsights={dashboard?.aiInsights}
                            insightsScope={{
                                searchKey: INSIGHTS_DASHBOARD_SPECS[dashboardID].searchKey,
                                policyIDs: filters.policyIDs,
                                date: filters.date,
                                groupCurrency: filters.groupCurrency,
                            }}
                            // Offline no response is coming, so the row hides instead of loading forever
                            isLoadingAIInsights={!hasDashboardResponse(dashboard) && !isOffline}
                            headlineChart={headlineChart}
                            supportingCharts={supportingCharts}
                            filters={filters}
                            onRetry={requestDashboard}
                            onGroupByChange={updateFilters}
                            captureRef={contentRef}
                        >
                            {shouldScrollMainHeader && header}
                        </InsightsDashboardContent>
                    </Animated.View>
                </View>
            </ScreenWrapper>
        </ChartCaptureContext.Provider>
    );
}

export default InsightsDashboard;
