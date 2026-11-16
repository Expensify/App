import useOnyx from '@hooks/useOnyx';

import {saveInsightsFilters, setInsightsFilters} from '@libs/actions/Insights';
import {getPolicyIDOrDefault} from '@libs/PolicyUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';
import {parseInsightsFilters} from './insightsFilterParsing';
import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';
import {getGroupByForDateRange, getQueryGroupBy} from './insightsGroupByUtils';
import {buildInsightsQueryString} from './insightsQueries';

type UseInsightsFiltersResult = {
    /** Page-level filters every chart on the dashboard is narrowed by, with a grouping the date range doesn't offer swapped for the dashboard's default when it fits */
    filters: InsightsFilters;

    /** Filters as the user stored them, which keep a grouping the date range doesn't offer so it comes back on a range that does */
    savedFilters: InsightsFilters;

    /** Filters the dashboard starts from before any selection is stored, which a control's Reset returns to */
    defaultFilters: InsightsFilters;

    /** Whether the Onyx data the filters are built from has loaded */
    isResolved: boolean;

    /** Stores the selection a control owns, merged with the rest of the dashboard's filters */
    setFilters: (update: Partial<InsightsFilters>) => void;
};

/**
 * @param shouldSkipFetch - Whether the page won't call GetInsights for these filters, so a change to them has to be saved on its own
 */
function useInsightsFilters(dashboard: InsightsDashboardID, shouldSkipFetch?: (next: InsightsFilters) => boolean): UseInsightsFiltersResult {
    const {searchKey} = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const [activePolicyID, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy, activePolicyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(activePolicyID)}`);

    const [storedQuery, storedQueryMetadata] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: (searchFilters) => getLastSearchQuery(searchFilters, searchKey)});

    const defaultFilters: InsightsFilters = {
        ...DEFAULT_INSIGHTS_FILTERS[dashboard],
        groupCurrency: activePolicy?.outputCurrency ?? CONST.CURRENCY.USD,
    };
    // A stored query leaves Compare out when it's off, so the default Compare mode only applies until the filters are stored
    const savedFilters: InsightsFilters = {...defaultFilters, compare: storedQuery ? undefined : defaultFilters.compare, ...parseInsightsFilters(storedQuery)};
    // Only the displayed filters are fitted, so the saved grouping comes back once a range that offers it is picked
    const fitToDateRange = (dashboardFilters: InsightsFilters): InsightsFilters => ({
        ...dashboardFilters,
        groupBy: getGroupByForDateRange(dashboardFilters.groupBy, dashboardFilters.date, defaultFilters.groupBy),
    });
    const filters = fitToDateRange(savedFilters);

    // What GetInsights fetches, so two selections that fetch the same thing can be told apart from ones that need a new request. Leaves out the display-only parts: the Compare mode every response already covers, and Running total, which resolves to its bucket here.
    const fetchedQuery = (dashboardFilters: InsightsFilters) => buildInsightsQueryString({...dashboardFilters, groupBy: getQueryGroupBy(dashboardFilters), compare: undefined});

    const setFilters = (update: Partial<InsightsFilters>) => {
        const next = {...savedFilters, ...update};
        const query = buildInsightsQueryString(next);
        // GetInsights persists the filters as a side effect, so a change it won't fetch for (Compare mode, a Running total toggle that keeps the same bucket, or any change the page skips fetching for) is saved on its own instead.
        if (fetchedQuery(fitToDateRange(next)) === fetchedQuery(filters) || shouldSkipFetch?.(next)) {
            saveInsightsFilters(searchKey, query);
            return;
        }
        setInsightsFilters(searchKey, query);
    };

    return {
        filters,
        savedFilters,
        defaultFilters,
        isResolved: activePolicyIDMetadata.status === 'loaded' && activePolicyMetadata.status === 'loaded' && storedQueryMetadata.status === 'loaded',
        setFilters,
    };
}

export default useInsightsFilters;
