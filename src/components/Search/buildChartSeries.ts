import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import VictoryTheme from '@components/Charts/VictoryTheme';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import {isShareWorthDrawing} from '@libs/PercentageUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

import {
    addDays,
    addMonths,
    addQuarters,
    addYears,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    differenceInCalendarQuarters,
    differenceInCalendarYears,
    format,
    getDay,
    isSameMonth,
    parseISO,
    startOfMonth,
    startOfQuarter,
    startOfYear,
} from 'date-fns';

import type {ChartBucketRange, ChartBucketUnit} from './chartGroupByConfig';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';

/** Keys the chart layer reads each period's amounts under */
const CHART_SERIES_KEY = {
    PRIMARY: 'primary',
    COMPARISON: 'comparison',
} as const;

const DAYS_IN_WEEK = 7;

/** How many buckets into its period a bucket starts. A week counts from the one holding the period's first day, whichever weekday weeks start on. */
const BUCKET_OFFSET: Record<ChartBucketUnit, (bucketStart: Date, periodStart: Date) => number> = {
    day: differenceInCalendarDays,
    week: (bucketStart, periodStart) => Math.ceil(differenceInCalendarDays(bucketStart, periodStart) / DAYS_IN_WEEK),
    month: differenceInCalendarMonths,
    quarter: differenceInCalendarQuarters,
    year: differenceInCalendarYears,
};

/** Steps a date forward by whole buckets */
const BUCKET_ADD: Record<ChartBucketUnit, (date: Date, amount: number) => Date> = {
    day: addDays,
    week: (date, amount) => addDays(date, amount * DAYS_IN_WEEK),
    month: addMonths,
    quarter: addQuarters,
    year: addYears,
};

/** Translation of a bucket's position in its period, the label used when the compared buckets share no calendar name */
const BUCKET_POSITION_LABEL = {
    day: 'insightsPage.compare.dayNumber',
    week: 'insightsPage.compare.weekNumber',
    month: 'insightsPage.compare.monthNumber',
    quarter: 'insightsPage.compare.quarterNumber',
    year: 'insightsPage.compare.yearNumber',
} as const satisfies Record<ChartBucketUnit, string>;

/** One of the two compared periods: how the legend names it, its color, and the dates it covers */
type ChartComparisonPeriod = {
    /** Name shown in the legend and the tooltip */
    label: string;

    color: string;

    /** The dates the period covers, which its buckets' positions are measured from */
    range: ChartBucketRange;
};

/** Everything a second series needs to be paired with the primary one and labeled */
type ChartComparison = {
    /** The compared period's grouped rows, in the order the search returned them */
    rows: GroupedItem[];

    /** The period the primary rows were plotted from */
    primaryPeriod: ChartComparisonPeriod;

    /** The period drawn beside it */
    comparisonPeriod: ChartComparisonPeriod;
};

