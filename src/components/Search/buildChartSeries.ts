import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import VictoryTheme from '@components/Charts/VictoryTheme';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
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
    endOfMonth,
    endOfQuarter,
    endOfYear,
    format,
    getDate,
    getDay,
    isSameDay,
    isSameMonth,
    parseISO,
    startOfMonth,
    startOfQuarter,
    startOfYear,
    subMonths,
} from 'date-fns';

import type {ChartBucketRange, ChartBucketUnit} from './chartGroupByConfig';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';

const CHART_SERIES_KEY = {
    PRIMARY: 'primary',
    COMPARISON: 'comparison',
} as const;

const DAYS_IN_WEEK = 7;

/** Bucket offset from the period start. Weeks count from the week holding the first day, whatever weekday weeks start on. */
const BUCKET_OFFSET: Record<ChartBucketUnit, (bucketStart: Date, periodStart: Date) => number> = {
    day: differenceInCalendarDays,
    week: (bucketStart, periodStart) => Math.ceil(differenceInCalendarDays(bucketStart, periodStart) / DAYS_IN_WEEK),
    month: differenceInCalendarMonths,
    quarter: differenceInCalendarQuarters,
    year: differenceInCalendarYears,
};

const BUCKET_ADD: Record<ChartBucketUnit, (date: Date, amount: number) => Date> = {
    day: addDays,
    week: (date, amount) => addDays(date, amount * DAYS_IN_WEEK),
    month: addMonths,
    quarter: addQuarters,
    year: addYears,
};

/** Position labels for paired buckets that share no calendar name */
const BUCKET_POSITION_LABEL = {
    day: 'insightsPage.compare.dayNumber',
    week: 'insightsPage.compare.weekNumber',
    month: 'insightsPage.compare.monthNumber',
    quarter: 'insightsPage.compare.quarterNumber',
    year: 'insightsPage.compare.yearNumber',
} as const satisfies Record<ChartBucketUnit, string>;

/** Labels for a lone bucket, which has no position to tell it apart by */
const BUCKET_NAME_LABEL = {
    day: 'common.day',
    week: 'common.week',
    month: 'common.month',
    quarter: 'common.quarter',
    year: 'common.year',
} as const satisfies Record<ChartBucketUnit, string>;

/** A compared period's color and dates */
type ChartComparisonPeriod = {
    color: string;

    /** Bucket offsets are measured from its start */
    range: ChartBucketRange;
};

/** A second series, paired with the primary one */
type ChartComparison = {
    /** Grouped rows of the comparison period */
    rows: GroupedItem[];

    primaryPeriod: ChartComparisonPeriod;

    comparisonPeriod: ChartComparisonPeriod;
};

