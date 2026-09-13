import type {ChartDataPoint} from '@components/Charts';
import VictoryTheme from '@components/Charts/VictoryTheme';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import {format} from '@libs/NumberFormatUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';
import type Locale from '@src/types/onyx/Locale';

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

/** Pie colors follow the slice ranking rather than the array order */
function getSliceColorsByDataIndex(data: ChartDataPoint[]): string[] {
    const colors: string[] = Array.from({length: data.length});

    const ranked = data.map((point, index) => ({absTotal: Math.abs(point.total), index})).sort((a, b) => b.absTotal - a.absTotal);

    for (const [rank, entry] of ranked.entries()) {
        colors[entry.index] = VictoryTheme.colors.getColor(rank);
    }

    return colors;
}

/** This is the single place group totals are turned into plotted values. */
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

function getPercentOfTotal(value: number | undefined, total: number | undefined): number | undefined {
    const denominator = Math.abs(total ?? 0);
    if (denominator === 0) {
        return undefined;
    }

    return (Math.abs(value ?? 0) / denominator) * 100;
}

const SMALLEST_REPORTED_PERCENT = 0.1;

/** Formats a share for display, to at most one decimal place. */
function formatPercentOfTotal(percent: number, locale: Locale | undefined): string {
    const options: Intl.NumberFormatOptions = {style: 'percent', maximumFractionDigits: 1};

    if (percent > 0 && percent < SMALLEST_REPORTED_PERCENT / 2) {
        return `<${format(locale, SMALLEST_REPORTED_PERCENT / 100, options)}`;
    }

    return format(locale, percent / 100, options);
}

export {buildChartSeries, formatPercentOfTotal, getPercentOfTotal};
