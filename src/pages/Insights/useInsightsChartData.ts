import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {SearchGroupBy, SearchQueryJSON} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';
import type {InsightsChartData} from './resolveChartData';

import {applyInsightsFilters} from './insightsQueries';
import {resolveInsightsChartData} from './resolveChartData';

/** Resolves one chart's data from the snapshot the dashboard record names for it. */
function useInsightsChartData(
    dashboardID: InsightsDashboardID,
    chart: InsightsChartSpec,
    filters: InsightsFilters,
    groupByOverride?: SearchGroupBy,
): InsightsChartData & {queryJSON: Readonly<SearchQueryJSON> | undefined} {
    const queryJSON = buildSearchQueryJSON(applyInsightsFilters(chart, filters, groupByOverride));
    const [dashboard] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS}${dashboardID}`);
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${dashboard?.graphs?.[chart.graphKey]?.snapshotHash}`);
    const sortedData = useGroupedItems(snapshot, queryJSON);

    return {queryJSON, ...resolveInsightsChartData({chart, dashboard, snapshot, sortedData})};
}

export default useInsightsChartData;
