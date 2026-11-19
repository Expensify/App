/** Works out what the Handled by table shows for each source that finished the stage, reusing the ranking table's share, bar and change rules. */
import type {ChartComparison} from '@components/Search/buildChartSeries';
import type {GroupedItem} from '@components/Search/types';

import type {RankingTableRow} from './buildRankingTableRows';

import buildRankingTableRows from './buildRankingTableRows';

type BuildHandledByRowsParams = {
    /** The sources, sorted by count, most first */
    data: GroupedItem[];

    comparison: ChartComparison | undefined;

    /** Whether the page compares against the previous period, which adds each row's change */
    isComparingPreviousPeriod: boolean;
};

/** Returns a row for each source with reports in the period. Sources that finished no reports are left out, since a row of zeros says nothing. */
function buildHandledByRows({data, comparison, isComparingPreviousPeriod}: BuildHandledByRowsParams): RankingTableRow[] {
    const sourcesWithReports = data.filter((item) => (item.count ?? 0) > 0);
    return buildRankingTableRows({data: sourcesWithReports, comparison, isComparingPreviousPeriod}).rows;
}

export default buildHandledByRows;
