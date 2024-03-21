import {getActionFromState} from '@react-navigation/core';
import type {NavigationAction, NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import {getPathFromState} from '@react-navigation/native';
import type {ValueOf, Writable} from 'type-fest';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
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

    // Case when the user is on the AllSettingsScreen and selects the specific workspace. The user is redirected then to the specific workspace settings.
    if (screen === SCREENS.ALL_SETTINGS && policyID) {
        screen = SCREENS.WORKSPACE.INITIAL;
    }

    // Alternative case when the user is on the specific workspace settings screen and selects "All" workspace.
    else if (!policyID && screen === SCREENS.WORKSPACE.INITIAL) {
        screen = SCREENS.ALL_SETTINGS;
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
    const newPath = route ?? getPathFromState({routes: rootState.routes} as State, linkingConfig.config);
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

    // If the layout is wide we need to push matching central pane route to the stack.
    if (!getIsNarrowLayout()) {
        // Case when the user selects "All" workspace from the specific workspace settings
        if (checkIfActionPayloadNameIsEqual(actionForBottomTabNavigator, SCREENS.ALL_SETTINGS) && !policyID) {
            root.dispatch({
                type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
                payload: {
                    name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
                    params: {
                        screen: SCREENS.SETTINGS.WORKSPACES,
                        params: undefined,
                    },
                },
            });
        } else {
            const topmostCentralPaneRoute = getTopmostCentralPaneRoute(rootState);
            const screen = topmostCentralPaneRoute?.name;
            const params: CentralPaneRouteParams = {...topmostCentralPaneRoute?.params};
            const isWorkspaceScreen = screen && Object.values(SCREENS.WORKSPACE).includes(screen as ValueOf<typeof SCREENS.WORKSPACE>);

            // Only workspace settings screens have to store the policyID in the params.
            // In other case, the policyID is read from the BottomTab params.
            if (!isWorkspaceScreen) {
                delete params.policyID;
            } else {
                params.policyID = policyID;
            }

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
        }
    } else {
        // If the layout is small we need to pop everything from the central pane so the bottom tab navigator is visible.
        root.dispatch({
            type: 'POP_TO_TOP',
            target: rootState.key,
        });
    }
}
