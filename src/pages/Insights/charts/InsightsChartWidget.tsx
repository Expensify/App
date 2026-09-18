import {buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import ChartErrorState from '@components/Search/ChartErrorState';
import SearchChartView from '@components/Search/SearchChartView';
import WidgetContainer from '@components/WidgetContainer';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type {InsightsChartSpec} from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {INSIGHTS_CHART_STATE} from '@pages/Insights/resolveChartData';
import useInsightsChartData from '@pages/Insights/useInsightsChartData';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type InsightsChartWidgetProps = {
    dashboardID: InsightsDashboardID;

    /** The chart this card draws, as its dashboard declares it */
    chart: InsightsChartSpec;

    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Hash of the dashboard-wide query, which the record naming this chart's snapshot is stored under */
    hash: number | undefined;

    /** Asks for the dashboard again, offered to the reader when this chart's snapshot failed */
    onRetry: () => void;

    containerStyles?: StyleProp<ViewStyle>;
};

function InsightsChartWidget({dashboardID, hash, chart, filters, onRetry, containerStyles}: InsightsChartWidgetProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);

    const {queryJSON, data, state} = useInsightsChartData(dashboardID, hash, chart, filters);
    const groupBy = queryJSON?.groupBy;

    if (!queryJSON || !groupBy) {
        return null;
    }

    return (
        <WidgetContainer
            title={translate(chart.titleKey)}
            containerStyles={containerStyles}
            titleRightContent={
                state === INSIGHTS_CHART_STATE.READY ? (
                    <WidgetHeaderMenu
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
                ) : null
            }
        >
            {state === INSIGHTS_CHART_STATE.ERROR ? (
                <ChartErrorState onRetry={onRetry} />
            ) : (
                <View style={[shouldUseNarrowLayout ? styles.ph5 : [styles.ph8, styles.pt3], chart.view === CONST.SEARCH.VIEW.PIE && styles.pb6]}>
                    <SearchChartView
                        queryJSON={queryJSON}
                        view={chart.view}
                        groupBy={groupBy}
                        data={data}
                        isLoading={state === INSIGHTS_CHART_STATE.LOADING}
                        color={chart.color}
                    />
                </View>
            )}
        </WidgetContainer>
    );
}

export default InsightsChartWidget;
