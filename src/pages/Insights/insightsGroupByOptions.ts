import {getDateRangeForPreset} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import {addDays, differenceInCalendarDays, differenceInMonths, parseISO} from 'date-fns';

import type {InsightsFilters} from './insightsFilters';

import {INSIGHTS_GROUP_BY_OPTIONS} from './insightsFilters';

type InsightsGroupBy = InsightsFilters['groupBy'];

/** Longest range, in days, still readable one point per day */
const MAX_DAYS_GROUPED_BY_DAY = 62;

const MIN_DAYS_GROUPED_BY_WEEK = 14;
const MIN_MONTHS_BY_GROUP_BY = {
    [CONST.SEARCH.GROUP_BY.MONTH]: 2,
    [CONST.SEARCH.GROUP_BY.QUARTER]: 6,
    [CONST.SEARCH.GROUP_BY.YEAR]: 24,
} as const;

/** Returns the Group by options that fit the date range, in the dropdown's order */
function getInsightsGroupByOptions(date: InsightsFilters['date']): InsightsGroupBy[] {
    // Custom date -> no group by
    if ('on' in date) {
        return [];
    }

    const boundaries = 'from' in date ? {start: date.from, end: date.to} : getDateRangeForPreset(date.preset);
    if (!boundaries.start || !boundaries.end) {
        return [];
    }

    const start = parseISO(boundaries.start);
    const end = parseISO(boundaries.end);
    const days = differenceInCalendarDays(end, start) + 1;
    const months = differenceInMonths(addDays(end, 1), start);

    return INSIGHTS_GROUP_BY_OPTIONS.filter((option) => {
        switch (option) {
            case CONST.SEARCH.GROUP_BY.DAY:
                return days <= MAX_DAYS_GROUPED_BY_DAY;
            case CONST.SEARCH.GROUP_BY.WEEK:
                return days >= MIN_DAYS_GROUPED_BY_WEEK;
            default:
                return months >= MIN_MONTHS_BY_GROUP_BY[option];
        }
    });
}

/** Keeps the Group by when the options include it, otherwise picks the nearest option they do include. */
function getFittingGroupBy(groupBy: InsightsGroupBy, options: InsightsGroupBy[]): InsightsGroupBy {
    if (options.length === 0 || options.includes(groupBy)) {
        return groupBy;
    }

    const getDistanceFromSelection = (option: InsightsGroupBy) => Math.abs(INSIGHTS_GROUP_BY_OPTIONS.indexOf(option) - INSIGHTS_GROUP_BY_OPTIONS.indexOf(groupBy));
    return options.reduce((nearest, option) => (getDistanceFromSelection(option) < getDistanceFromSelection(nearest) ? option : nearest));
}

/** Returns the Group by the charts are queried with. A single date has no options to pick from, so its one point is grouped by day. */
function getQueryGroupBy(filters: InsightsFilters): InsightsGroupBy {
    return 'on' in filters.date ? CONST.SEARCH.GROUP_BY.DAY : filters.groupBy;
}

export {getFittingGroupBy, getInsightsGroupByOptions, getQueryGroupBy};
