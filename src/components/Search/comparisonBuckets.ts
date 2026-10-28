/**
 * Pairs the time buckets of two compared periods and names them, so a chart can draw one period against the other.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';

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

import type {ChartBucketRange} from './chartGroupByConfig';
import type {SearchGroupBy} from './types';

const DAYS_IN_WEEK = 7;

/** A group-by that buckets time */
type TimeGroupBy =
    | typeof CONST.SEARCH.GROUP_BY.DAY
    | typeof CONST.SEARCH.GROUP_BY.WEEK
    | typeof CONST.SEARCH.GROUP_BY.MONTH
    | typeof CONST.SEARCH.GROUP_BY.QUARTER
    | typeof CONST.SEARCH.GROUP_BY.YEAR;

/** Bucket offset from the period start. Weeks count from the week holding the first day, whatever weekday weeks start on. */
const BUCKET_OFFSET: Record<TimeGroupBy, (bucketStart: Date, periodStart: Date) => number> = {
    [CONST.SEARCH.GROUP_BY.DAY]: differenceInCalendarDays,
    [CONST.SEARCH.GROUP_BY.WEEK]: (bucketStart, periodStart) => Math.ceil(differenceInCalendarDays(bucketStart, periodStart) / DAYS_IN_WEEK),
    [CONST.SEARCH.GROUP_BY.MONTH]: differenceInCalendarMonths,
    [CONST.SEARCH.GROUP_BY.QUARTER]: differenceInCalendarQuarters,
    [CONST.SEARCH.GROUP_BY.YEAR]: differenceInCalendarYears,
};

/** Moves a date forward by a number of buckets */
const BUCKET_ADD: Record<TimeGroupBy, (date: Date, amount: number) => Date> = {
    [CONST.SEARCH.GROUP_BY.DAY]: addDays,
    [CONST.SEARCH.GROUP_BY.WEEK]: (date, amount) => addDays(date, amount * DAYS_IN_WEEK),
    [CONST.SEARCH.GROUP_BY.MONTH]: addMonths,
    [CONST.SEARCH.GROUP_BY.QUARTER]: addQuarters,
    [CONST.SEARCH.GROUP_BY.YEAR]: addYears,
};

/** Labels for paired buckets that share no calendar name, numbered by position unless the bucket is the only one */
const BUCKET_LABEL = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.compare.dayLabel',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.compare.weekLabel',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.compare.monthLabel',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.compare.quarterLabel',
    [CONST.SEARCH.GROUP_BY.YEAR]: 'insightsPage.compare.yearLabel',
} as const satisfies Record<TimeGroupBy, string>;

/** Returns whether a group-by buckets time, so its groups can be paired across periods */
function isTimeGroupBy(groupBy: SearchGroupBy): groupBy is TimeGroupBy {
    return groupBy in BUCKET_OFFSET;
}

/** A period's first and last day */
type ChartPeriod = {start: string; end: string};

/** The two periods being compared, whose buckets pair up by their offset from each period's start */
type ChartComparisonPeriods = {
    primary: ChartPeriod;
    comparison: ChartPeriod;

    /** Set when the periods compare month for month, so a day pairs with the same date that many months before */
    monthsApart?: number;
};

/**
 * Returns date-fns patterns naming paired buckets by what they share, like "January" for January 2026 and January 2025, and each by what differs,
 * like "2026" and "2025". Undefined when two buckets in the period would share a name, like "5th" for October 5 and November 5.
 */
function getCalendarNamePatterns(groupBy: TimeGroupBy, periodStart: Date, periodEnd: Date) {
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.DAY:
            if (differenceInCalendarDays(periodEnd, periodStart) < DAYS_IN_WEEK) {
                return {label: 'EEE', shortLabel: 'EEE', seriesLabel: 'MMM d, yyyy'};
            }
            if (isSameMonth(periodStart, periodEnd)) {
                return {label: 'do', shortLabel: 'do', seriesLabel: 'LLLL yyyy'};
            }
            return periodEnd < addYears(periodStart, 1) ? {label: 'MMM d', shortLabel: 'MMM d', seriesLabel: 'yyyy'} : undefined;
        case CONST.SEARCH.GROUP_BY.MONTH:
            return differenceInCalendarMonths(periodEnd, periodStart) < 12 ? {label: 'LLLL', shortLabel: 'LLL', seriesLabel: 'yyyy'} : undefined;
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return differenceInCalendarQuarters(periodEnd, periodStart) < 4 ? {label: 'QQQ', shortLabel: 'QQQ', seriesLabel: 'yyyy'} : undefined;
        default:
            return undefined;
    }
}

