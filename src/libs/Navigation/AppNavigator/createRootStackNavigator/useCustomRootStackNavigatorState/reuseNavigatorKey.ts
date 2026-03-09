import type { ParamListBase, StackNavigationState } from '@react-navigation/native';
import { screensWithEnteringAnimation } from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import { isFullScreenName } from '@libs/Navigation/helpers/isNavigatorName';
















type StateRoutes = StackNavigationState<ParamListBase>['routes'];

type RemappedStateRoute = StateRoutes[number] & {originalKey?: string};

/**
 * Tracks the mapping from a new route's key (originalKey) to the mounted navigator's key.
 * This allows getMinimalAction to drill into the mounted navigator's preserved state
 * even though the new route has no embedded state in the root navigation state.
 *
 * Example: when Inbox.key = key1 is remapped to Inbox.key = key2, remappedKeyMap[key2] = key1.
 */
const remappedKeyMap: Record<string, string> = {};

function getRemappedNavigatorKey(originalKey: string): string | undefined {
    return remappedKeyMap[originalKey];
}

/**
 * For each fullscreen navigator in routesToRender, checks whether a navigator
 * with the same name is already mounted in the current navigation state.
 *
 * If such a route exists (with a different key), the new route is replaced
 * with the existing one while applying the new params.
 *
 * This preserves the original route key so React can reuse the already-mounted
 * navigator instance, while the updated params instruct it which screen to display.
 *
 * The actual navigation state is not mutated — this only affects what gets rendered.
 */
function buildOptimizedRoutes(routesToRender: StateRoutes, state: StackNavigationState<ParamListBase>): RemappedStateRoute[] {
    // Rebuild the mapping from scratch on every call so it always reflects the current render state.
    for (const key of Object.keys(remappedKeyMap)) {
        delete remappedKeyMap[key];
    }

    return routesToRender.map((route) => {
        const previousRoute = state.routes.at(-2);

        // Skip if this is not a fullscreen navigator or if we're already inside the same navigator
        if (!isFullScreenName(route.name) || previousRoute?.name === route.name) {
            return route;
        }

        // Look for an already mounted navigator with the same name but a different key
        const existingRoute = state.routes.find((r) => r.name === route.name && r.key !== route.key);

        if (!existingRoute) {
            return route;
        }

        // Prevent rendering two routes with the same key
        if (routesToRender.some((r) => r.key === existingRoute.key)) {
            return route;
        }

        // Move the entering-animation marker to the reused route key
        // so the animation runs on the existing navigator instance
        if (screensWithEnteringAnimation.has(route.key)) {
            screensWithEnteringAnimation.delete(route.key);
            screensWithEnteringAnimation.add(existingRoute.key);
        }

        // Track that route.key is rendered via existingRoute.key so that getMinimalAction
        // can look up the mounted navigator's preserved state when route has no embedded state.
        remappedKeyMap[route.key] = existingRoute.key;

        return {
            ...existingRoute, // Reuse the mounted navigator (preserve key so React doesn't unmount it)
            state: undefined, // Clear old embedded state so getInitialState is called with the new params
            params: {
                ...route.params, // Apply params from the incoming navigation action
            },
            originalKey: route.key,
        };
    });
}

export type {RemappedStateRoute};
export {getRemappedNavigatorKey};
export default buildOptimizedRoutes;
