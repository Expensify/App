import type {NavigationState, PartialState} from '@react-navigation/native';

/**
 * Utility function that extracts all unique navigation keys from a React Navigation state.
 * Recursively traverses the navigation state tree and collects all route keys.
 *
 * @param state - The React Navigation state (can be partial or complete)
 * @returns Set of unique route keys found in the navigation state
 */
function extractNavigationKeys(state: NavigationState | PartialState<NavigationState> | undefined): Set<string> {
    if (!state || !state.routes) {
        return new Set();
    }

    const keys = new Set<string>();
    const routesToProcess = [...state.routes];

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
