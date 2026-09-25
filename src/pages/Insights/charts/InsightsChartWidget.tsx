import VictoryTheme from '@components/Charts/VictoryTheme';
import {buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import ChartEmptyState from '@components/Search/ChartEmptyState';
import ChartErrorState from '@components/Search/ChartErrorState';
import SearchChartView from '@components/Search/SearchChartView';
import WidgetContainer from '@components/WidgetContainer';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type {InsightsChartSpec} from '@pages/Insights/dashboardSpecs';
import resolveComparisonWindows from '@pages/Insights/insightsCompare';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {INSIGHTS_CHART_STATE} from '@pages/Insights/resolveChartData';
import useInsightsChartData from '@pages/Insights/useInsightsChartData';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {InsightsDashboardID} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import InsightsDataTable from './InsightsDataTable';

type InsightsChartWidgetProps = {
    dashboardID: InsightsDashboardID;

    chart: InsightsChartSpec;

    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Hash of the dashboard-wide query, which the record naming this chart's snapshot is stored under */
    hash: number | undefined;

    /** Called by the retry button to request the dashboard again */
    onRetry: () => void;
};

function InsightsChartWidget({dashboardID, hash, chart, filters, onRetry}: InsightsChartWidgetProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);

    const {queryJSON, data, previousPeriodData, state} = useInsightsChartData(dashboardID, hash, chart, filters);
    const groupBy = queryJSON?.groupBy;
    const windows = resolveComparisonWindows(filters.date, translate);
    const comparison =
        isBetaEnabled(CONST.BETAS.INSIGHTS_COMPARE) && previousPeriodData && windows
            ? {
                  data: previousPeriodData,
                  current: {...windows.current, color: chart.color ?? VictoryTheme.colors.default},
                  previous: {...windows.previous, color: chart.comparisonColor ?? VictoryTheme.colors.defaultDot},
              }
            : undefined;
    // A pie shows one period at a time, so a compared pie is drawn as a bar chart instead.
    const view = comparison && chart.view === CONST.SEARCH.VIEW.PIE ? CONST.SEARCH.VIEW.BAR : chart.view;
    const isLoading = state === INSIGHTS_CHART_STATE.LOADING;
    const shouldShowTable = view === CONST.SEARCH.VIEW.BAR || view === CONST.SEARCH.VIEW.PIE;

    if (!queryJSON || !groupBy) {
        return null;
    }

    return (
        <WidgetContainer
            title={translate(chart.titleKey)}
            titleRightContent={
                state === INSIGHTS_CHART_STATE.READY ? (
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
                ) : null
            }
        >
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
