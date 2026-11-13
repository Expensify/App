import type {SearchDatePreset} from '@components/Search/types';

import CONST from '@src/CONST';

import type {TupleToUnion} from 'type-fest';

import {addDays, differenceInCalendarDays, differenceInMonths, parseISO} from 'date-fns';

import type {InsightsFilters} from './insightsFilters';

import getInsightsDateRange from './getInsightsDateRange';
import {INSIGHTS_GROUP_BY_OPTIONS, INSIGHTS_RUNNING_TOTAL_GROUP_BY} from './insightsFilters';

type InsightsGroupBy = InsightsFilters['groupBy'];

/** The time buckets a chart can actually be queried at, leaving out the Running total display grouping. */
type InsightsTimeGroupBy = TupleToUnion<typeof INSIGHTS_GROUP_BY_OPTIONS>;

const MAX_DAYS_GROUPED_BY_DAY = 62;
const MIN_DAYS_GROUPED_BY_WEEK = 14;
const MIN_MONTHS_BY_GROUP_BY = {
    [CONST.SEARCH.GROUP_BY.MONTH]: 2,
    [CONST.SEARCH.GROUP_BY.QUARTER]: 6,
    [CONST.SEARCH.GROUP_BY.YEAR]: 24,
} as const;

const CURRENT_PERIOD_GROUP_BY_OPTIONS: Partial<Record<SearchDatePreset, InsightsTimeGroupBy[]>> = {
    [CONST.SEARCH.DATE_PRESETS.THIS_WEEK]: [CONST.SEARCH.GROUP_BY.DAY],
    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: [CONST.SEARCH.GROUP_BY.DAY],
    [CONST.SEARCH.DATE_PRESETS.THIS_QUARTER]: [CONST.SEARCH.GROUP_BY.WEEK],
    [CONST.SEARCH.DATE_PRESETS.THIS_YEAR]: [CONST.SEARCH.GROUP_BY.WEEK, CONST.SEARCH.GROUP_BY.MONTH],
    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: [CONST.SEARCH.GROUP_BY.WEEK, CONST.SEARCH.GROUP_BY.MONTH],
};

/** Returns the Group by options that fit the date range, in the dropdown's order */
function getInsightsGroupByOptions(date: InsightsFilters['date']): InsightsTimeGroupBy[] {
    if ('on' in date) {
        return [CONST.SEARCH.GROUP_BY.DAY];
    }

    const currentPeriodOptions = 'preset' in date ? CURRENT_PERIOD_GROUP_BY_OPTIONS[date.preset] : undefined;
    if (currentPeriodOptions) {
        return currentPeriodOptions;
    }

    const boundaries = getInsightsDateRange(date);

    // Presets like "never" have no fixed range, so there's no length to fit a grouping to
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

/** Keeps the Group by when the options include it, otherwise picks the nearest option they do include. Running total has no bucket of its own, so it falls to the default. */
function getFittingGroupBy(groupBy: InsightsGroupBy, options: InsightsTimeGroupBy[]): InsightsTimeGroupBy {
    const target: InsightsTimeGroupBy = groupBy === INSIGHTS_RUNNING_TOTAL_GROUP_BY ? CONST.SEARCH.GROUP_BY.MONTH : groupBy;
    if (options.includes(target)) {
        return target;
    }
    if (options.length === 0) {
        return CONST.SEARCH.GROUP_BY.MONTH;
    }

    const getDistanceFromSelection = (option: InsightsTimeGroupBy) => Math.abs(INSIGHTS_GROUP_BY_OPTIONS.indexOf(option) - INSIGHTS_GROUP_BY_OPTIONS.indexOf(target));
    return options.reduce((nearest, option) => (getDistanceFromSelection(option) < getDistanceFromSelection(nearest) ? option : nearest));
}

/** Whether Running total can be offered for a date range. It rides the same pill as Group by, so a single day, which hides the pill, rules it out. */
function isRunningTotalAvailable(date: InsightsFilters['date']): boolean {
    if ('on' in date) {
        return false;
    }
    return getInsightsGroupByOptions(date).length > 0;
}

/** Returns the grouping a running total is plotted at: by day for ranges that offer Day (62 days or less), by month otherwise, or by the finest offered grouping when Month isn't offered either, like Week for This quarter. */
function getRunningTotalGroupBy(date: InsightsFilters['date']): InsightsTimeGroupBy {
    const options = getInsightsGroupByOptions(date);
    if (options.includes(CONST.SEARCH.GROUP_BY.DAY)) {
        return CONST.SEARCH.GROUP_BY.DAY;
    }
    if (options.includes(CONST.SEARCH.GROUP_BY.MONTH)) {
        return CONST.SEARCH.GROUP_BY.MONTH;
    }
    return options.at(0) ?? CONST.SEARCH.GROUP_BY.MONTH;
}

/** Returns the real time bucket the charts are queried with, fitted to the date range. Running total queries a real day/month bucket, so it never reaches the backend as the Running total value. */
function getQueryGroupBy(filters: InsightsFilters): InsightsTimeGroupBy {
    if (filters.groupBy === INSIGHTS_RUNNING_TOTAL_GROUP_BY && isRunningTotalAvailable(filters.date)) {
        return getRunningTotalGroupBy(filters.date);
    }
    return getFittingGroupBy(filters.groupBy, getInsightsGroupByOptions(filters.date));
}

export {getFittingGroupBy, getInsightsGroupByOptions, getQueryGroupBy, isRunningTotalAvailable};
export type {InsightsTimeGroupBy};
