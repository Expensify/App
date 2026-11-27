import type {SearchDatePreset, SearchGroupBy} from '@components/Search/types';

import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';

import CONST from '@src/CONST';

const PERIOD_BY_PRESET: Partial<Record<SearchDatePreset, InsightsTimeGroupBy>> = {
    [CONST.SEARCH.DATE_PRESETS.THIS_WEEK]: CONST.SEARCH.GROUP_BY.WEEK,
    [CONST.SEARCH.DATE_PRESETS.LAST_WEEK]: CONST.SEARCH.GROUP_BY.WEEK,
    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: CONST.SEARCH.GROUP_BY.MONTH,
    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: CONST.SEARCH.GROUP_BY.MONTH,
    [CONST.SEARCH.DATE_PRESETS.THIS_QUARTER]: CONST.SEARCH.GROUP_BY.QUARTER,
    [CONST.SEARCH.DATE_PRESETS.LAST_QUARTER]: CONST.SEARCH.GROUP_BY.QUARTER,
};

/** Returns the length of period the Details panel summarizes and splits its history into, for a point clicked on a graph grouped by `itemGroupBy`, undefined on graphs over time. */
function getInsightsDetailsPeriod(filters: InsightsFilters, itemGroupBy: SearchGroupBy | undefined): InsightsTimeGroupBy {
    const drawnGroupBy = getQueryGroupBy(filters);
    if (!itemGroupBy || !('preset' in filters.date)) {
        return drawnGroupBy;
    }

    return PERIOD_BY_PRESET[filters.date.preset] ?? drawnGroupBy;
}

export default getInsightsDetailsPeriod;
