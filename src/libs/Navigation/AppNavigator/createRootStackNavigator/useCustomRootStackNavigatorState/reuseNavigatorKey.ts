import type { ParamListBase, StackNavigationState } from '@react-navigation/native';
import { screensWithEnteringAnimation } from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import { isFullScreenName } from '@libs/Navigation/helpers/isNavigatorName';

type StateRoutes = StackNavigationState<ParamListBase>['routes'];

/**
 * For each fullscreen navigator in routesToRender, checks if a route with the same name
 * already exists in the full state (with a different key). If so, replaces the new route
 * with the existing one updated with the new params — exactly mirroring what
 * handlePushFullscreenAction did at the router level.
 * This causes React to reuse the already-mounted navigator component (same key),
 * while the new params tell the navigator which screen to show.
 * The real navigation state is untouched.
 */



function reuseNavigatorKey(routesToRender: StateRoutes, fullState: StackNavigationState<ParamListBase>): StateRoutes {
    return routesToRender.map((route) => {
        if (!isFullScreenName(route.name) || fullState.routes.at(fullState.routes.length - 1)?.name === route.name) {
            return route;
        }

        // Find an already mounted route with the same navigator name
        const existingRoute = fullState.routes.find((r) => r.name === route.name && r.key !== route.key);

        if (!existingRoute) {
            return route;
        }

        // Avoid duplicate keys in the rendered list.
        if (routesToRender.some((r) => r.key === existingRoute.key)) {
            return route;
        }

        // Transfer animation marker so the entering animation fires on the reused component.
        if (screensWithEnteringAnimation.has(route.key)) {
            screensWithEnteringAnimation.delete(route.key);
            screensWithEnteringAnimation.add(existingRoute.key);
        }

        return {
            ...existingRoute, // Preserve key and internal navigator state
            params: {
                ...route.params, // Apply params from the new navigation action
            },
        };
    });
}

export default reuseNavigatorKey;
