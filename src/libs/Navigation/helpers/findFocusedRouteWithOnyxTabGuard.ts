import type {findFocusedRoute, NavigationState, PartialState} from '@react-navigation/native';
import {screensWithOnyxTabNavigator} from '@libs/Navigation/linkingConfig/config';

/**
 * Works like React Navigation's {@link findFocusedRoute} but stops recursing when it reaches
 * a screen that hosts an OnyxTabNavigator. Without this guard the lookup would drill into the
 * tab navigator's internal state and return the individual tab name (e.g. "amount", "scan")
 * instead of the parent screen (e.g. "Money_Request_Split_Expense").
 */
function findFocusedRouteWithOnyxTabGuard(state: PartialState<NavigationState>): ReturnType<typeof findFocusedRoute> {
    const route = state.routes[state.index ?? state.routes.length - 1];
    if (route === undefined) {
        return undefined;
    }
    if (screensWithOnyxTabNavigator.has(route.name)) {
        return route as ReturnType<typeof findFocusedRoute>;
    }
    if (route.state) {
        return findFocusedRouteWithOnyxTabGuard(route.state);
    }
    return route as ReturnType<typeof findFocusedRoute>;
}

export default findFocusedRouteWithOnyxTabGuard;
