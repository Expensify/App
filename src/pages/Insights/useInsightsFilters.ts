import useActivePolicy from '@hooks/useActivePolicy';

import CONST from '@src/CONST';

import type {InsightsFilters} from './insightsFilters';

import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';

/** Waits for the active policy before using its output currency in the filters. */
function useInsightsFilters(): {filters: InsightsFilters; isResolved: boolean} {
    const [activePolicy, isActivePolicyResolved] = useActivePolicy();

    return {
        filters: {...DEFAULT_INSIGHTS_FILTERS, groupCurrency: activePolicy?.outputCurrency ?? CONST.CURRENCY.USD},
        isResolved: isActivePolicyResolved,
    };
}

export default useInsightsFilters;
