import type {ChartComparisonPeriods, ChartPeriod} from '@components/Search/buildChartSeries';

import {getDateRangeForPreset} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import {differenceInCalendarDays, differenceInCalendarMonths, format, parseISO, startOfYear, subDays, subMonths, subYears} from 'date-fns';

import type {InsightsFilters} from './insightsFilters';

/** Formats a period's first and last day */
function formatPeriod(start: Date, end: Date): ChartPeriod {
    return {
        start: format(start, CONST.DATE.FNS_FORMAT_STRING),
        end: format(end, CONST.DATE.FNS_FORMAT_STRING),
    };
}

/** Resolves the period the Date filter covers and the one before it, which name the compared series. The backend picks the compared rows itself. */
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
        return {primary, comparison: formatPeriod(startOfYear(sameDayLastYear), sameDayLastYear)};
    }

    // The other presets cover whole months and compare month for month, while a custom range compares against the same number of days just before.
    const previousStart = 'preset' in dateFilter ? subMonths(start, differenceInCalendarMonths(end, start) + 1) : subDays(start, differenceInCalendarDays(end, start) + 1);

    return {primary, comparison: formatPeriod(previousStart, subDays(start, 1))};
}

export default resolveComparisonPeriods;
