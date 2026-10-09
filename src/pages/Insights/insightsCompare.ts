import type {ChartBucketRange} from '@components/Search/chartGroupByConfig';

import {getDateRangeForPreset} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import {differenceInCalendarDays, differenceInCalendarMonths, endOfMonth, format, isSameDay, parseISO, startOfMonth, startOfYear, subDays, subMonths, subYears} from 'date-fns';

import type {InsightsFilters} from './insightsFilters';

type ComparisonWindows = {
    current: ChartBucketRange;

    previous: ChartBucketRange;
};

function toRange(start: Date, end: Date): ChartBucketRange {
    return {
        start: format(start, CONST.DATE.FNS_FORMAT_STRING),
        end: format(end, CONST.DATE.FNS_FORMAT_STRING),
    };
}

/** Resolves the current and previous periods from the Date filter. Undefined for selections with no previous period. */
function resolveComparisonWindows(date: InsightsFilters['date']): ComparisonWindows | undefined {
    if ('preset' in date) {
        // Uses the search query's resolver so the compared dates and queries agree.
        const currentRange = getDateRangeForPreset(date.preset);
        if (!currentRange.start || !currentRange.end) {
            return undefined;
        }
        const currentStart = parseISO(currentRange.start);
        const currentEnd = parseISO(currentRange.end);

        switch (date.preset) {
            case CONST.SEARCH.DATE_PRESETS.THIS_MONTH:
            case CONST.SEARCH.DATE_PRESETS.LAST_MONTH: {
                const previousMonth = subMonths(currentStart, 1);
                return {current: currentRange, previous: toRange(startOfMonth(previousMonth), endOfMonth(previousMonth))};
            }
            case CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE: {
                const sameDayLastYear = subYears(currentEnd, 1);
                return {current: currentRange, previous: toRange(startOfYear(sameDayLastYear), sameDayLastYear)};
            }
            case CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS:
                return {current: currentRange, previous: toRange(subMonths(currentStart, 12), endOfMonth(subMonths(currentEnd, 12)))};
            default:
                return undefined;
        }
    }

    const start = parseISO('on' in date ? date.on : date.from);
    const end = parseISO('on' in date ? date.on : date.to);
    // Whole-month ranges compare month for month.
    const coversWholeMonths = isSameDay(start, startOfMonth(start)) && isSameDay(end, endOfMonth(end));
    const monthCount = differenceInCalendarMonths(end, start) + 1;
    const dayCount = differenceInCalendarDays(end, start) + 1;

    // Other ranges compare against the same-length range just before.
    const previousStart = coversWholeMonths ? subMonths(start, monthCount) : subDays(start, dayCount);

    return {current: toRange(start, end), previous: toRange(previousStart, subDays(start, 1))};
}

export default resolveComparisonWindows;
