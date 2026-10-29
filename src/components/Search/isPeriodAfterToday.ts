import type {GroupedItem, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';

/** Returns whether a period starts after today */
function isPeriodAfterToday(periodStart: string, today: string, dateFilterStart?: string): boolean {
    // A date filter that starts partway through a group starts the group there too, e.g. Oct 10 for a range from Oct 10 to Dec 31
    const start = dateFilterStart && dateFilterStart > periodStart ? dateFilterStart : periodStart;
    return start > today;
}

/** Returns whether a period starts after today and has no expenses yet */
function isEmptyPeriodAfterToday(item: GroupedItem, groupBy: SearchGroupBy, today: string, dateFilterStart?: string): boolean {
    const periodStart = CHART_GROUP_BY_CONFIG[groupBy].getDateRange?.(item)?.start;
    return !item.count && !!periodStart && isPeriodAfterToday(periodStart, today, dateFilterStart);
}

export default isPeriodAfterToday;
export {isEmptyPeriodAfterToday};
