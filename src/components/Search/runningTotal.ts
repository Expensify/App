import type {ChartComparison} from './buildChartSeries';
import type {GroupedItem, SearchGroupBy} from './types';

import {isChartAverage} from './buildChartSeries';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import {isTimeGroupBy} from './comparisonBuckets';

/** Reads the start/end dates a grouped row covers, so rows can be ordered oldest first before accumulating. */
type GetDateRange = (typeof CHART_GROUP_BY_CONFIG)[SearchGroupBy]['getDateRange'];

type RunningTotalParams = {
    /** A time-grouped chart's own rows, each holding one period's own total */
    data: GroupedItem[];

    /** The rows the chart is compared against, turned into running totals too */
    comparison?: ChartComparison;

    /** The time bucket the rows are grouped into */
    groupBy: SearchGroupBy;
};

type RunningTotalResult = {
    data: GroupedItem[];
    comparison?: ChartComparison;
};

/** Orders a group ahead of another by the date its bucket starts, so totals accumulate oldest first whatever order the search returned. */
function getChronologicalKey(item: GroupedItem, getDateRange: GetDateRange): string {
    return getDateRange?.(item)?.start ?? item.keyForList;
}

/** Returns a copy of the rows ordered oldest first by the date each bucket starts. */
function sortChronologically(items: GroupedItem[], getDateRange: GetDateRange): GroupedItem[] {
    return [...items].sort((first, second) => {
        const firstKey = getChronologicalKey(first, getDateRange);
        const secondKey = getChronologicalKey(second, getDateRange);
        if (firstKey === secondKey) {
            return 0;
        }
        return firstKey < secondKey ? -1 : 1;
    });
}

/** Replaces each row's own total, count and share with the sum of itself and every earlier period, keeping the rows in their original order. */
function accumulate(items: GroupedItem[], getDateRange: GetDateRange): GroupedItem[] {
    const ordered = sortChronologically(items, getDateRange);

    let runningTotal = 0;
    let runningCount = 0;
    let runningPercent = 0;
    const runningByKey = new Map<string, {total: number; count: number; percentOfTotal: number}>();
    for (const item of ordered) {
        runningTotal += item.total ?? 0;
        runningCount += item.count ?? 0;
        runningPercent += item.percentOfTotal ?? 0;
        runningByKey.set(item.keyForList, {total: runningTotal, count: runningCount, percentOfTotal: runningPercent});
    }

    return items.map((item) => {
        const running = runningByKey.get(item.keyForList);
        return running ? ({...item, ...running} as GroupedItem) : item;
    });
}

/**
 * Turns per-period rows into running totals, where each point is the spend from the start of the range through that period.
 * A compared period accumulates the same way, so each line rises to its own range total. The Average is one value, so it
 * stays a flat reference line under the climbing total.
 */
function applyRunningTotal({data, comparison, groupBy}: RunningTotalParams): RunningTotalResult {
    const {getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    if (!isTimeGroupBy(groupBy) || data.length === 0) {
        return {data, comparison};
    }

    const runningData = accumulate(data, getDateRange);

    // Only another period accumulates alongside the current one.
    if (!comparison || isChartAverage(comparison) || !comparison.periods) {
        return {data: runningData, comparison};
    }

    return {data: runningData, comparison: {...comparison, data: accumulate(comparison.data, getDateRange)}};
}

export default applyRunningTotal;
