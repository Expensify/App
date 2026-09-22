import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';

import {differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarQuarters, differenceInCalendarWeeks, differenceInCalendarYears, parseISO} from 'date-fns';

import type {ChartBucketUnit} from './chartGroupByConfig';
import type {GroupedItem, SearchGroupBy} from './types';

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
    /** The window's grouped rows, sorted the way the chart plots them */
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

    /** What the rows are grouped by, which decides how the two windows' rows pair up */
    groupBy: SearchGroupBy;

    getLabel: (item: GroupedItem) => string;

    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** The row's amount in the units the chart draws (dollars, not cents) */
    getAmount: (item: GroupedItem) => number;
};

/** One plotted group: the point the chart draws, and the rows behind each of its values. */
type SearchChartDataRow = {
    point: ChartDataPoint;

    /** The row the primary series' value came from */
    item: GroupedItem;

    /** The comparison window's row paired with `item`, absent when that window has nothing for this group */
    comparisonItem?: GroupedItem;
};

type SearchChartModel = {
    /** Metadata for each plotted series, primary first */
    series: ChartSeries[];

    rows: SearchChartDataRow[];
};

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
 * Prepares what a chart draws: the series it plots and one row per group, each row keeping the grouped items its
 * values were read from so a press on it can be traced back to the window it belongs to.
 */
function buildChartSeries({primary, comparison, groupBy, getLabel, getShortLabel, getAmount}: BuildChartSeriesParams): SearchChartModel {
    const series: ChartSeries[] = [
        {
            key: CHART_SERIES_KEY.PRIMARY,
            label: primary.label,
            color: primary.color,
        },
    ];
    if (comparison) {
        series.push({
            key: CHART_SERIES_KEY.COMPARISON,
            label: comparison.label,
            color: comparison.color,
        });
    }

    const comparisonByPairingKey = new Map((comparison?.rows ?? []).map((item) => [getPairingKey(item, comparison?.start, groupBy), item]));

    const rows = primary.rows.map((item) => {
        const comparisonItem = comparison ? comparisonByPairingKey.get(getPairingKey(item, primary.start, groupBy)) : undefined;

        return {
            item,
            comparisonItem,
            point: {
                label: getLabel(item),
                shortLabel: getShortLabel?.(item),
                values: {
                    [CHART_SERIES_KEY.PRIMARY]: getAmount(item),
                    ...(!!comparison && {
                        [CHART_SERIES_KEY.COMPARISON]: comparisonItem ? getAmount(comparisonItem) : 0,
                    }),
                },
            },
        };
    });

    return {series, rows};
}

export default buildChartSeries;
export {CHART_SERIES_KEY};
export type {BuildChartSeriesParams, ChartSeriesWindow, SearchChartDataRow, SearchChartModel};
