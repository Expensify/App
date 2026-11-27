import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import {deepEqual} from 'fast-equals';
import {useState} from 'react';

import type {InsightsChartSpec, InsightsViolationStages} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import {getViolationStage} from './dashboardSpecs';
import {getQueryGroupBy} from './insightsGroupByUtils';

/** Inputs of the last loaded dashboard entry */
type LoadedDashboardEntry = {
    dashboardID: InsightsDashboardID;
    hash: number;
    filters: InsightsFilters;
    violationStages: InsightsViolationStages;
};

/** Checks whether two sets of filters give the same averages */
function haveSameAverageFilters(filters: InsightsFilters, otherFilters: InsightsFilters): boolean {
    const {groupBy, compare, tagLevel, ...averageFilters} = filters;
    const {groupBy: otherGroupBy, compare: otherCompare, tagLevel: otherTagLevel, ...otherAverageFilters} = otherFilters;
    return deepEqual(averageFilters, otherAverageFilters);
}

/** Checks whether a chart's average in the loaded entry equals the one being loaded */
function canReuseAverage(
    loadedEntry: LoadedDashboardEntry | undefined,
    dashboardID: InsightsDashboardID,
    filters: InsightsFilters,
    violationStages: InsightsViolationStages,
    chart: InsightsChartSpec,
): boolean {
    return (
        !!loadedEntry &&
        loadedEntry.dashboardID === dashboardID &&
        haveSameAverageFilters(loadedEntry.filters, filters) &&
        getViolationStage(chart, loadedEntry.violationStages) === getViolationStage(chart, violationStages) &&
        (!!chart.groupBy || getQueryGroupBy(loadedEntry.filters) === getQueryGroupBy(filters)) &&
        (chart.groupBy !== CONST.SEARCH.GROUP_BY.TAG || loadedEntry.filters.tagLevel === filters.tagLevel)
    );
}

type ReusableAverageGraphParams = {
    dashboardID: InsightsDashboardID;
    hash: number | undefined;
    isCurrentDashboardLoaded: boolean;
    filters: InsightsFilters;
    violationStages: InsightsViolationStages;
};

function useReusableAverageGraph({dashboardID, hash, isCurrentDashboardLoaded, filters, violationStages}: ReusableAverageGraphParams) {
    const [lastLoadedEntry, setLastLoadedEntry] = useState<LoadedDashboardEntry>();
    const isNewEntryLoaded = isCurrentDashboardLoaded && hash !== undefined && (lastLoadedEntry?.hash !== hash || lastLoadedEntry.dashboardID !== dashboardID);

    if (isNewEntryLoaded) {
        setLastLoadedEntry({dashboardID, hash, filters, violationStages});
    }

    const lastLoadedKey = `${ONYXKEYS.COLLECTION.INSIGHTS}${lastLoadedEntry?.dashboardID}_${lastLoadedEntry?.hash}` as const;
    const [lastLoadedEntryData] = useOnyx(lastLoadedKey, {selector: (entry) => ({graphs: entry?.graphs, asOfDate: entry?.asOfDate})});
    // The charts that reuse an average show the loaded entry's data, so their links count expenses through the same day
    const canReuseAsOfDate = !!lastLoadedEntry && lastLoadedEntry.dashboardID === dashboardID && haveSameAverageFilters(lastLoadedEntry.filters, filters);

    return {
        getReusableAverageGraph: (chart: InsightsChartSpec) =>
            canReuseAverage(lastLoadedEntry, dashboardID, filters, violationStages, chart) ? lastLoadedEntryData?.graphs?.[chart.graphKey] : undefined,
        reusableAsOfDate: canReuseAsOfDate ? lastLoadedEntryData?.asOfDate : undefined,
    };
}

export default useReusableAverageGraph;
