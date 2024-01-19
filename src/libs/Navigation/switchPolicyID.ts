import {getActionFromState} from '@react-navigation/core';
import type {NavigationAction, NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import {getPathFromState} from '@react-navigation/native';
import type {Writable} from 'type-fest';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import linkingConfig from './linkingConfig';
import Navigation from './Navigation';
import type {NavigationRoot, RootStackParamList, StackNavigationAction, State} from './types';

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
    let payloadParams = params?.params as Record<string, string | undefined>;
    let screen = params.screen;

    if (screen === SCREENS.ALL_SETTINGS && policyID) {
        screen = SCREENS.WORKSPACE.INITIAL;
    } else if (!policyID && screen === SCREENS.WORKSPACE.INITIAL) {
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

export default function switchPolicyID(navigation: NavigationContainerRef<RootStackParamList> | null, policyID: string) {
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

    Navigation.goBack();

    const rootState = navigation.getRootState() as NavigationState<RootStackParamList>;
    const newPath = getPathFromState({routes: rootState.routes} as State, linkingConfig.config);
    const stateFromPath = getStateFromPath(newPath as Route) as PartialState<NavigationState<RootStackParamList>>;
    const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    const actionForBottomTabNavigator = getActionForBottomTabNavigator(action, rootState, policyID);

    if (!actionForBottomTabNavigator) {
        return;
    }

    root.dispatch(actionForBottomTabNavigator);
    // If the layout is wide we need to push matching central pane route to the stack.
    if (!getIsSmallScreenWidth()) {
        if ((actionForBottomTabNavigator?.payload?.name === SCREENS.WORKSPACE.INITIAL && policyID) || actionForBottomTabNavigator?.payload?.name === SCREENS.HOME) {
            const topmostCentralPaneRoute = getTopmostCentralPaneRoute(rootState);
            let screen = topmostCentralPaneRoute?.name;
            let params = {...topmostCentralPaneRoute?.params};

            if (!screen?.startsWith('Workspace_')) {
                delete params.policyID;
            } else {
                params.policyID = policyID;
            }

            if (actionForBottomTabNavigator?.payload?.name === SCREENS.HOME) {
                delete params.reportID;
            }
            if (topmostCentralPaneRoute?.name === 'Settings_Workspaces' && policyID) {
                screen = 'Workspace_Overview';
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
        }
    } else {
        // // If the layout is small we need to pop everything from the central pane so the bottom tab navigator is visible.
        root.dispatch({
            type: 'POP_TO_TOP',
            target: rootState.key,
        });
    }
}
