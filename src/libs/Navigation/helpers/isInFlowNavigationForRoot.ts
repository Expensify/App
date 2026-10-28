import {isRecord} from '@libs/ObjectUtils';

import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/native';

type RouteToMatch = {
    name: string;
    params?: unknown;
};

function isNavigationStateWithRoutes(state: unknown): state is PartialState<NavigationState> {
    return isRecord(state) && Array.isArray(state.routes);
}

function getTransactionIDFromRouteParams(params: unknown): string | undefined {
    if (!isRecord(params)) {
        return undefined;
    }

    if (typeof params.transactionID === 'string') {
        return params.transactionID;
    }

    // `getActionFromState()` nests a child screen's route params under `params.params` in a RESET payload.
    return getTransactionIDFromRouteParams(params.params);
}

function stateContainsRoute(state: PartialState<NavigationState>, routeToMatch: RouteToMatch, transactionID: string | undefined): boolean {
    return state.routes.some((route) => {
        if (route.name === routeToMatch.name && (transactionID === undefined || getTransactionIDFromRouteParams(route.params) === transactionID)) {
            return true;
        }

        return isNavigationStateWithRoutes(route.state) && stateContainsRoute(route.state, routeToMatch, transactionID);
    });
}

/**
 * Whether a navigation that removes the root screen of a flow still keeps the user in that flow, so a flow-root discard guard must let it through.
 * - Browser back/forward after a refresh restores the state with a RESET whose regenerated keys make every route look removed, even when the
 *   restored state still holds the flow root.
 * - `Navigation.goBack(route)` falls back to a REPLACE inside the flow's own stack when the target route isn't in it yet.
 */
function isInFlowNavigationForRoot(action: NavigationAction, route: RouteToMatch, ownStackKey: string | undefined): boolean {
    if (action.type === 'REPLACE') {
        return !action.target || action.target === ownStackKey;
    }

    if (action.type !== 'RESET' || !isNavigationStateWithRoutes(action.payload)) {
        return false;
    }

    return stateContainsRoute(action.payload, route, getTransactionIDFromRouteParams(route.params));
}

export default isInFlowNavigationForRoot;
