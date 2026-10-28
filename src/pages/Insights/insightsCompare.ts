import type {ChartComparisonPeriods, ChartPeriod} from '@components/Search/comparisonBuckets';

import {getDateRangeForPreset} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import {differenceInCalendarDays, differenceInCalendarMonths, format, parseISO, startOfYear, subDays, subMonths, subYears} from 'date-fns';

import type {InsightsFilters} from './insightsFilters';

/** Presets that span a fixed number of days rather than whole months */
const DAY_LENGTH_PRESETS = new Set<string>([
    CONST.SEARCH.DATE_PRESETS.THIS_WEEK,
    CONST.SEARCH.DATE_PRESETS.LAST_WEEK,
    CONST.SEARCH.DATE_PRESETS.LAST_30_DAYS,
    CONST.SEARCH.DATE_PRESETS.LAST_90_DAYS,
]);

/** Formats a period's first and last day */
function formatPeriod(start: Date, end: Date): ChartPeriod {
    return {
        start: format(start, CONST.DATE.FNS_FORMAT_STRING),
        end: format(end, CONST.DATE.FNS_FORMAT_STRING),
    };
}

/** Resolves the period the Date filter covers and the one before it, which decide how buckets pair up and what each series is named. The backend picks the compared rows itself. */
function resolveComparisonPeriods(dateFilter: InsightsFilters['date']): ChartComparisonPeriods | undefined {
    let primary;
    if ('preset' in dateFilter) {
        primary = getDateRangeForPreset(dateFilter.preset);
    } else {
        primary = 'on' in dateFilter ? {start: dateFilter.on, end: dateFilter.on} : {start: dateFilter.from, end: dateFilter.to};
    }
    if (!primary.start || !primary.end) {
        return undefined;
    }
    const start = parseISO(primary.start);
    const end = parseISO(primary.end);

    // The year so far compares against the same days of the year before.
    if ('preset' in dateFilter && dateFilter.preset === CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE) {
        const sameDayLastYear = subYears(end, 1);
        return {primary, comparison: formatPeriod(startOfYear(sameDayLastYear), sameDayLastYear), monthsApart: 12};
    }

    // Month, quarter, and year presets cover whole months and compare month for month.
    if ('preset' in dateFilter && !DAY_LENGTH_PRESETS.has(dateFilter.preset)) {
        const monthsApart = differenceInCalendarMonths(end, start) + 1;
        return {primary, comparison: formatPeriod(subMonths(start, monthsApart), subDays(start, 1)), monthsApart};
    }

    // Weeks, rolling day ranges, and custom ranges compare against the same number of days just before.
    return {primary, comparison: formatPeriod(subDays(start, differenceInCalendarDays(end, start) + 1), subDays(start, 1))};
}

export default resolveComparisonPeriods;