/** Returns the start of the bucket holding a date. `weekStart` is the start of any week bucket, which tells the weekday weeks begin on. */
function getBucketStart(groupBy: TimeGroupBy, date: Date, weekStart: Date): Date {
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.WEEK:
            return addDays(date, -((getDay(date) - getDay(weekStart) + DAYS_IN_WEEK) % DAYS_IN_WEEK));
        case CONST.SEARCH.GROUP_BY.MONTH:
            return startOfMonth(date);
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return startOfQuarter(date);
        case CONST.SEARCH.GROUP_BY.YEAR:
            return startOfYear(date);
        default:
            return date;
    }
}

/** Returns the start of the bucket as far into the comparison period as a current bucket is into its own, even past the period's end */
function getBucketAtSamePosition(bucketStart: Date, periods: ChartComparisonPeriods, groupBy: TimeGroupBy): Date {
    const dateInBucket = BUCKET_ADD[groupBy](parseISO(periods.comparison.start), BUCKET_OFFSET[groupBy](bucketStart, parseISO(periods.primary.start)));
    return getBucketStart(groupBy, dateInBucket, bucketStart);
}

/**
 * Returns the bucket a current bucket is compared with, or undefined when the comparison period has none, like October 31
 * against September, February 29 against a year without one, or a sixth week against a month of five.
 */
function getCounterpartBucketRange(bucketRange: ChartBucketRange, periods: ChartComparisonPeriods, groupBy: TimeGroupBy): ChartBucketRange | undefined {
    const bucketStart = parseISO(bucketRange.start);

    let counterpartStart: Date;
    if (groupBy === CONST.SEARCH.GROUP_BY.DAY && periods.monthsApart !== undefined) {
        counterpartStart = subMonths(bucketStart, periods.monthsApart);
        // Going back a month turns October 31 into September 30, since September has no 31st, so that day has no counterpart.
        if (getDate(counterpartStart) !== getDate(bucketStart)) {
            return undefined;
        }
    } else {
        counterpartStart = getBucketAtSamePosition(bucketStart, periods, groupBy);
    }

    const start = format(counterpartStart, CONST.DATE.FNS_FORMAT_STRING);
    if (start > periods.comparison.end) {
        return undefined;
    }
    return {start, end: format(addDays(BUCKET_ADD[groupBy](counterpartStart, 1), -1), CONST.DATE.FNS_FORMAT_STRING)};
}

/** Clips a bucket to its period, since a week or month can start before the period or end after it */
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
 * Returns a time bucket's labels: the calendar name it shares with its counterpart, like "January", or else its position, like "Week 2".
 * Each period's bucket is then named by what that label leaves out, like its year, or else by its dates.
 */
