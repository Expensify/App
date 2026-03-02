import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {screensWithEnteringAnimation} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';

type StateRoutes = StackNavigationState<ParamListBase>['routes'];

/**
 * For each fullscreen navigator in routesToRender, checks if a route with the same name
 * already exists in the full state (with a different key). If so, replaces the new route
 * with the existing one updated with the new params — exactly mirroring what
 * handlePushFullscreenAction did at the router level.
 *
 * This causes React to reuse the already-mounted navigator component (same key),
 * while the new params tell the navigator which screen to show.
 * The real navigation state is untouched.
 */
function reuseNavigatorKey(routesToRender: StateRoutes, fullState: StackNavigationState<ParamListBase>): StateRoutes {
    return routesToRender.map((route) => {
        if (!isFullScreenName(route.name)) {
            return route;
        }

        // Find a route already in the stack with the same navigator name.
        // A different key means it was pushed in a previous navigation action.
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

        // Mirror handlePushFullscreenAction:
        // spread the existing route (preserves key and navigator state) and merge new params on top.
        // The existing key causes React to reuse the mounted component.
        // The merged params carry the new navigation target (screen/params) into the reused component.
        return {
            ...existingRoute,
            params: {...existingRoute.params, ...route.params},
        };
    });
}

export default reuseNavigatorKey;
