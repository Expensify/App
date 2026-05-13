import type {NavigationRoute, ParamListBase} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';

type Route = NavigationRoute<ParamListBase, string>;

/**
 * Ensures the last two TAB_NAVIGATOR instances are always included in the rendered routes,
 * even when routes are sliced for performance optimization.
 * The second-to-last ROOT_TAB holds the previous tab state (e.g., inbox history) and must stay
 * mounted to preserve that state when a newer ROOT_TAB is pushed above (e.g., for workspace
 * navigation from RHP).
 */
function ensureTabNavigatorRoutes(slicedRoutes: Route[], indexToSlice: number, allRoutes: Route[]): Route[] {
    if (indexToSlice === 0) {
        return slicedRoutes;
    }

    const allRootTabs = allRoutes.filter((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const rootTabsToKeep = allRootTabs.slice(-2);

    if (rootTabsToKeep.length === 0) {
        return slicedRoutes;
    }

    // Remove any ROOT_TAB instances that are not in the last two
    const filteredRoutes = slicedRoutes.filter((route) => route.name !== NAVIGATORS.TAB_NAVIGATOR || rootTabsToKeep.includes(route));

    // Prepend any of the last two ROOT_TABs that are missing from the sliced routes
    const missingRootTabs = rootTabsToKeep.filter((rt) => !filteredRoutes.includes(rt));

    return [...missingRootTabs, ...filteredRoutes];
}

export default ensureTabNavigatorRoutes;
