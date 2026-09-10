import type {ChartDataPoint} from '@components/Charts';
import {getSliceColorsByDataIndex} from '@components/Charts/utils';
import VictoryTheme from '@components/Charts/VictoryTheme';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

import type {ChartView, GroupedItem, SearchChartDataRow} from './types';

type BuildChartSeriesParams = {
    /** Grouped search results, in the order the search returned them */
    data: GroupedItem[];

    /** The chart type the rows are plotted on, which decides how groups are colored */
    view: ChartView;

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;
};

/**
 * Builds the series a chart plots: one row per group, each pairing the plotted point with the
 * grouped search result it came from.
 *
 * This is the single place group totals are turned into plotted values, so the chart and anything
 * rendered next to it (the inline details table) read the same numbers in the same order.
 */
function buildChartSeries({data, view, getLabel, getShortLabel, getCurrencyDecimals}: BuildChartSeriesParams): SearchChartDataRow[] {
    const rows = data.map((item) => {
        const decimals = getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD);
        const point: ChartDataPoint = {
            label: StringUtils.normalize(getLabel(item)),
            shortLabel: getShortLabel?.(item),
            total: convertToFrontendAmountAsInteger(item.total ?? 0, decimals),
        };

        return {point, item};
    });

    // Pie colors follow the slice ranking rather than the array order, so they come from the same
    // helper the canvas draws from. Bars are colored by position, and a line is single-colored.
    const pieColors = view === CONST.SEARCH.VIEW.PIE ? getSliceColorsByDataIndex(rows.map((row) => row.point)) : undefined;

    return rows.map((row, index) => {
        let color;
        if (pieColors) {
            color = pieColors.at(index);
        } else if (view === CONST.SEARCH.VIEW.BAR) {
            color = VictoryTheme.colors.getColor(index);
        }

        return {...row, color};
    });
}

/**
 * The share `value` makes up of `total`, as a percentage.
 *
 * Both sides are taken as absolute values because a group's total can be negative. Returns undefined
 * when there is no total to measure against, which is the caller's signal to omit the share entirely
 * rather than show a misleading 0%.
 */
function getPercentOfTotal(value: number | undefined, total: number | undefined): number | undefined {
    const denominator = Math.abs(total ?? 0);
    if (denominator === 0) {
        return undefined;
    }

    return (Math.abs(value ?? 0) / denominator) * 100;
}

export {buildChartSeries, getPercentOfTotal};
