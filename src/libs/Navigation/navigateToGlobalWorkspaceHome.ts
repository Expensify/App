import {getActionFromState, getStateFromPath, NavigationAction, NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import type {Writable} from 'type-fest';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';
import linkingConfig from './linkingConfig';
import type {NavigationRoot, RootStackParamList, StackNavigationAction} from './types';

type ActionPayloadParams = {
    screen?: string;
    params?: unknown;
    path?: string;
};

// Because we need to change the type to push, we also need to set target for this action to the bottom tab navigator.
function getActionForBottomTabNavigator(action: StackNavigationAction, state: NavigationState<RootStackParamList>, policyID?: string): Writable<NavigationAction> | undefined {
    const bottomTabNavigatorRoute = state.routes.at(0);

    if (!bottomTabNavigatorRoute || bottomTabNavigatorRoute.state === undefined || !action || action.type !== CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        return;
    }

    const params = action.payload.params as ActionPayloadParams;
    let payloadParams = params.params as Record<string, string | undefined>;

    if (!payloadParams) {
        payloadParams = {policyID};
    } else if (!('policyID' in payloadParams && !!payloadParams?.policyID)) {
        payloadParams = {...payloadParams, policyID};
    }

    // const bottomTabCurrentTab = getTopmostBottomTabRoute(state);
    // console.log(bottomTabCurrentTab, payloadParams);
    // // if (bottomTabCurrentTab?.name === screen) {
    // //     return;
    // // }

    return {
        type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
        payload: {
            name: SCREENS.HOME,
            params: payloadParams,
        },
        target: bottomTabNavigatorRoute.state.key,
    };
}

export default function navigateToGlobalWorkspaceHome(navigation: NavigationContainerRef<RootStackParamList> | null, policyID?: string) {
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
    const stateFromPath = getStateFromPath('home') as PartialState<NavigationState<RootStackParamList>>;
    const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    const actionForBottomTabNavigator = getActionForBottomTabNavigator(action, rootState, policyID);

    if (!actionForBottomTabNavigator) {
        return;
    }

    root.dispatch(actionForBottomTabNavigator);
}
