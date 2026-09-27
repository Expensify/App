import type {SearchDatePreset} from '@components/Search/types';

import CONST from '@src/CONST';

type InsightsFilters = {
    /** Period reported on, either one of the presets or a range closed at both ends. */
    date: {preset: SearchDatePreset} | {after: string; before: string};

    /** Workspaces to report on, or every workspace the user can see when empty. */
    policyIDs: string[];

    /** Time bucket the headline chart aggregates into. */
    groupBy: typeof CONST.SEARCH.GROUP_BY.WEEK | typeof CONST.SEARCH.GROUP_BY.MONTH | typeof CONST.SEARCH.GROUP_BY.QUARTER | typeof CONST.SEARCH.GROUP_BY.YEAR;

    /** Currency every amount is converted to, so graphs can sum across workspaces. */
    groupCurrency: string;
};

const DEFAULT_INSIGHTS_FILTERS: Omit<InsightsFilters, 'groupCurrency'> = {
    date: {preset: CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE},
    policyIDs: [],
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
};

export type {InsightsFilters};
export default DEFAULT_INSIGHTS_FILTERS;
