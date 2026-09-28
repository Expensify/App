import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getSuggestedSearches, getSuggestedSearchesVisibility, SPEND_INSIGHT_KEYS} from '@libs/SearchUIUtils';

import type {InsightsChartSpec} from '@pages/Insights/dashboardSpecs';
import INSIGHTS_DASHBOARD_SPECS, {getVisibleCharts} from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {applyInsightsFilters} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsGraphKey} from '@src/types/onyx';

import {defaultExpensifyCardSelector} from '@selectors/Card';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';

type HomeInsightConfig = SearchTypeMenuItem & {
    /** Color every bar is drawn in. Only a bar chart reads it. */
    color?: string;
};

const HOME_INSIGHT_ICONS: Record<InsightsGraphKey, SearchTypeMenuItem['icon']> = {
    [CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME]: 'CalendarSolid',
    [CONST.INSIGHTS.GRAPH.TOP_SPENDERS]: 'User',
    [CONST.INSIGHTS.GRAPH.TOP_MERCHANTS]: 'Basket',
    [CONST.INSIGHTS.GRAPH.TOP_CATEGORIES]: 'Folder',
};

/** Builds a Home insight that queries the same chart as the Insights page. */
function buildInsightConfigFromChart(chart: InsightsChartSpec, filters: InsightsFilters): HomeInsightConfig {
    const searchQuery = applyInsightsFilters(chart, filters);
    const searchQueryJSON = buildSearchQueryJSON(searchQuery);

    return {
        key: chart.graphKey,
        translationPath: chart.titleKey,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        icon: HOME_INSIGHT_ICONS[chart.graphKey],
        searchQuery,
        searchQueryJSON,
        hash: searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID,
        similarSearchHash: searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID,
        recentSearchHash: searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID,
        color: chart.color,
    };
}

/**
 * Builds the configs for the Home insights the current user should see, in display order.
 * With the Insights page beta, the charts and their visibility match the Insights Spend dashboard, otherwise the Spend menu.
 */
function useHomeInsightConfigs(): {configs: HomeInsightConfig[]; isResolved: boolean} {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [defaultExpensifyCard] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: defaultExpensifyCardSelector});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const {defaultCardFeed, cardFeedsByPolicy} = useCardFeedsForDisplay();
    const {isBetaEnabled} = usePermissions();
    const {filters, isResolved: areFiltersResolved} = useInsightsFilters();

    if (!isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE)) {
        const {visibility, shouldShowExpensifyCard} = getSuggestedSearchesVisibility(session?.email, cardFeedsByPolicy, policies, defaultExpensifyCard, false, !!isTrackIntentUser);
        const suggestedSearches = getSuggestedSearches(session?.accountID, (defaultCardFeed ?? defaultExpensifyCard)?.id, shouldShowExpensifyCard);
        return {configs: SPEND_INSIGHT_KEYS.filter((key) => visibility[key]).map((key) => suggestedSearches[key]), isResolved: true};
    }

    const {headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];
    const configs = getVisibleCharts([headlineChart, ...supportingCharts], policies, filters.policyIDs, session?.email).map((chart) => buildInsightConfigFromChart(chart, filters));
    return {configs, isResolved: areFiltersResolved};
}

export default useHomeInsightConfigs;
