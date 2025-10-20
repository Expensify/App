import type {NavigationState} from '@react-navigation/native';
import {navigationRef} from '@libs/Navigation/Navigation';
import type {ReportsSplitNavigatorParamList, SearchFullscreenNavigatorParamList, SearchReportParamList} from '@libs/Navigation/types';
import ROUTES, {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {PlatformStackRouteProp} from '../PlatformStackNavigation/types';

const ReportScreens = {
    [SCREENS.REPORT]: ROUTES.REPORT_WITH_ID,
    [SCREENS.SEARCH.REPORT_RHP]: ROUTES.SEARCH_REPORT,
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT]: ROUTES.SEARCH_MONEY_REQUEST_REPORT,
} as const;

const REPORT_SCREEN_NAMES = new Set(Object.keys(ReportScreens));

type ReportNavigationState = NavigationState<ReportsSplitNavigatorParamList | SearchFullscreenNavigatorParamList | SearchReportParamList>;

type ReportRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT>
    | PlatformStackRouteProp<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>;

/**
 * Searches a specific stack state (like ReportsSplitNavigator's state) for the
 * most recently navigated report screen, preferring the 'history' for accuracy.
 *
 * @param stackState The internal state object of a stack navigator.
 * @returns The most recent report route in this stack, or null.
 */
function findDeepestReportInSplitNavigator(stackState: ReportNavigationState): ReportRoute | null {
    if (!stackState || !stackState.routes || stackState.routes.length === 0) {
        return null;
    }

    // Use the history array for chronological order, falling back to current routes if history is absent
    const keysToSearch = stackState.history || stackState.routes.map((r) => r.key);

    const routeMap: Record<string, ReportRoute> = stackState.routes.reduce(
        (map, route) => {
            map[route.key] = route;
            return map;
        },
        {} as Record<string, ReportRoute>,
    );

    // Iterate the history/keys from the most recent (last element) backward (LIFO)
    for (let i = keysToSearch.length - 1; i >= 0; i--) {
        const routeKey = keysToSearch[i];
        const route = routeMap[routeKey as string];

        if (!route) {
            continue; // Skip keys that are no longer in the active routes array
        }

        if (REPORT_SCREEN_NAMES.has(route.name)) {
            return route;
        }
    }

    return null;
}

/**
 * Recursively searches a navigation state object to find the first report screen
 * encountered when navigating backward (most recent report screen).
 *
 * @param navigationState The navigation state object (top-level or nested).
 * @returns The route object of the most recent report screen found, or null.
 */
function findFirstReportScreenOnBack(navigationState = navigationRef.getRootState()): ReportRoute | null {
    if (!navigationState || !navigationState.routes || navigationState.routes.length === 0) {
        return null;
    }

    const {routes} = navigationState;

    // Iterate over the current routes array in REVERSE (LIFO) order.
    // This prioritizes the most active navigator (e.g., RightModalNavigator, then SearchFullscreenNavigator, then ReportsSplitNavigator).
    for (let i = routes.length - 1; i >= 0; i--) {
        const route = routes[i];

        // 1. Handle primary navigators (like ReportsSplitNavigator)
        if (route.name === 'ReportsSplitNavigator' && route.state) {
            const reportInSplit = findDeepestReportInSplitNavigator(route.state as ReportNavigationState);
            if (reportInSplit) {
                return reportInSplit;
            }
        }

        // 2. Handle nested navigators (like modals/fullscreens)
        if (route.state) {
            const nestedReport = findFirstReportScreenOnBack(route.state as ReportNavigationState);
            if (nestedReport) {
                return nestedReport;
            }
        }

        if (REPORT_SCREEN_NAMES.has(route.name)) {
            return route as ReportRoute;
        }
    }

    return null;
}

function getFirstReportRouteOnBack(): Route | undefined {
    const route = findFirstReportScreenOnBack();
    if (!route) {
        return;
    }
    switch (route.name) {
        case SCREENS.REPORT:
            const {reportID, reportActionID, referrer, backTo} = route.params;
            return ReportScreens[SCREENS.REPORT].getRoute(reportID, reportActionID, referrer, backTo);
        case SCREENS.SEARCH.REPORT_RHP:
            return ReportScreens[SCREENS.SEARCH.REPORT_RHP].getRoute(route.params);
        case SCREENS.SEARCH.MONEY_REQUEST_REPORT:
            return ReportScreens[SCREENS.SEARCH.MONEY_REQUEST_REPORT].getRoute(route.params);
        default:
            return;
    }
}

export default getFirstReportRouteOnBack;
