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

import type {ChartBucketRange, ChartBucketUnit} from './chartGroupByConfig';

const DAYS_IN_WEEK = 7;

/** Bucket offset from the period start. Weeks count from the week holding the first day, whatever weekday weeks start on. */
const BUCKET_OFFSET: Record<ChartBucketUnit, (bucketStart: Date, periodStart: Date) => number> = {
    day: differenceInCalendarDays,
    week: (bucketStart, periodStart) => Math.ceil(differenceInCalendarDays(bucketStart, periodStart) / DAYS_IN_WEEK),
    month: differenceInCalendarMonths,
    quarter: differenceInCalendarQuarters,
    year: differenceInCalendarYears,
};

/** Moves a date forward by a number of buckets */
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

    /** Set when the periods compare month for month, so a day pairs with the same date that many months before */
    monthsApart?: number;
};

/** date-fns patterns naming paired buckets by what they share, like "January" for January 2026 and January 2025 */
type CalendarNamePatterns = {
    /** The shared name, which titles the tooltip */
    label: string;

    /** The shared name on the axis */
    shortLabel: string;

    /** What tells the paired buckets apart, which names each period's row, like the year */
    seriesLabel: string;
};

/** Calendar name patterns for a period's buckets, like "January" or "Mon". Undefined when a name could repeat within the period. */
function getCalendarNamePatterns(bucketUnit: ChartBucketUnit, periodStart: Date, periodEnd: Date): CalendarNamePatterns | undefined {
    switch (bucketUnit) {
        case 'day':
            if (differenceInCalendarDays(periodEnd, periodStart) < DAYS_IN_WEEK) {
                return {label: 'EEE', shortLabel: 'EEE', seriesLabel: 'MMM d, yyyy'};
            }
            if (isSameMonth(periodStart, periodEnd)) {
                return {label: 'do', shortLabel: 'do', seriesLabel: 'LLLL yyyy'};
            }
            return periodEnd < addYears(periodStart, 1) ? {label: 'MMM d', shortLabel: 'MMM d', seriesLabel: 'yyyy'} : undefined;
        case 'month':
            return differenceInCalendarMonths(periodEnd, periodStart) < 12 ? {label: 'LLLL', shortLabel: 'LLL', seriesLabel: 'yyyy'} : undefined;
        case 'quarter':
            return differenceInCalendarQuarters(periodEnd, periodStart) < 4 ? {label: 'QQQ', shortLabel: 'QQQ', seriesLabel: 'yyyy'} : undefined;
        default:
            return undefined;
    }
}

/** Returns the start of the bucket holding a date. `weekStart` is the start of any week bucket, which tells the weekday weeks begin on. */
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

/**
 * The bucket a current bucket is compared with, or undefined when the comparison period has none, like October 31
 * against September, February 29 against a year without one, or a sixth week against a month of five.
 */
function getCounterpartBucketRange(bucketRange: ChartBucketRange, periods: ChartComparisonPeriods, bucketUnit: ChartBucketUnit): ChartBucketRange | undefined {
    const bucketStart = parseISO(bucketRange.start);
    const primaryStart = parseISO(periods.primary.start);
    const comparisonStart = parseISO(periods.comparison.start);

    let counterpartStart: Date;
    if (bucketUnit === 'day' && periods.monthsApart !== undefined) {
        counterpartStart = subMonths(bucketStart, periods.monthsApart);
        // Going back a month turns October 31 into September 30, since September has no 31st, so that day has no counterpart.
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

/** What a compared bucket is called: its title and axis label, and each period's name for its own bucket */
type ComparedBucketLabels = {
    label: string;
    shortLabel: string;
    seriesLabels: {primary: string; comparison?: string};
};

/**
 * Returns a time bucket's labels: the calendar name it shares with its counterpart, like "January", or else its position, like "Week 2".
 * Each period's bucket is then named by what that label leaves out, like its year, or else by its dates.
 */
function getComparedBucketLabels(
    bucketRange: ChartBucketRange,
    counterpartRange: ChartBucketRange | undefined,
    periods: ChartComparisonPeriods,
    bucketUnit: ChartBucketUnit,
    translate: LocaleContextProps['translate'],
    dateFnsLocale: LocaleContextProps['dateFnsLocale'],
): ComparedBucketLabels {
    const bucketDate = parseISO(bucketRange.start);
    const primaryStart = parseISO(periods.primary.start);
    const primaryEnd = parseISO(periods.primary.end);
    const patterns = getCalendarNamePatterns(bucketUnit, primaryStart, primaryEnd);
    const sharedPatterns = patterns && (!counterpartRange || format(bucketDate, patterns.label) === format(parseISO(counterpartRange.start), patterns.label)) ? patterns : undefined;

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
    const isLoneBucket = BUCKET_OFFSET[bucketUnit](getBucketStart(bucketUnit, primaryEnd, bucketDate), primaryStart) === 0;
    const positionLabel = translate(BUCKET_LABEL[bucketUnit], isLoneBucket ? undefined : BUCKET_OFFSET[bucketUnit](bucketDate, primaryStart) + 1);
    return {label: positionLabel, shortLabel: positionLabel, seriesLabels};
}

export {formatDates, getComparedBucketLabels, getCounterpartBucketRange};
export type {ChartComparisonPeriods, ChartPeriod};
