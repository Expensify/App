import type {NavigationRoute} from '@libs/Navigation/types';

/**
 * Utility function that extracts all unique navigation keys from an array of routes.
 * Recursively traverses the routes and collects all route keys.
 *
 * @param routes - array of routes for key extraction
 * @returns Set of unique route keys found in the navigation state
 */
function extractNavigationKeys(routes: NavigationRoute[] | undefined): Set<string> {
    if (!routes) {
        return new Set();
    }

    const keys = new Set<string>();
    const routesToProcess = [...routes];

    while (routesToProcess.length > 0) {
        const route = routesToProcess.pop();
        if (!route) {
            continue;
        }

        // Add the current route key to the set
        if (route.key) {
            keys.add(route.key);
        }

        // If the route has a nested state, add its routes to the processing queue
        if (route.state && 'routes' in route.state && Array.isArray(route.state.routes)) {
            routesToProcess.push(...route.state.routes);
        }
    }

    return keys;
}

export default extractNavigationKeys;
