import {screensWithOnyxTabNavigator} from '@libs/Navigation/linkingConfig/config';
import type {State} from '@libs/Navigation/types';

type RouteFromState = State['routes'][number];

/**
 * Works like React Navigation's {@link findFocusedRoute} but stops recursing when it reaches
 * a screen that hosts an OnyxTabNavigator. Without this guard the lookup would drill into the
 * tab navigator's internal state and return the individual tab name (e.g. "amount", "scan")
 * instead of the parent screen (e.g. "Money_Request_Split_Expense").
 */
function findFocusedRouteWithOnyxTabGuard(state: State): RouteFromState | undefined {
    const route = state.routes[state.index ?? state.routes.length - 1];
    if (route === undefined) {
        return undefined;
    }
    if (screensWithOnyxTabNavigator.has(route.name)) {
        return route;
    }
    if (route.state) {
        return findFocusedRouteWithOnyxTabGuard(route.state as State);
    }
    return route;
}

export default findFocusedRouteWithOnyxTabGuard;
