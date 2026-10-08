import {buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import ChartEmptyState from '@components/Search/ChartEmptyState';
import ChartErrorState from '@components/Search/ChartErrorState';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import SearchChartView from '@components/Search/SearchChartView';
import type {SearchQueryJSON} from '@components/Search/types';
import WidgetContainer from '@components/WidgetContainer';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';

import InsightsGroupByDropdown from '@pages/Insights/controls/InsightsGroupByDropdown';
import type {InsightsChartSpec} from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {getInsightsGroupByOptions} from '@pages/Insights/insightsGroupByOptions';

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
    const {cardPaddingHorizontal, cardPaddingBottom} = useLayoutSpacing();
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);

    const {isOffline} = useNetwork();
    const sortedData = useGroupedItems(snapshot, queryJSON);
    const {data, state} = resolveInsightsChartData({snapshot, queryJSON, sortedData, isOffline});
    const groupBy = chart.groupBy ?? filters.groupBy;
    const isLoading = state === INSIGHTS_CHART_STATE.LOADING;
    const shouldShowTable = chart.view === CONST.SEARCH.VIEW.BAR || chart.view === CONST.SEARCH.VIEW.PIE;

    const groupByOptions = getInsightsGroupByOptions(filters.date);

    const groupByControl =
        onGroupByChange && groupByOptions.length > 0 ? (
            <InsightsGroupByDropdown
                groupBy={filters.groupBy}
                options={groupByOptions}
                onChange={onGroupByChange}
            />
        ) : null;

    const headerMenu =
        !!queryJSON && (state === INSIGHTS_CHART_STATE.READY || isLoading) ? (
            <WidgetHeaderMenu
                size={CONST.BUTTON_SIZE.SMALL}
                testID={`insightsChartMenu-${chart.graphKey}`}
                sentryLabel="InsightsChartMenu"
                menuItems={[
                    {
                        text: translate('insightsPage.viewOnSpend'),
                        icon: icons.Expand,
                        onSelected: () => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildViewOnSpendQuery(queryJSON)})),
                        shouldCallAfterModalHide: true,
                    },
                ]}
            />
        ) : null;

    return (
        <WidgetContainer
            title={translate(chart.titleKey)}
            titleRightContent={
                !!groupByControl || !!headerMenu ? (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.flexShrink1]}>
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
                <View style={cardPaddingBottom}>
                    <SearchChartView
                        queryJSON={queryJSON}
                        view={chart.view}
                        groupBy={groupBy}
                        data={data}
                        isLoading={isLoading}
                        chartContainerStyle={cardPaddingHorizontal}
                        shouldShowGroupLabels={false}
                        renderDetails={
                            shouldShowTable
                                ? (rows) => (
                                      <InsightsDataTable
                                          rows={rows}
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
