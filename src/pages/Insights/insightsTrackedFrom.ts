/** Helpers for charts whose data starts on a fixed day, so the days before it read as untracked rather than empty. */
import type {ChartBucketRange} from '@components/Search/chartGroupByConfig';

import CONST from '@src/CONST';

import type {InsightsFilters} from './insightsFilters';

import getInsightsDateRange from './getInsightsDateRange';
import resolveComparisonPeriods from './insightsCompare';

/** Whether a time bucket has any tracked days. A bucket that runs into the first tracked day, like the week of May 31, keeps its data from that day on. */
function isBucketTracked(range: ChartBucketRange | undefined, trackedFrom: string): boolean {
    return !range || range.end >= trackedFrom;
}

/** Whether the dates the chart covers, including the compared period, start before the first tracked day. A range with no start, like "never", reaches back past it. */
function doesRangeStartBeforeTracking(filters: InsightsFilters, trackedFrom: string): boolean {
    const {start} = getInsightsDateRange(filters.date);
    if (!start || start < trackedFrom) {
        return true;
    }
    if (filters.compare !== CONST.SEARCH.COMPARE.PREVIOUS_PERIOD) {
        return false;
    }
    const comparisonStart = resolveComparisonPeriods(filters.date)?.comparison.start;
    return !!comparisonStart && comparisonStart < trackedFrom;
}

export {doesRangeStartBeforeTracking, isBucketTracked};
