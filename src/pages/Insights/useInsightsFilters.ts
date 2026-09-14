import useActivePolicy from '@hooks/useActivePolicy';

import CONST from '@src/CONST';

import type {InsightsFilters} from './insightsFilters';

import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';

/** The page-level filters every chart on the dashboard is narrowed by, once the Onyx data they are built from has loaded. */
function useInsightsFilters(): {filters: InsightsFilters; isResolved: boolean} {
    const [activePolicy, isActivePolicyResolved] = useActivePolicy();

    return {
        filters: {...DEFAULT_INSIGHTS_FILTERS, groupCurrency: activePolicy?.outputCurrency ?? CONST.CURRENCY.USD},
        isResolved: isActivePolicyResolved,
    };
}

export default useInsightsFilters;
