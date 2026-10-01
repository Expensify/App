import {buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import ChartEmptyState from '@components/Search/ChartEmptyState';
import ChartErrorState from '@components/Search/ChartErrorState';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import SearchChartView from '@components/Search/SearchChartView';
import type {SearchQueryJSON} from '@components/Search/types';
import WidgetContainer from '@components/WidgetContainer';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';

import InsightsGroupByDropdown from '@pages/Insights/controls/InsightsGroupByDropdown';
import type {InsightsChartSpec} from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import useInsightsChartComparison from '@pages/Insights/useInsightsChartComparison';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import InsightsDataTable from './InsightsDataTable';

type InsightsChartWidgetProps = {
    chart: InsightsChartSpec;

    /** The chart's own query, with the page's filters applied */
    queryJSON: Readonly<SearchQueryJSON> | undefined;

    /** The snapshot stored under the chart's own query */
    snapshot: OnyxEntry<SearchResults>;

    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Called by the retry button to request the dashboard again */
    onRetry: () => void;

    /** Shows a group-by control in the chart's header when set */
    onGroupByChange?: (groupBy: InsightsFilters['groupBy']) => void;
};

function InsightsChartWidget({chart, queryJSON, snapshot, filters, onRetry, onGroupByChange}: InsightsChartWidgetProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);

    const {isOffline} = useNetwork();
    const sortedData = useGroupedItems(snapshot, queryJSON);
    const {data, state: currentPeriodState} = resolveInsightsChartData({snapshot, queryJSON, sortedData, isOffline});
    const {comparison, blockingState} = useInsightsChartComparison(chart, filters, queryJSON);
    // Show a compared chart only once both periods resolve.
    const state = currentPeriodState === INSIGHTS_CHART_STATE.READY && blockingState ? blockingState : currentPeriodState;
    const groupBy = chart.groupBy ?? filters.groupBy;
    // Pies show one period, so compared pies render as bars.
    const view = comparison && chart.view === CONST.SEARCH.VIEW.PIE ? CONST.SEARCH.VIEW.BAR : chart.view;
    const isLoading = state === INSIGHTS_CHART_STATE.LOADING;
    const shouldShowTable = view === CONST.SEARCH.VIEW.BAR || view === CONST.SEARCH.VIEW.PIE;

    const groupByControl = onGroupByChange ? (
        <InsightsGroupByDropdown
            groupBy={filters.groupBy}
            onChange={onGroupByChange}
        />
    ) : null;

    const headerMenu =
        !!queryJSON && (state === INSIGHTS_CHART_STATE.READY || isLoading) ? (
            <WidgetHeaderMenu
                testID={`insightsChartMenu-${chart.graphKey}`}
                sentryLabel="InsightsChartMenu"
                menuItems={[
                    {
                        text: translate('insightsPage.viewOnSpend'),
                        icon: icons.Expand,
                        onSelected: () =>
                            Navigation.navigate(
                                ROUTES.SEARCH_ROOT.getRoute({
                                    query: buildViewOnSpendQuery(queryJSON),
                                }),
                            ),
                        shouldCallAfterModalHide: true,
                    },
                ]}
            />
        ) : null;

    return (
        <WidgetContainer
            containerStyles={styles.overflowVisible}
            title={translate(chart.titleKey)}
            titleRightContent={
                !!groupByControl || !!headerMenu ? (
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        {groupByControl}
                        {headerMenu}
                    </View>
                ) : null
            }
        >
            {state === INSIGHTS_CHART_STATE.OFFLINE && <ChartOfflineState />}
            {state === INSIGHTS_CHART_STATE.ERROR && <ChartErrorState onRetry={onRetry} />}
            {state === INSIGHTS_CHART_STATE.EMPTY && <ChartEmptyState testID={`insightsChartEmptyState-${chart.graphKey}`} />}
            {(state === INSIGHTS_CHART_STATE.LOADING || state === INSIGHTS_CHART_STATE.READY) && (
                <View style={shouldUseNarrowLayout ? styles.pb5 : styles.pb8}>
                    <SearchChartView
                        queryJSON={queryJSON}
                        view={view}
                        groupBy={groupBy}
                        data={data}
                        isLoading={isLoading}
                        color={chart.color}
                        comparison={comparison}
                        chartContainerStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                        renderDetails={
                            shouldShowTable
                                ? ({rows, series}) => (
                                      <InsightsDataTable
                                          rows={rows}
                                          series={series}
                                          view={view}
                                          groupBy={groupBy}
                                          isLoading={isLoading}
                                      />
                                  )
                                : undefined
                        }
                    />
                </View>
            )}
        </WidgetContainer>
    );
}

export default InsightsChartWidget;
