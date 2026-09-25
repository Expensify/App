import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {SearchQueryJSON} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';
import type {InsightsChartData} from './resolveChartData';

import {applyInsightsFilters} from './insightsQueries';
import {resolveInsightsChartData} from './resolveChartData';

/** Resolves one chart's data from the snapshots the dashboard record names for it. */
function useInsightsChartData(
    dashboardID: InsightsDashboardID,
    hash: number | undefined,
    chart: InsightsChartSpec,
    filters: InsightsFilters,
): InsightsChartData & {queryJSON: Readonly<SearchQueryJSON> | undefined} {
    const queryJSON = buildSearchQueryJSON(applyInsightsFilters(chart, filters));
    const [dashboard] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS}${dashboardID}_${hash}`);
    const graph = dashboard?.graphs?.[chart.graphKey];
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${graph?.snapshotHash}`);
    const [previousPeriodSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${graph?.previousPeriodSnapshotHash}`);
    const sortedData = useGroupedItems(snapshot, queryJSON);
    // Both windows are grouped and sorted by the same query, so the previous period's rows are derived with it too.
    const previousPeriodData = useGroupedItems(previousPeriodSnapshot, queryJSON);

    return {queryJSON, ...resolveInsightsChartData({chart, dashboard, snapshot, sortedData, previousPeriodData})};
}

export default useInsightsChartData;
