import type { ParamListBase, StackNavigationState } from '@react-navigation/native';
import { screensWithEnteringAnimation } from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import { isFullScreenName } from '@libs/Navigation/helpers/isNavigatorName';

type StateRoutes = StackNavigationState<ParamListBase>['routes'];

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
function reuseNavigatorKey(routesToRender: StateRoutes, fullState: StackNavigationState<ParamListBase>): StateRoutes {
    return routesToRender.map((route) => {
        const previousRoute = fullState.routes.at(-2);

        // Skip if this is not a fullscreen navigator or if we're already inside the same navigator
        if (!isFullScreenName(route.name) || previousRoute?.name === route.name) {
            return route;
        }

        // Look for an already mounted navigator with the same name but a different key
        const existingRoute = fullState.routes.find((r) => r.name === route.name && r.key !== route.key);

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

        return {
            ...existingRoute, // Reuse the mounted navigator (preserve key and internal state)
            params: {
                ...route.params, // Apply params from the incoming navigation action
            },
        };
    });
}

export default reuseNavigatorKey;
