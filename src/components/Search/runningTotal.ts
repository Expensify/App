import type {ChartComparison} from './buildChartSeries';
import type {GroupedItem, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import {isTimeGroupBy} from './comparisonBuckets';

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
function getChronologicalKey(item: GroupedItem, getDateRange: (typeof CHART_GROUP_BY_CONFIG)[SearchGroupBy]['getDateRange']): string {
    return getDateRange?.(item)?.start ?? item.keyForList;
}

/** Returns a copy of the rows ordered oldest first by the date each bucket starts. */
function sortChronologically(items: GroupedItem[], getDateRange: (typeof CHART_GROUP_BY_CONFIG)[SearchGroupBy]['getDateRange']): GroupedItem[] {
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
function accumulate(items: GroupedItem[], getDateRange: (typeof CHART_GROUP_BY_CONFIG)[SearchGroupBy]['getDateRange']): GroupedItem[] {
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
 * The compared period accumulates the same way, and the Average line becomes an even-pace line that rises straight to the range total.
 */
function applyRunningTotal({data, comparison, groupBy}: RunningTotalParams): RunningTotalResult {
    const {getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    if (!isTimeGroupBy(groupBy) || data.length === 0) {
        return {data, comparison};
    }

    const runningData = accumulate(data, getDateRange);

    if (!comparison) {
        return {data: runningData};
    }

    // Another period's rows accumulate from that period's own start, so point N of each line is each period's spend so far.
    if (comparison.periods) {
        return {data: runningData, comparison: {...comparison, data: accumulate(comparison.data, getDateRange)}};
    }

    // Average has no period to accumulate. Its even-pace line is N times the average period total, which reaches the range total at the last point.
    const chronological = sortChronologically(data, getDateRange);
    const periodCount = chronological.length;
    const averageTotal = chronological.reduce((sum, item) => sum + (item.total ?? 0), 0) / periodCount;
    const averagePercent = chronological.reduce((sum, item) => sum + (item.percentOfTotal ?? 0), 0) / periodCount;
    const averageData = chronological.map((item, index) => ({...item, total: averageTotal * (index + 1), percentOfTotal: averagePercent * (index + 1)}) as GroupedItem);

    return {data: runningData, comparison: {...comparison, data: averageData}};
}

export default applyRunningTotal;
