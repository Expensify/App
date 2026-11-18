/** A Settings navigator can host unrelated editors; being in the same stack does not establish a flow boundary. */
import CONST from '@src/CONST';

import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/native';

import isNavigationStateWithRoutes from './isNavigationStateWithRoutes';
import {isNamedActionPayload} from './linkTo/getMinimalAction';

function doesStateRetainFlow(state: PartialState<NavigationState>, screenNames: readonly string[]): boolean {
    return state.routes.some((route) => screenNames.includes(route.name) || (isNavigationStateWithRoutes(route.state) && doesStateRetainFlow(route.state, screenNames)));
}

function isActionInsideNamedFlow(action: NavigationAction, screenNames: readonly string[], stackKey?: string): boolean {
    if (action.type === CONST.NAVIGATION.ACTION_TYPE.REPLACE) {
        return (!action.target || action.target === stackKey) && isNamedActionPayload(action.payload) && screenNames.includes(action.payload.name);
    }
    return action.type === CONST.NAVIGATION.ACTION_TYPE.RESET && isNavigationStateWithRoutes(action.payload) && doesStateRetainFlow(action.payload, screenNames);
}

export default isActionInsideNamedFlow;
