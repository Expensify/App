import Log from '@libs/Log';
import {buildSearchQueryJSON, buildSearchQueryString, isGroupBySupportedBySearch} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import type {SearchQueryJSON, SearchQueryString} from './types';

/**
 * Builds the Spend table query behind a clicked chart point, keeping the filters the chart was plotted with.
 * A ranking point adds its own dimension as a filter, a time bucket narrows the date range to the bucket clicked.
 */
function buildChartDrillDownQuery(queryJSON: Readonly<SearchQueryJSON>, filterQuery: string): SearchQueryString | undefined {
    const pointQueryJSON = buildSearchQueryJSON(`${buildSearchQueryString(queryJSON)} ${filterQuery}`);

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
    // Search can't group by Insights-only values, so the chart's expenses are listed ungrouped instead (waiting for https://github.com/Expensify/App/issues/105303)
    if (!isGroupBySupportedBySearch(queryJSON.groupBy)) {
        return buildSearchQueryString({
            ...queryJSON,
            groupBy: undefined,
            limit: undefined,
            view: CONST.SEARCH.VIEW.TABLE,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        });
    }

    return buildSearchQueryString({...queryJSON, limit: undefined, view: CONST.SEARCH.VIEW.TABLE});
}

export {buildChartDrillDownQuery, buildViewOnSpendQuery};
