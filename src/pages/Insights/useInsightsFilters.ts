import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {saveInsightsFilters, setInsightsFilters} from '@libs/actions/Insights';
import {getPolicyIDOrDefault} from '@libs/PolicyUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID, Policy} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection} from 'react-native-onyx';

import {useEffect} from 'react';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsTagLevelOption} from './insightsTagLevels';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';
import {parseInsightsFilters} from './insightsFilterParsing';
import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';
import {getQueryGroupBy} from './insightsGroupByUtils';
import {buildInsightsQueryString} from './insightsQueries';
import {getFittingTagLevel, getInsightsTagLevelNames, getInsightsTagLevelOptions, getInsightsTagPolicyIDs} from './insightsTagLevels';

type UseInsightsFiltersResult = {
    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Filters the dashboard starts from before any selection is stored, which a control's Reset returns to */
    defaultFilters: InsightsFilters;

    /** Whether the Onyx data the filters are built from has loaded */
    isResolved: boolean;

    /** Stores the selection a control owns, merged with the rest of the dashboard's filters */
    setFilters: (update: Partial<InsightsFilters>) => void;
    tagPolicyIDs: string[];
    tagLevelOptions: InsightsTagLevelOption[];
};

/**
 * @param shouldSkipFetch - Whether the page won't call GetInsights for these filters, so a change to them has to be saved on its own
 */
function useInsightsFilters(dashboard: InsightsDashboardID, shouldSkipFetch?: (next: InsightsFilters) => boolean, policies?: OnyxCollection<Policy>): UseInsightsFiltersResult {
    const {translate, numberFormat} = useLocalize();
    const {searchKey} = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const [activePolicyID, activePolicyIDMetadata] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy, activePolicyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(activePolicyID)}`);

    const [storedQuery, storedQueryMetadata] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: (searchFilters) => getLastSearchQuery(searchFilters, searchKey)});

    const defaultFilters: InsightsFilters = {
        ...DEFAULT_INSIGHTS_FILTERS,
        date: dashboard === CONST.INSIGHTS.DASHBOARD.COMPLIANCE ? {preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH} : DEFAULT_INSIGHTS_FILTERS.date,
        groupCurrency: activePolicy?.outputCurrency ?? CONST.CURRENCY.USD,
    };
    const storedFilters: InsightsFilters = {...defaultFilters, ...parseInsightsFilters(storedQuery)};
    const isSpend = dashboard === CONST.INSIGHTS.DASHBOARD.SPEND;
    const tagPolicyIDs = isSpend ? getInsightsTagPolicyIDs(policies, storedFilters.policyIDs) : [];
    const [namesByPolicy = getEmptyArray<string[]>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: (tags) => getInsightsTagLevelNames(tags, tagPolicyIDs)});
    const [hasLoadedTagLists = false] = useOnyx(ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE, {
        selector: (states) => tagPolicyIDs.every((policyID) => states?.[`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${policyID}`]?.hasOnceLoaded),
    });
    const tagLevelOptions = getInsightsTagLevelOptions(namesByPolicy, (level) => translate('insightsPage.tagLevel', numberFormat(level)));
    const selectedTagLevel = storedFilters.tagLevel ?? CONST.INSIGHTS.DEFAULT_TAG_LEVEL;
    // Partial lazy-loaded lists cannot prove that a saved level no longer exists.
    const canFitTagLevel = policies !== undefined && hasLoadedTagLists;
    const filters: InsightsFilters = {
        ...storedFilters,
        ...(isSpend && {tagLevel: canFitTagLevel ? getFittingTagLevel(selectedTagLevel, tagLevelOptions) : selectedTagLevel}),
    };
    const isResolved = activePolicyIDMetadata.status === 'loaded' && activePolicyMetadata.status === 'loaded' && storedQueryMetadata.status === 'loaded';

    useEffect(() => {
        if (!isResolved || !isSpend || !canFitTagLevel || selectedTagLevel === filters.tagLevel) {
            return;
        }
        saveInsightsFilters(searchKey, buildInsightsQueryString(filters));
    }, [isResolved, isSpend, canFitTagLevel, selectedTagLevel, filters, searchKey]);

    // What GetInsights fetches, so two selections that fetch the same thing can be told apart from ones that need a new request. Leaves out the display-only parts: the Compare mode every response already covers, and Running total, which resolves to its bucket here.
    const fetchedQuery = (dashboardFilters: InsightsFilters) => buildInsightsQueryString({...dashboardFilters, groupBy: getQueryGroupBy(dashboardFilters), compare: undefined});

    const setFilters = (update: Partial<InsightsFilters>) => {
        const next = {...filters, ...update};
        const query = buildInsightsQueryString(next);
        // GetInsights persists the filters as a side effect, so a change it won't fetch for (Compare mode, a Running total toggle that keeps the same bucket, or any change the page skips fetching for) is saved on its own instead.
        if (fetchedQuery(next) === fetchedQuery(filters) || shouldSkipFetch?.(next)) {
            saveInsightsFilters(searchKey, query);
            return;
        }
        setInsightsFilters(searchKey, query);
    };

    return {
        filters,
        defaultFilters,
        isResolved,
        setFilters,
        tagPolicyIDs,
        tagLevelOptions,
    };
}

export default useInsightsFilters;