type BuildChartSeriesParams = {
    /** Grouped rows drawn as the primary series */
    rows: GroupedItem[];

    /** Second series, when comparing */
    comparison?: ChartComparison;

    /** The chart type the rows are plotted on, which decides how groups are colored */
    view: ChartView;

    /** Decides how rows of the two periods pair up */
    groupBy: SearchGroupBy;

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;

    /** Formats labels shared by paired time buckets */
    translate: LocaleContextProps['translate'];

    dateFnsLocale: LocaleContextProps['dateFnsLocale'];

    /** Returns the label of a group whose period hasn't ended yet, or undefined for a finished one */
    getInProgressLabel?: (item: GroupedItem) => string | undefined;
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
 * that can be localized or repeated. Time buckets key on their start date, which a current bucket looks up by its
 * counterpart's start, because a search returns only the buckets that hold expenses.
 */
function getPairingKey(item: GroupedItem, groupBy: SearchGroupBy): string {
    const {bucketUnit, getBucketRange, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const bucketStart = bucketUnit && getBucketRange ? getBucketRange(item).start : undefined;

    return bucketStart ? getBucketPairingKey(bucketStart) : getFilterQuery(item);
}

function getBucketPairingKey(bucketStart: string): string {
    return `bucket:${bucketStart}`;
}

/** date-fns patterns for a bucket's full and axis names */
type CalendarNamePatterns = {full: string; short: string};

/** Calendar name patterns for a period's buckets, like "January" or "Mon". Undefined when a name could repeat within the period. */
function getCalendarNamePatterns(bucketUnit: ChartBucketUnit, periodStart: Date, periodEnd: Date): CalendarNamePatterns | undefined {
    switch (bucketUnit) {
        case 'day':
            if (differenceInCalendarDays(periodEnd, periodStart) < DAYS_IN_WEEK) {
                return {full: 'EEE', short: 'EEE'};
            }
            if (isSameMonth(periodStart, periodEnd)) {
                return {full: 'do', short: 'do'};
            }
            return periodEnd < addYears(periodStart, 1) ? {full: 'MMM d', short: 'MMM d'} : undefined;
        case 'month':
            return differenceInCalendarMonths(periodEnd, periodStart) < 12 ? {full: 'LLLL', short: 'LLL'} : undefined;
        case 'quarter':
            return differenceInCalendarQuarters(periodEnd, periodStart) < 4 ? {full: 'QQQ', short: 'QQQ'} : undefined;
        default:
            return undefined;
    }
}

/** Whole months between the periods' starts when they begin on the same day of the month, like a month or a year apart */
function getMonthShift(primaryStart: Date, comparisonStart: Date): number | undefined {
    return getDate(primaryStart) === getDate(comparisonStart) ? differenceInCalendarMonths(primaryStart, comparisonStart) : undefined;
}

/**
 * The bucket a current bucket is compared with, or undefined when the comparison period has none, like October 31
 * against September, February 29 against a year without one, or a sixth week against a month of five.
 */
function getCounterpartBucketRange(
    bucketRange: ChartBucketRange,
    {primaryPeriod, comparisonPeriod}: Pick<ChartComparison, 'primaryPeriod' | 'comparisonPeriod'>,
    bucketUnit: ChartBucketUnit,
): ChartBucketRange | undefined {
    const bucketStart = parseISO(bucketRange.start);
    const primaryStart = parseISO(primaryPeriod.range.start);
    const comparisonStart = parseISO(comparisonPeriod.range.start);
    const monthShift = getMonthShift(primaryStart, comparisonStart);

    let counterpartStart: Date;
    if (bucketUnit === 'day' && monthShift !== undefined) {
        // Periods a calendar month or year apart compare a day with the same date, which a shorter month can lack.
        counterpartStart = subMonths(bucketStart, monthShift);
        if (getDate(counterpartStart) !== getDate(bucketStart)) {
            return undefined;
        }
    } else {
        const dateInBucket = BUCKET_ADD[bucketUnit](comparisonStart, BUCKET_OFFSET[bucketUnit](bucketStart, primaryStart));
        // Align weeks to the primary bucket's week start.
        const toBucketStart: Record<ChartBucketUnit, (date: Date) => Date> = {
            day: (date) => date,
            week: (date) => addDays(date, -((getDay(date) - getDay(bucketStart) + DAYS_IN_WEEK) % DAYS_IN_WEEK)),
            month: startOfMonth,
            quarter: startOfQuarter,
            year: startOfYear,
        };
        counterpartStart = toBucketStart[bucketUnit](dateInBucket);
    }

    const start = format(counterpartStart, CONST.DATE.FNS_FORMAT_STRING);
    if (start > comparisonPeriod.range.end) {
        return undefined;
    }
    return {start, end: format(addDays(BUCKET_ADD[bucketUnit](counterpartStart, 1), -1), CONST.DATE.FNS_FORMAT_STRING)};
}

/** The part of a bucket inside its period, since a week or month can start before the period or end after it */
function clipToPeriod(range: ChartBucketRange, period: ChartBucketRange): ChartBucketRange {
    return {
        start: range.start > period.start ? range.start : period.start,
        end: range.end < period.end ? range.end : period.end,
    };
}

/** Names a range of dates, by its calendar name when it spans a whole one, like "October 2026", or else by its dates */
function formatDates({start, end}: ChartBucketRange, dateFnsLocale: LocaleContextProps['dateFnsLocale']): string {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const spans = (toStart: (date: Date) => Date, toEnd: (date: Date) => Date) => isSameDay(startDate, toStart(startDate)) && isSameDay(endDate, toEnd(startDate));

    if (isSameDay(startDate, endDate)) {
        return format(startDate, 'MMM d, yyyy', {locale: dateFnsLocale});
    }
    if (spans(startOfYear, endOfYear)) {
        return format(startDate, 'yyyy', {locale: dateFnsLocale});
    }
    if (spans(startOfQuarter, endOfQuarter)) {
        return format(startDate, 'QQQ yyyy', {locale: dateFnsLocale});
    }
    if (spans(startOfMonth, endOfMonth)) {
        return format(startDate, 'LLLL yyyy', {locale: dateFnsLocale});
    }
    return DateUtils.getFormattedDateRangeForSearch(start, end, dateFnsLocale);
}

/** The dates each period's value at a point covers: a time bucket's own, or the whole period for a ranking group */
function getSeriesDateLabels(
    bucketRange: ChartBucketRange | undefined,
    counterpartRange: ChartBucketRange | undefined,
    {primaryPeriod, comparisonPeriod}: ChartComparison,
    dateFnsLocale: LocaleContextProps['dateFnsLocale'],
): Record<string, string> {
    if (!bucketRange) {
        return {[CHART_SERIES_KEY.PRIMARY]: formatDates(primaryPeriod.range, dateFnsLocale), [CHART_SERIES_KEY.COMPARISON]: formatDates(comparisonPeriod.range, dateFnsLocale)};
    }

    return {
        [CHART_SERIES_KEY.PRIMARY]: formatDates(clipToPeriod(bucketRange, primaryPeriod.range), dateFnsLocale),
        ...(counterpartRange && {[CHART_SERIES_KEY.COMPARISON]: formatDates(clipToPeriod(counterpartRange, comparisonPeriod.range), dateFnsLocale)}),
    };
}

/** Labels a time bucket with the calendar name it shares with its paired bucket, like "January", or else its position, like "Week 2". A bucket with no pair keeps its own name. */
function getComparedBucketLabel(
    bucketStart: string,
    counterpartStart: string | undefined,
    primaryPeriod: ChartComparisonPeriod,
    bucketUnit: ChartBucketUnit,
    bucketCount: number,
    translate: LocaleContextProps['translate'],
    dateFnsLocale: LocaleContextProps['dateFnsLocale'],
): {label: string; shortLabel: string} {
    const bucketDate = parseISO(bucketStart);
    const primaryStart = parseISO(primaryPeriod.range.start);
    const patterns = getCalendarNamePatterns(bucketUnit, primaryStart, parseISO(primaryPeriod.range.end));

    if (patterns && (!counterpartStart || format(bucketDate, patterns.full) === format(parseISO(counterpartStart), patterns.full))) {
        return {label: format(bucketDate, patterns.full, {locale: dateFnsLocale}), shortLabel: format(bucketDate, patterns.short, {locale: dateFnsLocale})};
    }
    const positionLabel =
        bucketCount === 1 ? translate(BUCKET_NAME_LABEL[bucketUnit]) : translate(BUCKET_POSITION_LABEL[bucketUnit], BUCKET_OFFSET[bucketUnit](bucketDate, primaryStart) + 1);
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
    comparison,
    view,
    groupBy,
    getLabel,
    getShortLabel,
    getCurrencyDecimals,
    translate,
    dateFnsLocale,
    getInProgressLabel,
}: BuildChartSeriesParams): SearchChartModel {
    const series: ChartSeries[] = [{key: CHART_SERIES_KEY.PRIMARY, color: comparison?.primaryPeriod.color}];
    if (comparison) {
        series.push({key: CHART_SERIES_KEY.COMPARISON, color: comparison.comparisonPeriod.color});
    }

    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));
    const comparisonByPairingKey = new Map((comparison?.rows ?? []).map((item) => [getPairingKey(item, groupBy), item]));
    const {bucketUnit, getBucketRange} = CHART_GROUP_BY_CONFIG[groupBy];

    const rows = primaryRows.map((item) => {
        const bucketRange = bucketUnit && getBucketRange ? getBucketRange(item) : undefined;
        const counterpartRange = comparison && bucketUnit && bucketRange ? getCounterpartBucketRange(bucketRange, comparison, bucketUnit) : undefined;
        const pairingKey = bucketRange ? counterpartRange && getBucketPairingKey(counterpartRange.start) : getPairingKey(item, groupBy);
        const comparisonItem = pairingKey ? comparisonByPairingKey.get(pairingKey) : undefined;
        const comparedLabel =
            comparison && bucketUnit && bucketRange
                ? getComparedBucketLabel(bucketRange.start, counterpartRange?.start, comparison.primaryPeriod, bucketUnit, primaryRows.length, translate, dateFnsLocale)
                : undefined;
        // A bucket with no counterpart plots nothing for the comparison, unlike one with no expenses, which plots 0.
        const hasComparisonValue = !!comparison && (!bucketRange || !!counterpartRange);
        const label = comparedLabel?.label ?? StringUtils.normalize(getLabel(item));
        const shortLabel = comparedLabel ? comparedLabel.shortLabel : getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const point: ChartDataPoint = {
            label,
            shortLabel,
            values: {
                [CHART_SERIES_KEY.PRIMARY]: getAmount(item),
                ...(hasComparisonValue && {[CHART_SERIES_KEY.COMPARISON]: comparisonItem ? getAmount(comparisonItem) : 0}),
            },
            percentOfTotal: item.percentOfTotal,
            seriesLabels: comparison ? getSeriesDateLabels(bucketRange, counterpartRange, comparison, dateFnsLocale) : undefined,
        };
        if (inProgressLabel !== undefined) {
            point.isInProgress = true;
            const primaryDates = point.seriesLabels?.[CHART_SERIES_KEY.PRIMARY];
            // When comparing, only the current period is still in progress, so its row says so and the bucket keeps its name.
            if (point.seriesLabels && primaryDates) {
                point.seriesLabels[CHART_SERIES_KEY.PRIMARY] = translate('search.periodSoFar', {period: primaryDates});
            } else {
                point.label = inProgressLabel;
                point.shortLabel = shortLabel ?? label;
            }
        }

        return {point, item, comparisonItem};
    });

    const pieColors = view === CONST.SEARCH.VIEW.PIE ? getSliceColorsByDataIndex(rows.map((row) => row.point)) : undefined;

    return {
        series,
        rows: rows.map((row, index) => {
            let rowColor;
            if (pieColors) {
                rowColor = pieColors.at(index);
            } else if (view === CONST.SEARCH.VIEW.BAR) {
                rowColor = VictoryTheme.colors.getColor(index);
            }

            return {...row, color: rowColor};
        }),
    };
}

export {buildChartSeries, getSliceColorsByDataIndex, CHART_SERIES_KEY};
export type {ChartComparison, SearchChartModel};