function getComparedBucketLabels(
    bucketRange: ChartBucketRange,
    counterpartRange: ChartBucketRange | undefined,
    periods: ChartComparisonPeriods,
    groupBy: TimeGroupBy,
    translate: LocaleContextProps['translate'],
    dateFnsLocale: LocaleContextProps['dateFnsLocale'],
) {
    const bucketDate = parseISO(bucketRange.start);
    const primaryStart = parseISO(periods.primary.start);
    const primaryEnd = parseISO(periods.primary.end);
    const patterns = getCalendarNamePatterns(groupBy, primaryStart, primaryEnd);
    // A bucket with no counterpart is named like its neighbors, by the bucket at its position. Days paired by date always share a name.
    const isPairedByDate = groupBy === CONST.SEARCH.GROUP_BY.DAY && periods.monthsApart !== undefined;
    const comparedDate = counterpartRange ? parseISO(counterpartRange.start) : getBucketAtSamePosition(bucketDate, periods, groupBy);
    const sharedPatterns = patterns && ((!counterpartRange && isPairedByDate) || format(bucketDate, patterns.label) === format(comparedDate, patterns.label)) ? patterns : undefined;

    const formatSeriesLabel = (range: ChartBucketRange, period: ChartPeriod) =>
        sharedPatterns ? format(parseISO(range.start), sharedPatterns.seriesLabel, {locale: dateFnsLocale}) : formatDates(clipToPeriod(range, period), dateFnsLocale);
    const seriesLabels = {
        primary: formatSeriesLabel(bucketRange, periods.primary),
        comparison: counterpartRange && formatSeriesLabel(counterpartRange, periods.comparison),
    };

    if (sharedPatterns) {
        return {
            label: format(bucketDate, sharedPatterns.label, {locale: dateFnsLocale}),
            shortLabel: format(bucketDate, sharedPatterns.shortLabel, {locale: dateFnsLocale}),
            seriesLabels,
        };
    }
    const isLoneBucket = BUCKET_OFFSET[groupBy](getBucketStart(groupBy, primaryEnd, bucketDate), primaryStart) === 0;
    const positionLabel = translate(BUCKET_LABEL[groupBy], isLoneBucket ? undefined : BUCKET_OFFSET[groupBy](bucketDate, primaryStart) + 1);
    return {label: positionLabel, shortLabel: positionLabel, seriesLabels};
}

/** Returns the date in the current period a compared bucket lines up with, the counterpart lookup in reverse, so the two can be sorted together */
function getPositionInPrimaryPeriod(range: ChartBucketRange, periods: ChartComparisonPeriods, groupBy: TimeGroupBy): string {
    const bucketStart = parseISO(range.start);
    const position =
        groupBy === CONST.SEARCH.GROUP_BY.DAY && periods.monthsApart !== undefined
            ? addMonths(bucketStart, periods.monthsApart)
            : BUCKET_ADD[groupBy](parseISO(periods.primary.start), BUCKET_OFFSET[groupBy](bucketStart, parseISO(periods.comparison.start)));
    return format(position, CONST.DATE.FNS_FORMAT_STRING);
}

/**
 * Returns the labels of a compared bucket no current bucket pairs with, named like the current buckets beside it:
 * by calendar name when they have one, like "29th", or else by position in the compared period, like "Week 6".
 */
function getUnpairedBucketLabels(
    range: ChartBucketRange,
    periods: ChartComparisonPeriods,
    groupBy: TimeGroupBy,
    translate: LocaleContextProps['translate'],
    dateFnsLocale: LocaleContextProps['dateFnsLocale'],
) {
    const bucketDate = parseISO(range.start);
    const patterns = getCalendarNamePatterns(groupBy, parseISO(periods.primary.start), parseISO(periods.primary.end));
    // Days paired by date always share a name. Others take a calendar name only if it matches their spot, as paired buckets do.
    const isPairedByDate = groupBy === CONST.SEARCH.GROUP_BY.DAY && periods.monthsApart !== undefined;
    if (patterns && (isPairedByDate || format(bucketDate, patterns.label) === format(parseISO(getPositionInPrimaryPeriod(range, periods, groupBy)), patterns.label))) {
        return {
            label: format(bucketDate, patterns.label, {locale: dateFnsLocale}),
            shortLabel: format(bucketDate, patterns.shortLabel, {locale: dateFnsLocale}),
            seriesLabel: format(bucketDate, patterns.seriesLabel, {locale: dateFnsLocale}),
        };
    }
    const positionLabel = translate(BUCKET_LABEL[groupBy], BUCKET_OFFSET[groupBy](bucketDate, parseISO(periods.comparison.start)) + 1);
    return {label: positionLabel, shortLabel: positionLabel, seriesLabel: formatDates(clipToPeriod(range, periods.comparison), dateFnsLocale)};
}

export {formatDates, getComparedBucketLabels, getCounterpartBucketRange, getPositionInPrimaryPeriod, getUnpairedBucketLabels, isTimeGroupBy};
export type {ChartComparisonPeriods, ChartPeriod, TimeGroupBy};
