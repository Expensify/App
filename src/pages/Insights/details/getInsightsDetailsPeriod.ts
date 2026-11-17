import type {SearchDatePreset} from '@components/Search/types';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';

import CONST from '@src/CONST';
import type {InsightsGraphKey} from '@src/types/onyx';

const PERIOD_BY_PRESET: Partial<Record<SearchDatePreset, InsightsTimeGroupBy>> = {
    [CONST.SEARCH.DATE_PRESETS.THIS_WEEK]: CONST.SEARCH.GROUP_BY.WEEK,
    [CONST.SEARCH.DATE_PRESETS.LAST_WEEK]: CONST.SEARCH.GROUP_BY.WEEK,
    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: CONST.SEARCH.GROUP_BY.MONTH,
    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: CONST.SEARCH.GROUP_BY.MONTH,
    [CONST.SEARCH.DATE_PRESETS.THIS_QUARTER]: CONST.SEARCH.GROUP_BY.QUARTER,
    [CONST.SEARCH.DATE_PRESETS.LAST_QUARTER]: CONST.SEARCH.GROUP_BY.QUARTER,
};

/** Returns the length of period the Details panel summarizes and splits its history into, for a point clicked on the given graph. */
function getInsightsDetailsPeriod(filters: InsightsFilters, graphKey: InsightsGraphKey): InsightsTimeGroupBy {
    const drawnGroupBy = getQueryGroupBy(filters);
    if (graphKey === CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME || !('preset' in filters.date)) {
        return drawnGroupBy;
    }

    return PERIOD_BY_PRESET[filters.date.preset] ?? drawnGroupBy;
}

export default getInsightsDetailsPeriod;