type BuildChartSeriesParams = {
    /** The grouped rows of the period on screen, drawn as the chart's primary series */
    rows: GroupedItem[];

    /** Color of the primary series when nothing is compared */
    color?: string;

    /** The period drawn beside the primary one, left out when nothing is compared */
    comparison?: ChartComparison;

    /** The chart type the rows are plotted on, which decides how groups are colored */
    view: ChartView;

    /** What the rows are grouped by, which decides how the two periods' rows pair up */
    groupBy: SearchGroupBy;

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;

    /** Names a compared time bucket, which the plain bucket label can't since it only fits the period on screen */
    translate: LocaleContextProps['translate'];

    dateFnsLocale: LocaleContextProps['dateFnsLocale'];
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
 * The key a row shares with its counterpart in the other period.
 *
 * Ranking rows key on the group's own identity, which their filter query already carries, rather than on a label
 * that can be localized or repeated. Time buckets key on their position within their own period, because a search
 * returns only the buckets that hold expenses, so positions in the array do not line up between periods.
 */
function getPairingKey(item: GroupedItem, periodStart: string, groupBy: SearchGroupBy): string {
    const {bucketUnit, getBucketRange, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const bucketStart = bucketUnit && getBucketRange ? getBucketRange(item).start : undefined;

    if (!bucketUnit || !bucketStart) {
        return getFilterQuery(item);
    }

    return `bucket:${BUCKET_OFFSET[bucketUnit](parseISO(bucketStart), parseISO(periodStart))}`;
}

/**
 * The dates of the bucket paired with a bucket of the period on screen, for when the compared period returned no row for it.
 * The paired bucket sits at the same position in its own period and is as long as the bucket on screen.
 */
function getCounterpartBucketRange(bucketRange: ChartBucketRange, primaryStart: string, comparisonStart: string, bucketUnit: ChartBucketUnit): ChartBucketRange {
    const bucketStart = parseISO(bucketRange.start);
    const offset = BUCKET_OFFSET[bucketUnit](bucketStart, parseISO(primaryStart));
    const dateInBucket = BUCKET_ADD[bucketUnit](parseISO(comparisonStart), offset);
    // A week starts on the same weekday as the bucket on screen, so the date is moved back to it.
    const toBucketStart: Record<ChartBucketUnit, (date: Date) => Date> = {
        day: (date) => date,
        week: (date) => addDays(date, -((getDay(date) - getDay(bucketStart) + DAYS_IN_WEEK) % DAYS_IN_WEEK)),
        month: startOfMonth,
        quarter: startOfQuarter,
        year: startOfYear,
    };
    const counterpartStart = toBucketStart[bucketUnit](dateInBucket);
    const counterpartEnd = addDays(BUCKET_ADD[bucketUnit](counterpartStart, 1), -1);

    return {start: format(counterpartStart, CONST.DATE.FNS_FORMAT_STRING), end: format(counterpartEnd, CONST.DATE.FNS_FORMAT_STRING)};
}

/** A bucket's calendar name as date-fns patterns: in full, and compact for the axis */
type CalendarNamePatterns = {full: string; short: string};

/**
 * The calendar name a period's buckets can go by, like "January" or "Mon".
 * Undefined when the period is long enough for the name to repeat, or for a unit that has no such name.
 */
function getCalendarNamePatterns(bucketUnit: ChartBucketUnit, periodStart: Date, periodEnd: Date): CalendarNamePatterns | undefined {
    switch (bucketUnit) {
        case 'day':
            if (differenceInCalendarDays(periodEnd, periodStart) < DAYS_IN_WEEK) {
                return {full: 'EEE', short: 'EEE'};
            }
            return isSameMonth(periodStart, periodEnd) ? {full: 'd', short: 'd'} : undefined;
        case 'month':
            return differenceInCalendarMonths(periodEnd, periodStart) < 12 ? {full: 'LLLL', short: 'LLL'} : undefined;
        case 'quarter':
            return differenceInCalendarQuarters(periodEnd, periodStart) < 4 ? {full: 'QQQ', short: 'QQQ'} : undefined;
        default:
            return undefined;
    }
}

/**
 * Names a time bucket so the name fits its counterpart in the compared period too: the calendar name both share,
 * like "January" ("Jan" on the axis), or else its position, like "Week 2".
 */
function getComparedBucketLabel(
    bucketStart: string,
    {primaryPeriod, comparisonPeriod}: ChartComparison,
    bucketUnit: ChartBucketUnit,
    translate: LocaleContextProps['translate'],
    dateFnsLocale: LocaleContextProps['dateFnsLocale'],
): {label: string; shortLabel: string} {
    const bucketDate = parseISO(bucketStart);
    const primaryStart = parseISO(primaryPeriod.range.start);
    const offset = BUCKET_OFFSET[bucketUnit](bucketDate, primaryStart);
    const counterpartDate = BUCKET_ADD[bucketUnit](parseISO(comparisonPeriod.range.start), offset);
    const patterns = getCalendarNamePatterns(bucketUnit, primaryStart, parseISO(primaryPeriod.range.end));

    if (patterns && format(bucketDate, patterns.full) === format(counterpartDate, patterns.full)) {
        return {label: format(bucketDate, patterns.full, {locale: dateFnsLocale}), shortLabel: format(bucketDate, patterns.short, {locale: dateFnsLocale})};
    }
    const positionLabel = translate(BUCKET_POSITION_LABEL[bucketUnit], offset + 1);
    return {label: positionLabel, shortLabel: positionLabel};
}

/**
 * Prepares what a chart draws: the series it plots, and one row per group.
 *
 * This is the single place group totals are turned into plotted values. A row keeps the grouped items its values
 * were read from, so a press on it can be traced back to the period it belongs to.
 */
function buildChartSeries({
    rows: primaryRows,
    color,
    comparison,
    view,
    groupBy,
    getLabel,
    getShortLabel,
    getCurrencyDecimals,
    translate,
    dateFnsLocale,
}: BuildChartSeriesParams): SearchChartModel {
    const series: ChartSeries[] = [{key: CHART_SERIES_KEY.PRIMARY, label: comparison?.primaryPeriod.label, color: comparison?.primaryPeriod.color ?? color}];
    if (comparison) {
        series.push({key: CHART_SERIES_KEY.COMPARISON, label: comparison.comparisonPeriod.label, color: comparison.comparisonPeriod.color});
    }

    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));
    const comparisonByPairingKey = new Map((comparison?.rows ?? []).map((item) => [getPairingKey(item, comparison?.comparisonPeriod.range.start ?? '', groupBy), item]));
    const {bucketUnit, getBucketRange} = CHART_GROUP_BY_CONFIG[groupBy];

    const rows = primaryRows.map((item) => {
        const comparisonItem = comparison ? comparisonByPairingKey.get(getPairingKey(item, comparison.primaryPeriod.range.start, groupBy)) : undefined;
        const comparedLabel = comparison && bucketUnit && getBucketRange ? getComparedBucketLabel(getBucketRange(item).start, comparison, bucketUnit, translate, dateFnsLocale) : undefined;
        const point: ChartDataPoint = {
            label: comparedLabel?.label ?? StringUtils.normalize(getLabel(item)),
            shortLabel: comparedLabel ? comparedLabel.shortLabel : getShortLabel?.(item),
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
            let rowColor;
            if (pieColors) {
                rowColor = pieColors.at(index);
                // Comparing tells the periods apart by color, so the per-group palette is only for a lone series.
            } else if (view === CONST.SEARCH.VIEW.BAR && !comparison) {
                rowColor = color ?? VictoryTheme.colors.getColor(index);
            }

            return {...row, color: rowColor};
        }),
    };
}

export {buildChartSeries, getCounterpartBucketRange, getSliceColorsByDataIndex, CHART_SERIES_KEY};
export type {ChartComparison, SearchChartModel};
