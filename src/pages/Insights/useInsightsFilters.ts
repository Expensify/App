import useOnyx from '@hooks/useOnyx';

import {setInsightsFilters} from '@libs/actions/Insights';
import {getPolicyIDOrDefault} from '@libs/PolicyUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';
import {parseInsightsFilters} from './insightsFilterParsing';
import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';
import {buildInsightsQueryString} from './insightsQueries';

type UseInsightsFilters = {
    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Whether the Onyx data the filters are built from has loaded */
    isResolved: boolean;

    /** Stores the selection a control owns, merged with the rest of the dashboard's filters */
    setFilters: (update: Partial<InsightsFilters>) => void;
};

function useInsightsFilters(dashboard: InsightsDashboardID): UseInsightsFilters {
    const {searchKey} = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const [activePolicyID, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy, activePolicyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(activePolicyID)}`);

    // The selector keeps the page off every other search key's writes, since the whole nvp is shared with the Spend page.
    const [storedQuery, storedQueryMetadata] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: (searchFilters) => getLastSearchQuery(searchFilters, searchKey)});

    const filters: InsightsFilters = {
        ...DEFAULT_INSIGHTS_FILTERS,
        groupCurrency: activePolicy?.outputCurrency ?? CONST.CURRENCY.USD,
        ...parseInsightsFilters(storedQuery),
    };

    // Storing the merged query is what re-requests the dashboard: it changes the query the page resolves, which its effect is keyed on.
    const setFilters = (update: Partial<InsightsFilters>) => {
        setInsightsFilters(searchKey, buildInsightsQueryString({...filters, ...update}));
    };

    return {
        filters,
        isResolved: activePolicyIDMetadata.status === 'loaded' && activePolicyMetadata.status === 'loaded' && storedQueryMetadata.status === 'loaded',
        setFilters,
    };
}

export default useInsightsFilters;
