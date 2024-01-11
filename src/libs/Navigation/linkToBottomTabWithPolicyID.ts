import {getActionFromState} from '@react-navigation/core';
import type {NavigationAction, NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import type {Writable} from 'type-fest';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import getMatchingCentralPaneRouteForState from './getMatchingCentralPaneRouteForState';
import getStateFromPath from './getStateFromPath';
import linkingConfig from './linkingConfig';
import type {NavigationRoot, RootStackParamList, StackNavigationAction} from './types';

type ActionPayloadParams = {
    screen?: string;
    params?: unknown;
    path?: string;
};

function getActionForBottomTabNavigator(action: StackNavigationAction, state: NavigationState<RootStackParamList>, policyID?: string): Writable<NavigationAction> | undefined {
    const bottomTabNavigatorRoute = state.routes.at(0);

    if (!bottomTabNavigatorRoute || bottomTabNavigatorRoute.state === undefined || !action || action.type !== CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        return;
    }

    const params = action.payload.params as ActionPayloadParams;
    const screen = params.screen;

    params.params = {...params.params, policyID};

    return {
        type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
        payload: {
            name: screen,
            params: params.params,
        },
        target: bottomTabNavigatorRoute.state.key,
    };
}

export default function linkToBottomTabWithPolicyID(navigation: NavigationContainerRef<RootStackParamList> | null, path: Route, policyID?: string) {
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    let root: NavigationRoot = navigation;
    let current: NavigationRoot | undefined;

    // Traverse up to get the root navigation
    // eslint-disable-next-line no-cond-assign
    while ((current = root.getParent())) {
        root = current;
    }

    const rootState = navigation.getRootState() as NavigationState<RootStackParamList>;
    const stateFromPath = getStateFromPath(path) as PartialState<NavigationState<RootStackParamList>>;
    const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    const actionForBottomTabNavigator = getActionForBottomTabNavigator(action, rootState, policyID);

    if (!actionForBottomTabNavigator) {
        throw new Error('Could not get action for bottom tab navigator');
    }

    root.dispatch(actionForBottomTabNavigator);
    // If the layout is wide we need to push matching central pane route to the stack.
    if (!getIsSmallScreenWidth()) {
        // stateFromPath should always include bottom tab navigator state, so getMatchingCentralPaneRouteForState will be always defined.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const matchingCentralPaneRoute = getMatchingCentralPaneRouteForState(stateFromPath)!;
        root.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
            payload: {
                name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
                params: {
                    screen: matchingCentralPaneRoute.name,
                    params: matchingCentralPaneRoute.params,
                },
            },
        });
    }
}
