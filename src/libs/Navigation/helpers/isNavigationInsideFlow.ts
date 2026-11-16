/**
 * Tells whether a navigation that removes the first screen of a flow still keeps the user in the flow, so the "Discard changes?"
 * prompt shouldn't ask.
 */
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/native';

import isNavigationStateWithRoutes from './isNavigationStateWithRoutes';
import {isNamedActionPayload} from './linkTo/getMinimalAction';

type GuardedRoute = {
    name: string;
    params?: unknown;
};

/** The stack the flow's first screen is in */
type GuardedStack = {
    key: string;
    routeNames: string[];
};

function getTransactionIDFromRouteParams(params: unknown): string | undefined {
    if (!isRecord(params)) {
        return undefined;
    }

    if (typeof params.transactionID === 'string') {
        return params.transactionID;
    }

    // In a RESET, the params of a nested screen are under `params.params`, so look there too.
    return getTransactionIDFromRouteParams(params.params);
}

function doesStateContainRoute(state: PartialState<NavigationState>, routeToMatch: GuardedRoute, transactionID: string | undefined): boolean {
    return state.routes.some(
        (route) =>
            (route.name === routeToMatch.name && (transactionID === undefined || getTransactionIDFromRouteParams(route.params) === transactionID)) ||
            (isNavigationStateWithRoutes(route.state) && doesStateContainRoute(route.state, routeToMatch, transactionID)),
    );
}

/**
 * Whether a navigation that removes the flow's first screen keeps the user in the flow, so it shouldn't prompt:
 * - Browser back or forward after a page refresh rebuilds the whole navigation state (RESET) with new keys, so every screen looks
 *   removed, even those that stay. If the new state still has the flow's first screen for the same expense, the user is still in the flow.
 * - `Navigation.goBack(route)` replaces the current screen (REPLACE) when the route it goes back to isn't in the stack yet. Inside the
 *   flow's own stack, the user is still in the flow. For example, the header back on the confirmation of a dropped receipt opens the Scan step.
 */
function isNavigationInsideFlow(action: NavigationAction, route: GuardedRoute, stack: GuardedStack | undefined): boolean {
    if (action.type === CONST.NAVIGATION.ACTION_TYPE.REPLACE) {
        if (action.target) {
            return action.target === stack?.key;
        }
        // Without a target, a REPLACE goes up from the focused screen to the first navigator that has the new screen, which can be
        // the root, as when `Navigation.goBack` goes back to a screen outside the RHP. Only the flow's own stack keeps the user in it.
        return isNamedActionPayload(action.payload) && !!stack?.routeNames.includes(action.payload.name);
    }

    if (action.type !== CONST.NAVIGATION.ACTION_TYPE.RESET || !isNavigationStateWithRoutes(action.payload)) {
        return false;
    }

    return doesStateContainRoute(action.payload, route, getTransactionIDFromRouteParams(route.params));
}

export default isNavigationInsideFlow;
