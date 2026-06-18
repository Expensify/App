import type {findFocusedRoute, NavigationState, PartialState} from '@react-navigation/native';
import {screensWithOnyxTabNavigator} from '@libs/Navigation/linkingConfig/config';
import getFocusedRoutePath from './getFocusedRoutePath';

/**
 * Works like React Navigation's {@link findFocusedRoute} but stops recursing when it reaches
 * a screen that hosts an OnyxTabNavigator. Without this guard the lookup would drill into the
 * tab navigator's internal state and return the individual tab name (e.g. "amount", "scan")
 * instead of the parent screen (e.g. "Money_Request_Split_Expense").
 */
function findFocusedRouteWithOnyxTabGuard(state: PartialState<NavigationState>): ReturnType<typeof findFocusedRoute> {
    return getFocusedRoutePath(state, (route) => screensWithOnyxTabNavigator.has(route.name)).at(-1);
}

export default findFocusedRouteWithOnyxTabGuard;
