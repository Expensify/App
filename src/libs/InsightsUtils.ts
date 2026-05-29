import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {buildQueryStringFromFilterFormValues} from './SearchQueryUtils';

type InsightTabScreen = typeof SCREENS.INSIGHTS.TOP_SPENDERS | typeof SCREENS.INSIGHTS.TOP_CATEGORIES | typeof SCREENS.INSIGHTS.TOP_MERCHANTS | typeof SCREENS.INSIGHTS.SPEND_OVER_TIME;

type InsightConfig = {
    /** Translation key for the tab title. */
    translationPath: 'search.tabs.topSpenders' | 'search.tabs.topCategories' | 'search.tabs.topMerchants' | 'search.spendOverTime';

    /** Icon shown in the tab. */
    icon: 'User' | 'Folder' | 'Basket' | 'CalendarSolid';

    /** Route to navigate to when the tab is tapped. */
    route: string;

    /** SCREENS constant used to match the active tab. */
    screen: InsightTabScreen;

    /** The encoded Spend search query that displays the underlying chart/table. */
    searchQuery: string;
};

/**
 * Configurations for each of the four Insights sub-tabs.
 * Mirrors the searchQuery strings defined in SearchUIUtils.ts so the
 * top-level Insights page and the legacy Spend menu stay in sync.
 */
const INSIGHTS_CONFIG: Record<InsightTabScreen, InsightConfig> = {
    [SCREENS.INSIGHTS.TOP_SPENDERS]: {
        translationPath: 'search.tabs.topSpenders',
        icon: 'User',
        route: ROUTES.INSIGHTS_TOP_SPENDERS.route,
        screen: SCREENS.INSIGHTS.TOP_SPENDERS,
        searchQuery: buildQueryStringFromFilterFormValues(
            {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                dateOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                view: CONST.SEARCH.VIEW.BAR,
                status: [
                    CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
                    CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
                    CONST.SEARCH.STATUS.EXPENSE.APPROVED,
                    CONST.SEARCH.STATUS.EXPENSE.DONE,
                    CONST.SEARCH.STATUS.EXPENSE.PAID,
                ],
            },
            {
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
        ),
    },
    [SCREENS.INSIGHTS.TOP_CATEGORIES]: {
        translationPath: 'search.tabs.topCategories',
        icon: 'Folder',
        route: ROUTES.INSIGHTS_TOP_CATEGORIES.route,
        screen: SCREENS.INSIGHTS.TOP_CATEGORIES,
        searchQuery: buildQueryStringFromFilterFormValues(
            {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                dateOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                view: CONST.SEARCH.VIEW.BAR,
            },
            {
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
        ),
    },
    [SCREENS.INSIGHTS.TOP_MERCHANTS]: {
        translationPath: 'search.tabs.topMerchants',
        icon: 'Basket',
        route: ROUTES.INSIGHTS_TOP_MERCHANTS.route,
        screen: SCREENS.INSIGHTS.TOP_MERCHANTS,
        searchQuery: buildQueryStringFromFilterFormValues(
            {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                dateOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                view: CONST.SEARCH.VIEW.PIE,
            },
            {
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
        ),
    },
    [SCREENS.INSIGHTS.SPEND_OVER_TIME]: {
        translationPath: 'search.spendOverTime',
        icon: 'CalendarSolid',
        route: ROUTES.INSIGHTS_SPEND_OVER_TIME.route,
        screen: SCREENS.INSIGHTS.SPEND_OVER_TIME,
        searchQuery: buildQueryStringFromFilterFormValues(
            {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                groupBy: CONST.SEARCH.GROUP_BY.MONTH,
                dateOn: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS,
                view: CONST.SEARCH.VIEW.LINE,
            },
            {
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
                sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
            },
        ),
    },
};

const INSIGHTS_TAB_ORDER: InsightTabScreen[] = [SCREENS.INSIGHTS.SPEND_OVER_TIME, SCREENS.INSIGHTS.TOP_SPENDERS, SCREENS.INSIGHTS.TOP_CATEGORIES, SCREENS.INSIGHTS.TOP_MERCHANTS];

const DEFAULT_INSIGHTS_SCREEN: InsightTabScreen = SCREENS.INSIGHTS.SPEND_OVER_TIME;

/** Maps the trailing `:tab?` URL segment back to its InsightTabScreen constant. */
const URL_SLUG_TO_INSIGHT_TAB: Record<string, InsightTabScreen> = {
    'top-spenders': SCREENS.INSIGHTS.TOP_SPENDERS,
    'top-categories': SCREENS.INSIGHTS.TOP_CATEGORIES,
    'top-merchants': SCREENS.INSIGHTS.TOP_MERCHANTS,
    'spend-over-time': SCREENS.INSIGHTS.SPEND_OVER_TIME,
};

function isInsightTabScreen(screenName: string | undefined): screenName is InsightTabScreen {
    return !!screenName && screenName in INSIGHTS_CONFIG;
}

function getInsightConfig(screen: InsightTabScreen): InsightConfig {
    return INSIGHTS_CONFIG[screen];
}

function getInsightTabFromUrlSlug(slug: string | undefined): InsightTabScreen {
    return (slug && URL_SLUG_TO_INSIGHT_TAB[slug]) || DEFAULT_INSIGHTS_SCREEN;
}

export {INSIGHTS_CONFIG, INSIGHTS_TAB_ORDER, DEFAULT_INSIGHTS_SCREEN, isInsightTabScreen, getInsightConfig, getInsightTabFromUrlSlug};
export type {InsightTabScreen, InsightConfig};
