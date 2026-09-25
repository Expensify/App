import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import VictoryTheme from '@components/Charts/VictoryTheme';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import {isShareWorthDrawing} from '@libs/PercentageUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

import {differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarQuarters, differenceInCalendarWeeks, differenceInCalendarYears, parseISO} from 'date-fns';

import type {ChartBucketUnit} from './chartGroupByConfig';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';

/** Keys the chart layer reads each window's amounts under */
const CHART_SERIES_KEY = {
    PRIMARY: 'primary',
    COMPARISON: 'comparison',
} as const;

const BUCKET_DIFFERENCE: Record<ChartBucketUnit, (later: Date, earlier: Date) => number> = {
    day: differenceInCalendarDays,
    week: differenceInCalendarWeeks,
    month: differenceInCalendarMonths,
    quarter: differenceInCalendarQuarters,
    year: differenceInCalendarYears,
};

/** One window plotted as a series: the rows it groups, how the legend names it, and where the window starts. */
type ChartSeriesWindow = {
    /** The window's grouped rows, in the order the search returned them */
    rows: GroupedItem[];

    /** Name shown in the legend and the tooltip, left out by a chart plotting one unnamed series */
    label?: string;

    color?: string;

    /** First day of the window, `yyyy-MM-dd`, which its buckets' positions are measured from */
    start?: string;
};

type BuildChartSeriesParams = {
    /** The window on screen, drawn as the chart's primary series */
    primary: ChartSeriesWindow;

    /** The window drawn beside it, left out when nothing is compared */
    comparison?: ChartSeriesWindow;

    /** The chart type the rows are plotted on, which decides how groups are colored */
    view: ChartView;

    /** What the rows are grouped by, which decides how the two windows' rows pair up */
    groupBy: SearchGroupBy;

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;
};

type SearchChartModel = {
    /** Metadata for each plotted series, primary first */
    series: ChartSeries[];

    /** One row per plotted group, holding the point the chart draws and the rows its values came from */
    rows: SearchChartDataRow[];
};

/** Pie colors follow the slice ranking rather than the array order. Groups the donut leaves out get no color. */
function getSliceColorsByDataIndex(data: ChartDataPoint[]): Array<string | undefined> {
    const colors: Array<string | undefined> = Array.from({length: data.length});

    const ranked = data
        .map((point, index) => ({absTotal: Math.abs(point.values[CHART_SERIES_KEY.PRIMARY] ?? 0), percentOfTotal: point.percentOfTotal, index}))
        .filter((entry) => isShareWorthDrawing(entry.percentOfTotal))
        .sort((a, b) => b.absTotal - a.absTotal);

    for (const [rank, entry] of ranked.entries()) {
        colors[entry.index] = VictoryTheme.colors.getColor(rank);
    }

    return colors;
}

/**
 * The key a row shares with its counterpart in the other window.
 *
 * Ranking rows key on the group's own identity, which their filter query already carries, rather than on a label
 * that can be localized or repeated. Time buckets key on their position within their own window, because a search
 * returns only the buckets that hold expenses, so positions in the array do not line up between windows.
 */
function getPairingKey(item: GroupedItem, windowStart: string | undefined, groupBy: SearchGroupBy): string {
    const {bucketUnit, getBucketRange, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const bucketStart = bucketUnit && getBucketRange ? getBucketRange(item).start : undefined;

    if (!bucketUnit || !bucketStart || !windowStart) {
        return getFilterQuery(item);
    }

    return `bucket:${BUCKET_DIFFERENCE[bucketUnit](parseISO(bucketStart), parseISO(windowStart))}`;
}

/**
 * Prepares what a chart draws: the series it plots, and one row per group.
 *
 * This is the single place group totals are turned into plotted values. A row keeps the grouped items its values
 * were read from, so a press on it can be traced back to the window it belongs to.
 */
function buildChartSeries({primary, comparison, view, groupBy, getLabel, getShortLabel, getCurrencyDecimals}: BuildChartSeriesParams): SearchChartModel {
    const series: ChartSeries[] = [{key: CHART_SERIES_KEY.PRIMARY, label: primary.label, color: primary.color}];
    if (comparison) {
        series.push({key: CHART_SERIES_KEY.COMPARISON, label: comparison.label, color: comparison.color});
    }

    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));
    const comparisonByPairingKey = new Map((comparison?.rows ?? []).map((item) => [getPairingKey(item, comparison?.start, groupBy), item]));

    const rows = primary.rows.map((item) => {
        const comparisonItem = comparison ? comparisonByPairingKey.get(getPairingKey(item, primary.start, groupBy)) : undefined;
        const point: ChartDataPoint = {
            label: StringUtils.normalize(getLabel(item)),
            shortLabel: getShortLabel?.(item),
            values: {
                [CHART_SERIES_KEY.PRIMARY]: getAmount(item),
                ...(!!comparison && {[CHART_SERIES_KEY.COMPARISON]: comparisonItem ? getAmount(comparisonItem) : 0}),
            },
            percentOfTotal: item.percentOfTotal,
        };

        return {point, item, comparisonItem};
    });

    const pieColors = view === CONST.SEARCH.VIEW.PIE ? getSliceColorsByDataIndex(rows.map((row) => row.point)) : undefined;

    return {
        series,
        rows: rows.map((row, index) => {
            let color;
            if (pieColors) {
                color = pieColors.at(index);
                // Comparing tells the windows apart by color, so the per-group palette is only for a lone series.
            } else if (view === CONST.SEARCH.VIEW.BAR && !comparison) {
                color = primary.color ?? VictoryTheme.colors.getColor(index);
            }

            return {...row, color};
        }),
    };
}

export {buildChartSeries, getSliceColorsByDataIndex, CHART_SERIES_KEY};
export type {BuildChartSeriesParams, ChartSeriesWindow, SearchChartModel};
