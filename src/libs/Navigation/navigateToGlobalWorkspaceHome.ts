import {getActionFromState, getStateFromPath, NavigationAction, NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import type {Writable} from 'type-fest';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import linkingConfig from './linkingConfig';
import type {NavigationRoot, RootStackParamList, StackNavigationAction} from './types';

type ActionPayloadParams = {
    screen?: string;
    params?: unknown;
    path?: string;
};

// Because we need to change the type to push, we also need to set target for this action to the bottom tab navigator.
function getActionForBottomTabNavigator(action: StackNavigationAction, state: NavigationState<RootStackParamList>): Writable<NavigationAction> | undefined {
    const bottomTabNavigatorRoute = state.routes.at(0);

    if (!bottomTabNavigatorRoute || bottomTabNavigatorRoute.state === undefined || !action || action.type !== CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        return;
    }

    const params = action.payload.params as ActionPayloadParams;

    // if (!payloadParams) {
    //     payloadParams = {policyID};
    // } else if (!('policyID' in payloadParams && !!payloadParams?.policyID)) {
    //     payloadParams = {...payloadParams, policyID};
    // }

    // Check if the current bottom tab is the same as the one we want to navigate to. If it is, we don't need to do anything.
    // const bottomTabCurrentTab = getTopmostBottomTabRoute(state);
    // if (bottomTabCurrentTab?.name === screen && !shouldNavigate) {
    //     return;
    // }

    return {
        type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
        payload: {
            name: SCREENS.HOME,
            params: params.params,
        },
        target: bottomTabNavigatorRoute.state.key,
    };
}

export default function navigateToGlobalWorkspaceHome(navigation: NavigationContainerRef<RootStackParamList> | null) {
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

    const actionForBottomTabNavigator = getActionForBottomTabNavigator(action, rootState);

    if (!actionForBottomTabNavigator) {
        return;
    }

    root.dispatch(actionForBottomTabNavigator);
}
