import {BarChart, LineChart, PieChart} from '@components/Charts';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatToParts} from '@libs/NumberFormatUtils';
import {getDateFilterRange} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import {format} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy, SearchQueryJSON} from './types';

import {buildChartSeries} from './buildChartSeries';
import {buildChartDrillDownQuery} from './chartDrillDown';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import getInProgressBucketLabel from './getInProgressBucketLabel';
import {useSearchQueryContext} from './SearchContext';

type SearchChartViewProps = {
    queryJSON: Readonly<SearchQueryJSON> | undefined;

    /** The view type (bar, etc.) */
    view: ChartView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: GroupedItem[];

    isLoading?: boolean;

    /** Whether a bar chart labels its bars and a donut chart shows its legend. Line chart labels always show. */
    shouldShowGroupLabels?: boolean;

    /** Renders the details of the plotted groups below the chart */
    renderDetails?: (rows: SearchChartDataRow[]) => React.ReactNode;

    /** Style of the view around the chart, which the details below it don't share */
    chartContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Layer 3 component - dispatches to the appropriate chart type based on view parameter
 * and handles navigation/drill-down logic
 */
function SearchChartView({queryJSON, view, groupBy, data, isLoading, shouldShowGroupLabels = true, renderDetails, chartContainerStyle}: SearchChartViewProps) {
    const {preferredLocale, translate, dateFnsLocale} = useLocalize();
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();

    const {getLabel, getShortLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];

    const today = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    const dateFilterRange = queryJSON ? getDateFilterRange(queryJSON) : {};
    const rows = buildChartSeries({
        data,
        view,
        getLabel,
        getShortLabel,
        getCurrencyDecimals,
        getInProgressLabel: (item) => getInProgressBucketLabel({groupBy, item, today, dateFnsLocale, dateFilterRange, translate}),
    });
    const points = rows.map((row) => row.point);

    const handleItemPress = (index: number) => {
        const item = rows.at(index)?.item;
        if (!item || !queryJSON) {
            return;
        }

        const query = buildChartDrillDownQuery(queryJSON, getFilterQuery(item));

        if (!query) {
            return;
        }
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, searchKey: currentSearchKey}));
    };

    const firstItem = data.at(0);
    const currency = sanitizeCurrencyCode(firstItem?.currency ?? CONST.CURRENCY.USD);
    const parts = formatToParts(preferredLocale, 0, {style: 'currency', currency});
    const currencyIndex = parts.findIndex((p) => p.type === 'currency');
    const integerIndex = parts.findIndex((p) => p.type === 'integer');
    const intlSymbol = parts.find((p) => p.type === 'currency')?.value;
    const unit = {value: getCurrencySymbol(currency) ?? intlSymbol ?? currency, fallback: intlSymbol ?? currency};
    const unitPosition = currencyIndex < integerIndex ? 'left' : 'right';

    const CHART_VIEW_TO_CHART: Record<ChartView, React.ReactNode> = {
        [CONST.SEARCH.VIEW.BAR]: (
            <BarChart
                data={points}
                isLoading={isLoading}
                onBarPress={(dataPoint, index) => handleItemPress(index)}
                yAxisUnit={unit}
                yAxisUnitPosition={unitPosition}
                shouldShowLabels={shouldShowGroupLabels}
            />
        ),
        [CONST.SEARCH.VIEW.LINE]: (
            <LineChart
                data={points}
                isLoading={isLoading}
                onPointPress={(dataPoint, index) => handleItemPress(index)}
                yAxisUnit={unit}
                yAxisUnitPosition={unitPosition}
            />
        ),
        [CONST.SEARCH.VIEW.PIE]: (
            <PieChart
                data={points}
                isLoading={isLoading}
                onSlicePress={(dataPoint, index) => handleItemPress(index)}
                valueUnit={unit.value}
                valueUnitPosition={unitPosition}
                shouldShowLegend={shouldShowGroupLabels}
            />
        ),
    };

    return (
        <>
            <View style={chartContainerStyle}>{CHART_VIEW_TO_CHART[view]}</View>
            {renderDetails?.(rows)}
        </>
    );
}

export default SearchChartView;
