import type {SearchDatePreset} from '@components/Search/types';

import CONST from '@src/CONST';

type InsightsFilters = {
    datePreset: SearchDatePreset;
    policyIDs: string[];
    groupBy: typeof CONST.SEARCH.GROUP_BY.WEEK | typeof CONST.SEARCH.GROUP_BY.MONTH | typeof CONST.SEARCH.GROUP_BY.QUARTER | typeof CONST.SEARCH.GROUP_BY.YEAR;
    groupCurrency: string;
};

const DEFAULT_INSIGHTS_FILTERS: Omit<InsightsFilters, 'groupCurrency'> = {
    datePreset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE,
    policyIDs: [],
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
};

export type {InsightsFilters};
export default DEFAULT_INSIGHTS_FILTERS;
