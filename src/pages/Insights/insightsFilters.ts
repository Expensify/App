import type {SearchDatePreset} from '@components/Search/types';

import CONST from '@src/CONST';

type InsightsFilters = {
    /** Period reported on: one of the presets, a single day, or a range closed at both ends. */
    date: {preset: SearchDatePreset} | {on: string} | {from: string; to: string};

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

const INSIGHTS_GROUP_BY_OPTIONS = [CONST.SEARCH.GROUP_BY.WEEK, CONST.SEARCH.GROUP_BY.MONTH, CONST.SEARCH.GROUP_BY.QUARTER, CONST.SEARCH.GROUP_BY.YEAR] as const;

export type {InsightsFilters};
export {INSIGHTS_GROUP_BY_OPTIONS};
export default DEFAULT_INSIGHTS_FILTERS;
