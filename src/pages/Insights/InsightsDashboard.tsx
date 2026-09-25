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
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getInsights} from '@libs/actions/Insights';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useEffectEvent} from 'react';
import {View} from 'react-native';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsDashboardState} from './resolveDashboardState';

import InsightsChartWidget from './charts/InsightsChartWidget';
import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';
import buildInsightsJsonQuery, {applyInsightsFilters} from './insightsQueries';
import {getDashboardState, INSIGHTS_DASHBOARD_STATE} from './resolveDashboardState';
import InsightsEmptyState from './states/InsightsEmptyState';
import InsightsNoExpensesState from './states/InsightsNoExpensesState';
import useInsightsFilters from './useInsightsFilters';

type InsightsDashboardContentProps = {
    dashboardID: InsightsDashboardID;

    /** Hash of the dashboard-wide query, which the record every chart reads is stored under */
    hash: number | undefined;

    state: InsightsDashboardState;

    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Called by the retry button to request the dashboard again */
    onRetry: () => void;
};

function InsightsDashboardContent({dashboardID, hash, state, filters, onRetry}: InsightsDashboardContentProps) {
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

    const {headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[dashboardID];
    const policiesInScope = Object.values(policies ?? {}).filter((policy) => !!policy && (filters.policyIDs.length === 0 || filters.policyIDs.includes(policy.id)));
    const visibleCharts = supportingCharts.filter(({isPolicyEligible}) => !isPolicyEligible || policiesInScope.some((policy) => !!policy && isPolicyEligible(policy, login)));

    // Wide layout stacks the cards in two independent columns, so a short card doesn't leave a gap under it
    const columns = shouldUseNarrowLayout ? [visibleCharts] : [visibleCharts.filter((chart, index) => index % 2 === 0), visibleCharts.filter((chart, index) => index % 2 === 1)];

    return (
        <ScrollView
            contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}
            addBottomSafeAreaPadding
        >
            <View style={styles.insightsDashboardLayout}>
                <InsightsChartWidget
                    dashboardID={dashboardID}
                    hash={hash}
                    chart={headlineChart}
                    filters={filters}
                    onRetry={onRetry}
                />
                <View style={styles.insightsChartGrid}>
                    {columns.map((columnCharts, columnIndex) => (
                        <View
                            // eslint-disable-next-line react/no-array-index-key -- columns are fixed positions
                            key={columnIndex}
                            style={[styles.flex1, styles.insightsChartColumn]}
                        >
                            {columnCharts.map((chart) => (
                                <InsightsChartWidget
                                    key={chart.graphKey}
                                    dashboardID={dashboardID}
                                    hash={hash}
                                    chart={chart}
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
    const {filters, isResolved} = useInsightsFilters();

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
    const headlineQueryJSON = isResolved ? buildSearchQueryJSON(applyInsightsFilters(INSIGHTS_DASHBOARD_SPECS[dashboardID].headlineChart, filters)) : undefined;
    const [headlineSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${headlineQueryJSON?.hash}`);

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
                hash={hash}
                state={getDashboardState(dashboard, isOffline, headlineSnapshot, headlineQueryJSON)}
                filters={filters}
                onRetry={requestDashboard}
            />
        </ScreenWrapper>
    );
}

export default InsightsDashboard;
