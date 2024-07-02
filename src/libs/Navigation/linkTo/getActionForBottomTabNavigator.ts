import type {NavigationAction, NavigationState} from '@react-navigation/native';
import type {Writable} from 'type-fest';
import type {RootStackParamList, StackNavigationAction} from '@libs/Navigation/types';
import getTopmostBottomTabRoute from '@navigation/getTopmostBottomTabRoute';
import CONST from '@src/CONST';
import type {ActionPayloadParams} from './types';

// Because we need to change the type to push, we also need to set target for this action to the bottom tab navigator.
function getActionForBottomTabNavigator(
    action: StackNavigationAction,
    state: NavigationState<RootStackParamList>,
    policyID?: string,
    shouldNavigate?: boolean,
): Writable<NavigationAction> | undefined {
    const bottomTabNavigatorRoute = state.routes.at(0);
    if (!bottomTabNavigatorRoute || bottomTabNavigatorRoute.state === undefined || !action || action.type !== CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        return;
    }

    const params = action.payload.params as ActionPayloadParams;
    let payloadParams = params.params as Record<string, string | undefined>;
    const screen = params.screen;

    if (policyID && !payloadParams?.policyID) {
        payloadParams = {...payloadParams, policyID};
    } else if (!policyID) {
        delete payloadParams?.policyID;
    }

    // Check if the current bottom tab is the same as the one we want to navigate to. If it is, we don't need to do anything.
    const bottomTabCurrentTab = getTopmostBottomTabRoute(state);
    const bottomTabParams = bottomTabCurrentTab?.params as Record<string, string | undefined>;

    // Verify if the policyID is different than the one we are currently on. If it is, we need to navigate to the new policyID.
    const isNewPolicy = bottomTabParams?.policyID !== payloadParams?.policyID;
    if (bottomTabCurrentTab?.name === screen && !shouldNavigate && !isNewPolicy) {
        return;
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

export default getActionForBottomTabNavigator;
