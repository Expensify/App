import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import getPrimaryValue from '@components/Charts/utils/getPrimaryValue';
import VictoryTheme from '@components/Charts/VictoryTheme';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {isShareWorthDrawing} from '@libs/PercentageUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

import type {NonEmptyTuple} from 'type-fest';

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

/** Labels for paired buckets that share no calendar name, numbered by position unless the bucket is the only one */
const BUCKET_LABEL = {
    day: 'insightsPage.compare.dayLabel',
    week: 'insightsPage.compare.weekLabel',
    month: 'insightsPage.compare.monthLabel',
    quarter: 'insightsPage.compare.quarterLabel',
    year: 'insightsPage.compare.yearLabel',
} as const satisfies Record<ChartBucketUnit, string>;

/** A period's first and last day */
type ChartPeriod = {start: string; end: string};

/** The two periods being compared, whose buckets pair up by their offset from each period's start */
type ChartComparisonPeriods = {
    primary: ChartPeriod;
    comparison: ChartPeriod;
};

/** Rows drawn as a second series against the primary one */
type ChartComparison = {
    /** The compared rows, each paired with the plotted group stored under the same key, or with its bucket's counterpart when `periods` is set */
    data: GroupedItem[];

    /** Names the series in the tooltip, like "Average". Left out, each row names the dates it covers. */
    label?: string;

    /** Color of the compared line */
    color: string;

    /** Set when the rows are another period's */
    periods?: ChartComparisonPeriods;
};

type BuildChartSeriesParams = {
    /** Grouped search results, in the order the search returned them */
    data: GroupedItem[];

    /** Rows the chart is compared against, drawn as a second series */
    comparison?: ChartComparison;

    /** Decides how the groups of the two periods pair up */
    groupBy: SearchGroupBy;

    /** The chart type the rows are plotted on, which decides how groups are colored */
    view: ChartView;

    /** Returns the full label of a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a group, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns how many decimals a currency is displayed with */
    getCurrencyDecimals: (currency: string) => number;

    /** Formats labels shared by paired time buckets */
    translate: LocaleContextProps['translate'];

    /** Locale the names of compared periods are formatted in */
    dateFnsLocale: LocaleContextProps['dateFnsLocale'];

    /** Returns the label of a group whose period hasn't ended yet, or undefined for a finished one */
    getInProgressLabel?: (item: GroupedItem) => string | undefined;
};

type SearchChartModel = {
    /** Metadata for each plotted series, primary first */
    series: NonEmptyTuple<ChartSeries>;

    /** One row per plotted group, holding the point the chart draws and the row its values came from */
    rows: SearchChartDataRow[];
};

/** Pie colors follow the slice ranking rather than the array order. Groups the donut leaves out get no color. */
function getSliceColorsByDataIndex(data: ChartDataPoint[]): Array<string | undefined> {
    const colors: Array<string | undefined> = Array.from({length: data.length});

    const ranked = data
        .map((point, index) => ({absTotal: Math.abs(getPrimaryValue(point, CHART_SERIES_KEY.PRIMARY)), percentOfTotal: point.percentOfTotal, index}))
        .filter((entry) => isShareWorthDrawing(entry.percentOfTotal))
        .sort((a, b) => b.absTotal - a.absTotal);

    for (const [rank, entry] of ranked.entries()) {
        colors[entry.index] = VictoryTheme.colors.getColor(rank);
    }

    return colors;
}

/** date-fns patterns for a bucket's full and axis names, and for the rest of its date that the name leaves out, like the year of "January" */
type CalendarNamePatterns = {full: string; short: string; rest: string};

/** Calendar name patterns for a period's buckets, like "January" or "Mon". Undefined when a name could repeat within the period. */
function getCalendarNamePatterns(bucketUnit: ChartBucketUnit, periodStart: Date, periodEnd: Date): CalendarNamePatterns | undefined {
    switch (bucketUnit) {
        case 'day':
            if (differenceInCalendarDays(periodEnd, periodStart) < DAYS_IN_WEEK) {
                return {full: 'EEE', short: 'EEE', rest: 'MMM d, yyyy'};
            }
            if (isSameMonth(periodStart, periodEnd)) {
                return {full: 'do', short: 'do', rest: 'LLLL yyyy'};
            }
            return periodEnd < addYears(periodStart, 1) ? {full: 'MMM d', short: 'MMM d', rest: 'yyyy'} : undefined;
        case 'month':
            return differenceInCalendarMonths(periodEnd, periodStart) < 12 ? {full: 'LLLL', short: 'LLL', rest: 'yyyy'} : undefined;
        case 'quarter':
            return differenceInCalendarQuarters(periodEnd, periodStart) < 4 ? {full: 'QQQ', short: 'QQQ', rest: 'yyyy'} : undefined;
        default:
            return undefined;
    }
}

