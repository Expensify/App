/** Works out what a ranking table shows for each group: its share of every group's count, the length of its bar, and how its count changed. */
import type {ChartComparison} from '@components/Search/buildChartSeries';
import {isChartAverage} from '@components/Search/buildChartSeries';
import type {GroupedItem} from '@components/Search/types';

import CONST from '@src/CONST';

const RANKING_TABLE_CHANGE = {
    NONE: 'none',
    NEW: 'new',
    INCREASE: 'increase',
    DECREASE: 'decrease',
} as const;

type RankingTableChange =
    | {type: typeof RANKING_TABLE_CHANGE.NONE}
    | {type: typeof RANKING_TABLE_CHANGE.NEW}
    | {
          type: typeof RANKING_TABLE_CHANGE.INCREASE | typeof RANKING_TABLE_CHANGE.DECREASE;
          percent: number;
      };

type RankingTableRow = {
    item: GroupedItem;

    /** The group's share of every group's count, in percentage points, as the backend works it out */
    share: number;

    /** Bar length as a percentage of the longest bar */
    barWidthPercent: number;

    /** Left out unless the table compares against the previous period */
    change?: RankingTableChange;
};

type RankingTable = {
    rows: RankingTableRow[];

    /** Count of the average group, set when the table compares against the average */
    average?: number;

    /** Where the average falls on the bars' scale, as a percentage of the longest bar */
    averageWidthPercent?: number;
};

type BuildRankingTableRowsParams = {
    /** The listed groups, sorted by count, most first */
    data: GroupedItem[];

    comparison: ChartComparison | undefined;

    /** Whether the page compares against the previous period, which shows a change on every row even when there is nothing to compare against */
    isComparingPreviousPeriod: boolean;
};

/** Returns how a group's count changed against the previous period's, rounded to a whole percentage */
function getRankingTableChange(count: number, previousCount: number | undefined): RankingTableChange {
    if (previousCount === 0 && count > 0) {
        return {type: RANKING_TABLE_CHANGE.NEW};
    }
    if (!previousCount) {
        return {type: RANKING_TABLE_CHANGE.NONE};
    }
    const percent = Math.round((Math.abs(count - previousCount) / previousCount) * 100);
    if (percent === 0) {
        return {type: RANKING_TABLE_CHANGE.NONE};
    }
    return {type: count > previousCount ? RANKING_TABLE_CHANGE.INCREASE : RANKING_TABLE_CHANGE.DECREASE, percent};
}

/** Builds a ranking table's rows */
function buildRankingTableRows({data, comparison, isComparingPreviousPeriod}: BuildRankingTableRowsParams): RankingTable {
    const maxCount = Math.max(0, ...data.map((item) => item.count ?? 0));
    const getWidthPercent = (count: number) => (maxCount > 0 ? Math.min((count / maxCount) * 100, 100) : 0);

    const comparedRows = isComparingPreviousPeriod && comparison && !isChartAverage(comparison) ? comparison.data : undefined;
    // A group missing from the previous period counted nothing then
    const previousCounts = comparedRows ? new Map(comparedRows.map((item) => [item.keyForList, item.count ?? 0])) : undefined;

    const rows = data.map((item): RankingTableRow => {
        const count = item.count ?? 0;
        return {
            item,
            share: item.percentOfTotal ?? 0,
            barWidthPercent: getWidthPercent(count),
            change: isComparingPreviousPeriod ? getRankingTableChange(count, previousCounts ? (previousCounts.get(item.keyForList) ?? 0) : undefined) : undefined,
        };
    });

    const average = isChartAverage(comparison) ? comparison[CONST.SEARCH.CHART_METRIC.COUNT] : undefined;
    return {rows, average, averageWidthPercent: average === undefined ? undefined : getWidthPercent(average)};
}

export default buildRankingTableRows;
export {RANKING_TABLE_CHANGE};
export type {RankingTableChange};
