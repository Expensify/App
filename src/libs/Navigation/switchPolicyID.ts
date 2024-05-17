import {getActionFromState} from '@react-navigation/core';
import type {NavigationAction, NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import {getPathFromState} from '@react-navigation/native';
import type {Writable} from 'type-fest';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import linkingConfig from './linkingConfig';
import type {NavigationRoot, RootStackParamList, StackNavigationAction, State, SwitchPolicyIDParams} from './types';

type ActionPayloadParams = {
    screen?: string;
    params?: unknown;
    path?: string;
};

type CentralPaneRouteParams = Record<string, string> & {policyID?: string; reportID?: string};

function checkIfActionPayloadNameIsEqual(action: Writable<NavigationAction>, screenName: string) {
    return action?.payload && 'name' in action.payload && action?.payload?.name === screenName;
}

function getActionForBottomTabNavigator(action: StackNavigationAction, state: NavigationState<RootStackParamList>, policyID?: string): Writable<NavigationAction> | undefined {
    const bottomTabNavigatorRoute = state.routes.at(0);

    if (!bottomTabNavigatorRoute || bottomTabNavigatorRoute.state === undefined || !action || action.type !== CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        return;
    }

    const params = action.payload.params as ActionPayloadParams;
    let payloadParams = params?.params as Record<string, string | undefined>;
    let screen = params.screen;

    if (screen === SCREENS.SEARCH.CENTRAL_PANE) {
        screen = SCREENS.SEARCH.BOTTOM_TAB;
    }

    if (!payloadParams) {
        payloadParams = {policyID};
    } else {
        payloadParams.policyID = policyID;
    }

    return {
        type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
        payload: {
            name: screen,
            params: payloadParams,
        },
        target: bottomTabNavigatorRoute.state.key,
    };
}

export default function switchPolicyID(navigation: NavigationContainerRef<RootStackParamList> | null, {policyID, route}: SwitchPolicyIDParams) {
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
    let newPath = route ?? getPathFromState({routes: rootState.routes} as State, linkingConfig.config);

    // Currently, the search page displayed in the bottom tab has the same URL as the page in the central pane, so we need to redirect to the correct search route.
    // Here's the configuration: src/libs/Navigation/AppNavigator/createCustomStackNavigator/index.tsx
    const isOpeningSearchFromBottomTab = newPath.startsWith(CONST.SEARCH_BOTTOM_TAB_URL);
    if (isOpeningSearchFromBottomTab) {
        newPath = ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.ALL);
    }
    const stateFromPath = getStateFromPath(newPath as Route) as PartialState<NavigationState<RootStackParamList>>;
    const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    const actionForBottomTabNavigator = getActionForBottomTabNavigator(action, rootState, policyID);

    if (!actionForBottomTabNavigator) {
        return;
    }

    root.dispatch(actionForBottomTabNavigator);

    // If path is passed to this method, it means that screen is pushed to the Central Pane from another place in code
    if (route) {
        return;
    }

    // The correct route for SearchPage is located in the CentralPane
    const shouldAddToCentralPane = !getIsNarrowLayout() || isOpeningSearchFromBottomTab;

    // If the layout is wide we need to push matching central pane route to the stack.
    if (shouldAddToCentralPane) {
        const topmostCentralPaneRoute = getTopmostCentralPaneRoute(rootState);
        const screen = topmostCentralPaneRoute?.name;
        const params: CentralPaneRouteParams = {...topmostCentralPaneRoute?.params};

        // If the user is on the home page and changes the current workspace, then should be displayed a report from the selected workspace.
        // To achieve that, it's necessary to navigate without the reportID param.
        if (checkIfActionPayloadNameIsEqual(actionForBottomTabNavigator, SCREENS.HOME)) {
            delete params.reportID;
        }

        root.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
            payload: {
                name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
                params: {
                    screen,
                    params,
                },
            },
        });
    } else {
        // If the layout is small we need to pop everything from the central pane so the bottom tab navigator is visible.
        root.dispatch({
            type: 'POP_TO_TOP',
            target: rootState.key,
        });
    }
}