/** Start of the bucket holding a date. Weeks start on the same weekday as `weekStart`. */
function getBucketStart(bucketUnit: ChartBucketUnit, date: Date, weekStart: Date): Date {
    switch (bucketUnit) {
        case 'week':
            return addDays(date, -((getDay(date) - getDay(weekStart) + DAYS_IN_WEEK) % DAYS_IN_WEEK));
        case 'month':
            return startOfMonth(date);
        case 'quarter':
            return startOfQuarter(date);
        case 'year':
            return startOfYear(date);
        default:
            return date;
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
function getCounterpartBucketRange(bucketRange: ChartBucketRange, periods: ChartComparisonPeriods, bucketUnit: ChartBucketUnit): ChartBucketRange | undefined {
    const bucketStart = parseISO(bucketRange.start);
    const primaryStart = parseISO(periods.primary.start);
    const comparisonStart = parseISO(periods.comparison.start);
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
        counterpartStart = getBucketStart(bucketUnit, dateInBucket, bucketStart);
    }

    const start = format(counterpartStart, CONST.DATE.FNS_FORMAT_STRING);
    if (start > periods.comparison.end) {
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
function formatDates({start, end}: ChartPeriod, dateFnsLocale: LocaleContextProps['dateFnsLocale']): string {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const isWholeUnit = (toStart: (date: Date) => Date, toEnd: (date: Date) => Date) => isSameDay(startDate, toStart(startDate)) && isSameDay(endDate, toEnd(startDate));

    if (isSameDay(startDate, endDate)) {
        return format(startDate, 'MMM d, yyyy', {locale: dateFnsLocale});
    }
    if (isWholeUnit(startOfYear, endOfYear)) {
        return format(startDate, 'yyyy', {locale: dateFnsLocale});
    }
    if (isWholeUnit(startOfQuarter, endOfQuarter)) {
        return format(startDate, 'QQQ yyyy', {locale: dateFnsLocale});
    }
    if (isWholeUnit(startOfMonth, endOfMonth)) {
        return format(startDate, 'LLLL yyyy', {locale: dateFnsLocale});
    }
    return DateUtils.getFormattedDateRangeForSearch(start, end, dateFnsLocale);
}

/**
 * Labels a time bucket with the calendar name it shares with its paired bucket, like "January", or else its position, like "Week 2".
 * Also returns the pattern that names each period's bucket by what the label leaves out, like its year.
 */
function getComparedBucketLabel(
    bucketStart: string,
    counterpartStart: string | undefined,
    primaryPeriod: ChartBucketRange,
    bucketUnit: ChartBucketUnit,
    translate: LocaleContextProps['translate'],
    dateFnsLocale: LocaleContextProps['dateFnsLocale'],
): {label: string; shortLabel: string; seriesLabelPattern?: string} {
    const bucketDate = parseISO(bucketStart);
    const primaryStart = parseISO(primaryPeriod.start);
    const primaryEnd = parseISO(primaryPeriod.end);
    const patterns = getCalendarNamePatterns(bucketUnit, primaryStart, primaryEnd);

    if (patterns && (!counterpartStart || format(bucketDate, patterns.full) === format(parseISO(counterpartStart), patterns.full))) {
        return {
            label: format(bucketDate, patterns.full, {locale: dateFnsLocale}),
            shortLabel: format(bucketDate, patterns.short, {locale: dateFnsLocale}),
            seriesLabelPattern: patterns.rest,
        };
    }
    const isLoneBucket = BUCKET_OFFSET[bucketUnit](getBucketStart(bucketUnit, primaryEnd, bucketDate), primaryStart) === 0;
    const positionLabel = translate(BUCKET_LABEL[bucketUnit], isLoneBucket ? undefined : BUCKET_OFFSET[bucketUnit](bucketDate, primaryStart) + 1);
    return {label: positionLabel, shortLabel: positionLabel};
}

/** This is the single place group totals are turned into plotted values. */
function buildChartSeries({
    data,
    comparison,
    groupBy,
    view,
    getLabel,
    getShortLabel,
    getCurrencyDecimals,
    translate,
    dateFnsLocale,
    getInProgressLabel,
}: BuildChartSeriesParams): SearchChartModel {
    const {bucketUnit, getBucketRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const periods = bucketUnit && getBucketRange ? comparison?.periods : undefined;
    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));
    // A search returns only the buckets holding expenses, so another period's bucket is looked up by its start date.
    const comparedByKey = new Map(comparison?.data.map((item) => [periods && getBucketRange ? getBucketRange(item).start : item.keyForList, item]));

    const rows = data.map((item) => {
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const point: ChartDataPoint = {
            label,
            shortLabel,
            values: {[CHART_SERIES_KEY.PRIMARY]: getAmount(item)},
            percentOfTotal: item.percentOfTotal,
            count: item.count,
        };

        if (periods && bucketUnit && getBucketRange) {
            const bucketRange = getBucketRange(item);
            const counterpartRange = getCounterpartBucketRange(bucketRange, periods, bucketUnit);
            const comparedLabel = getComparedBucketLabel(bucketRange.start, counterpartRange?.start, periods.primary, bucketUnit, translate, dateFnsLocale);
            const getSeriesLabel = (range: ChartBucketRange, period: ChartBucketRange) =>
                comparedLabel.seriesLabelPattern
                    ? format(parseISO(range.start), comparedLabel.seriesLabelPattern, {locale: dateFnsLocale})
                    : formatDates(clipToPeriod(range, period), dateFnsLocale);
            point.label = comparedLabel.label;
            point.shortLabel = comparedLabel.shortLabel;
            point.seriesLabels = {[CHART_SERIES_KEY.PRIMARY]: getSeriesLabel(bucketRange, periods.primary)};
            point.seriesPercentOfTotal = {[CHART_SERIES_KEY.PRIMARY]: item.percentOfTotal};

            // A bucket with no counterpart plots nothing for the comparison, unlike one with no expenses, which plots 0.
            if (counterpartRange) {
                const comparedItem = comparedByKey.get(counterpartRange.start);
                point.values[CHART_SERIES_KEY.COMPARISON] = comparedItem ? getAmount(comparedItem) : 0;
                point.seriesLabels[CHART_SERIES_KEY.COMPARISON] = getSeriesLabel(counterpartRange, periods.comparison);
                point.seriesPercentOfTotal[CHART_SERIES_KEY.COMPARISON] = comparedItem?.percentOfTotal;
            }
        } else {
            const comparedItem = comparedByKey.get(item.keyForList);
            if (comparedItem) {
                point.values[CHART_SERIES_KEY.COMPARISON] = getAmount(comparedItem);
            }
        }

        if (inProgressLabel !== undefined) {
            point.isInProgress = true;
            const primaryDates = point.seriesLabels?.[CHART_SERIES_KEY.PRIMARY];
            if (point.seriesLabels && primaryDates) {
                point.seriesLabels[CHART_SERIES_KEY.PRIMARY] = translate('search.periodSoFar', {period: primaryDates});
            } else {
                point.label = inProgressLabel;
                point.shortLabel = shortLabel ?? label;
            }
        }

        return {point, item};
    });

    const pieColors = view === CONST.SEARCH.VIEW.PIE ? getSliceColorsByDataIndex(rows.map((row) => row.point)) : undefined;

    return {
        series: [{key: CHART_SERIES_KEY.PRIMARY}, ...(comparison ? [{key: CHART_SERIES_KEY.COMPARISON, color: comparison.color, label: comparison.label}] : [])],
        rows: rows.map((row, index) => {
            let color;
            if (pieColors) {
                color = pieColors.at(index);
            } else if (view === CONST.SEARCH.VIEW.BAR) {
                color = VictoryTheme.colors.getColor(index);
            }

            return {...row, point: {...row.point, color}};
        }),
    };
}

export {buildChartSeries, getSliceColorsByDataIndex, CHART_SERIES_KEY};
export type {ChartComparison, ChartComparisonPeriods, ChartPeriod, SearchChartModel};
