import type {ChartPeriod} from '@components/Search/comparisonBuckets';

import DateUtils from '@libs/DateUtils';

import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';

import CONST from '@src/CONST';

import {format, getMonth, getQuarter, getYear, parseISO, startOfWeek} from 'date-fns';

/** Returns the calendar day, week, month, quarter or year that contains the date, or undefined when the date doesn't fall in a real month, quarter or year. */
function getCalendarPeriod(groupBy: InsightsTimeGroupBy, date: string): ChartPeriod | undefined {
    const day = parseISO(date);
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.DAY:
            return {start: date, end: date};
        case CONST.SEARCH.GROUP_BY.WEEK:
            // Weeks start on Sunday, matching the week buckets of group-by:week
            return DateUtils.getWeekDateRange(format(startOfWeek(day, {weekStartsOn: 0}), CONST.DATE.FNS_FORMAT_STRING));
        case CONST.SEARCH.GROUP_BY.MONTH:
            return DateUtils.getMonthDateRange(getYear(day), getMonth(day) + 1);
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return DateUtils.getQuarterDateRange(getYear(day), getQuarter(day));
        default:
            return DateUtils.getYearDateRange(getYear(day));
    }
}

export default getCalendarPeriod;
