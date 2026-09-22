import Log from '@libs/Log';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import type {ChartBucketRange} from './chartGroupByConfig';
import type {SearchQueryJSON, SearchQueryString} from './types';

type ChartDrillDown = {
    /** Narrows the table to the pressed group, left out by a time bucket, which is only narrowed by dates */
    groupFilter?: string;

    /**
     * The dates the pressed bar covers: its bucket, or the window its series plots. It replaces the query's own date
     * filters rather than narrowing them, because a previous-period range and the page's range never intersect.
     */
    dateRange?: ChartBucketRange;
};

/**
 * Builds the Spend table query behind a clicked chart point, keeping the filters the chart was plotted with.
 * A ranking point adds its own dimension as a filter, a time bucket narrows the date range to the bucket clicked.
 */
function buildChartDrillDownQuery(queryJSON: Readonly<SearchQueryJSON>, {groupFilter, dateRange}: ChartDrillDown): SearchQueryString | undefined {
    const hasDateRange = !!dateRange?.start && !!dateRange?.end;
    const baseQueryJSON = hasDateRange
        ? {
              ...queryJSON,
              flatFilters: queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE),
          }
        : queryJSON;
    const dateFilter = hasDateRange ? `date>=${dateRange.start} date<=${dateRange.end}` : '';
    const pointQueryJSON = buildSearchQueryJSON([buildSearchQueryString(baseQueryJSON), dateFilter, groupFilter].filter(Boolean).join(' '));

    if (!pointQueryJSON) {
        Log.alert('[chartDrillDown] Failed to build search query JSON from filter query');
        return undefined;
    }

    return buildSearchQueryString({
        ...pointQueryJSON,
        groupBy: undefined,
        limit: undefined,
        view: CONST.SEARCH.VIEW.TABLE,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    });
}

/** Builds the Spend table query behind a chart's "View on Spend", which opens the rows the chart plots as they are grouped and sorted, over the whole period. */
function buildViewOnSpendQuery(queryJSON: Readonly<SearchQueryJSON>): SearchQueryString {
    return buildSearchQueryString({
        ...queryJSON,
        limit: undefined,
        view: CONST.SEARCH.VIEW.TABLE,
    });
}

export {buildChartDrillDownQuery, buildViewOnSpendQuery};
export type {ChartDrillDown};
