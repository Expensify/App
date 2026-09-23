import {BarChart, LineChart, PieChart} from '@components/Charts';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatToParts} from '@libs/NumberFormatUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy, SearchQueryJSON} from './types';

import {buildChartSeries} from './buildChartSeries';
import {buildChartDrillDownQuery} from './chartDrillDown';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import {useSearchQueryContext} from './SearchContext';

type SearchChartViewProps = {
    queryJSON: Readonly<SearchQueryJSON>;

    /** The view type (bar, etc.) */
    view: ChartView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: GroupedItem[];

    isLoading?: boolean;

    /** Color every bar is drawn in. Only a bar chart reads it. */
    color?: string;

    /** Renders the details of the plotted groups below the chart */
    renderDetails?: (rows: SearchChartDataRow[]) => React.ReactNode;
};

/**
 * Layer 3 component - dispatches to the appropriate chart type based on view parameter
 * and handles navigation/drill-down logic
 */
function SearchChartView({queryJSON, view, groupBy, data, isLoading, color, renderDetails}: SearchChartViewProps) {
    const {preferredLocale} = useLocalize();
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();

    const {getLabel, getShortLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];

    const rows = buildChartSeries({data, view, getLabel, getShortLabel, getCurrencyDecimals, color});
    const points = rows.map((row) => row.point);

    const handleItemPress = (index: number) => {
        const item = rows.at(index)?.item;
        if (!item) {
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
                color={color}
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
                shouldShowLegend={!renderDetails}
            />
        ),
    };

    return (
        <>
            {CHART_VIEW_TO_CHART[view]}
            {renderDetails?.(rows)}
        </>
    );
}

export default SearchChartView;
