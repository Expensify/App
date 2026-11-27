/** Builds the requests a Details panel makes: the Search query behind Top expenses, and the GetInsightsDetails requests for its other sections. */
import {buildChartDrillDownQuery} from '@components/Search/chartDrillDown';
import type {SearchQueryJSON, SearchQueryString} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {isValidDate} from '@libs/ValidationUtils';

import type {InsightsChartSpec} from '@pages/Insights/dashboardSpecs';
import getInsightsLastDay from '@pages/Insights/getInsightsLastDay';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {applyInsightsFilters, buildTopExpensesQueryJSON, withInsightsSnapshotHash} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import type {InsightsBiggestChangesGroupBy} from '@src/types/onyx';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';
import type {InsightsDetailsItem} from './insightsDetailsItem';

import buildInsightsDetailsQuery from './buildInsightsDetailsQuery';
import getInsightsDetailsPeriod from './getInsightsDetailsPeriod';

type BuildInsightsDetailsQueriesParams = {
    chartSpec: InsightsChartSpec;

    /** The dashboard's saved filters */
    filters: InsightsFilters;

    item: InsightsDetailsItem;

    /** The item's key in the panel's URL */
    itemKey: string;

    /** First day of the clicked Spend over time period an item opened from Biggest changes covers */
    periodStart: string | undefined;

    /** Last day of the clicked period */
    periodEnd: string | undefined;

    /** Last day the dashboard counted expenses through, missing when the panel is opened from a link */
    asOf: string | undefined;

    biggestChangesGroupBy: InsightsBiggestChangesGroupBy;
};

type InsightsDetailsQueries = {
    /** The filters the panel's data is fetched with: the dashboard's, or the clicked period for an item opened from Biggest changes */
    requestFilters: InsightsFilters;

    /** Spend query for the item's expenses through the dashboard's last day */
    drillDownQuery: SearchQueryString | undefined;

    topExpensesQueryJSON: Readonly<SearchQueryJSON> | undefined;

    /** Undefined for graphs GetInsightsDetails doesn't support */
    detailsQuery: InsightsDetailsQuery | undefined;

    /** Request for Biggest changes alone, refetched when its grouping changes. Undefined for charts without the section */
    biggestChangesQuery: InsightsDetailsQuery | undefined;
};

function buildInsightsDetailsQueries({chartSpec, filters, item, itemKey, periodStart, periodEnd, asOf, biggestChangesGroupBy}: BuildInsightsDetailsQueriesParams): InsightsDetailsQueries {
    const lastDay = getInsightsLastDay(asOf);

    // An item opened from Biggest changes covers the clicked Spend over time period instead of the whole Date range.
    const isNarrowedToPeriod = chartSpec.graphKey !== CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME && !!periodStart && !!periodEnd && isValidDate(periodStart) && isValidDate(periodEnd);
    const requestFilters: InsightsFilters = isNarrowedToPeriod ? {...filters, date: {from: periodStart, to: periodEnd}} : filters;

    const queryJSONThroughToday = buildSearchQueryJSON(applyInsightsFilters(chartSpec, requestFilters, undefined, lastDay));
    const drillDownQuery = queryJSONThroughToday ? buildChartDrillDownQuery(queryJSONThroughToday, item.filterQuery) : undefined;
    const topExpensesQueryJSON = drillDownQuery ? withInsightsSnapshotHash(buildTopExpensesQueryJSON(drillDownQuery), chartSpec.graphKey) : undefined;
    const topExpensesSnapshotHash = topExpensesQueryJSON?.hash;

    const buildDetailsQuery = (sections: InsightsChartSpec['detailsSections']) =>
        topExpensesSnapshotHash === undefined
            ? undefined
            : buildInsightsDetailsQuery({
                  graphKey: chartSpec.graphKey,
                  sections,
                  biggestChangesGroupBy,
                  filters: requestFilters,
                  // Keeps the grouping of the Spend over time panel the item came from, which its period doesn't offer on its own
                  periodGroupBy: isNarrowedToPeriod ? getInsightsDetailsPeriod(filters, CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME) : undefined,
                  itemGroupBy: chartSpec.groupBy,
                  itemKey,
                  periodEnd,
                  topExpensesSnapshotHash,
                  lastDay,
              });

    return {
        requestFilters,
        drillDownQuery,
        topExpensesQueryJSON,
        detailsQuery: buildDetailsQuery(chartSpec.detailsSections),
        biggestChangesQuery: chartSpec.detailsSections?.includes(CONST.INSIGHTS.DETAILS_SECTION.BIGGEST_CHANGES)
            ? buildDetailsQuery([CONST.INSIGHTS.DETAILS_SECTION.BIGGEST_CHANGES])
            : undefined,
    };
}

export default buildInsightsDetailsQueries;
