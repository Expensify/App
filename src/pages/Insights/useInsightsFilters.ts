import useOnyx from '@hooks/useOnyx';

import {setInsightsFilters} from '@libs/actions/Insights';
import {getPolicyIDOrDefault} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';
import {parseInsightsFilters} from './insightsFilterParsing';
import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';
import {buildInsightsQueryString} from './insightsQueries';

type UseInsightsFiltersResult = {
    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Filters the dashboard starts from before any selection is stored, which a control's Reset returns to */
    defaultFilters: InsightsFilters;

    /** Whether the Onyx data the filters are built from has loaded */
    isResolved: boolean;

    /** Stores the selection a control owns, merged with the rest of the dashboard's filters */
    setFilters: (update: Partial<InsightsFilters>) => void;
};

function useInsightsFilters(dashboard: InsightsDashboardID): UseInsightsFiltersResult {
    const {searchKey} = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const [activePolicyID, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy, activePolicyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(activePolicyID)}`);

    // Running total is stored beside the query, so it's read off the whole stored entry rather than the query string.
    const [storedFilter, storedFilterMetadata] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {
        selector: (searchFilters) => {
            const entry = searchFilters?.[searchKey];
            return typeof entry === 'object' ? {query: entry.query, runningTotal: entry.runningTotal} : {query: entry, runningTotal: undefined};
        },
    });

    const defaultFilters: InsightsFilters = {
        ...DEFAULT_INSIGHTS_FILTERS,
        groupCurrency: activePolicy?.outputCurrency ?? CONST.CURRENCY.USD,
    };
    const filters: InsightsFilters = {...defaultFilters, ...parseInsightsFilters(storedFilter?.query), runningTotal: storedFilter?.runningTotal};

    const setFilters = (update: Partial<InsightsFilters>) => {
        const next = {...filters, ...update};
        setInsightsFilters(searchKey, buildInsightsQueryString(next), next.runningTotal ?? false);
    };

    return {
        filters,
        defaultFilters,
        isResolved: activePolicyIDMetadata.status === 'loaded' && activePolicyMetadata.status === 'loaded' && storedFilterMetadata.status === 'loaded',
        setFilters,
    };
}

export default useInsightsFilters;
