import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef, NavigationState, PartialState, StackActionType} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {shallowCompare} from '@libs/ObjectUtils';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import getStateFromPath from '@navigation/getStateFromPath';
import linkingConfig from '@navigation/linkingConfig';
import type {RootStackParamList, StackNavigationAction} from '@navigation/types';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import getMinimalAction from './getMinimalAction';

function createActionWithPolicyID(action: StackActionType, policyID: string): StackActionType | undefined {
    if (action.type !== 'PUSH' && action.type !== 'REPLACE') {
        return;
    }

    return {
        ...action,
        payload: {
            ...action.payload,
            params: {
                ...action.payload.params,
                policyID,
            },
        },
    };
}

function shouldDispatchAction(currentState: NavigationState<RootStackParamList>, stateFromPath: PartialState<NavigationState<RootStackParamList>>) {
    const currentFocusedRoute = findFocusedRoute(currentState);
    const targetFocusedRoute = findFocusedRoute(stateFromPath);

    const areNamesEqual = currentFocusedRoute?.name === targetFocusedRoute?.name;
    const areParamsEqual = shallowCompare(currentFocusedRoute?.params as Record<string, unknown> | undefined, targetFocusedRoute?.params as Record<string, unknown> | undefined);

    if (areNamesEqual && areParamsEqual) {
        return false;
    }

    return true;
}

export default function linkTo(navigation: NavigationContainerRef<RootStackParamList> | null, path: Route, type?: string) {
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    const extractedPolicyID = extractPolicyIDFromPath(`/${path}`);
    const pathWithoutPolicyID = getPathWithoutPolicyID(`/${path}`) as Route;

    // This is the state generated with the default getStateFromPath function.
    // It won't include the whole state that will be generated for this path but the focused route will be correct.
    // It is necessary because getActionFromState will generate RESET action for whole state generated with our custom getStateFromPath function.
    const stateFromPath = getStateFromPath(pathWithoutPolicyID) as PartialState<NavigationState<RootStackParamList>>;
    const currentState = navigation.getRootState() as NavigationState<RootStackParamList>;
    const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    // We don't want to dispatch action to push/replace with exactly the same route that is already focused.
    if (!shouldDispatchAction(currentState, stateFromPath)) {
        return;
    }

    // If there is no action, just reset the whole state.
    if (!action) {
        navigation.resetRoot(stateFromPath);
        return;
    }

    if (type === CONST.NAVIGATION.ACTION_TYPE.REPLACE) {
        action.type = CONST.NAVIGATION.ACTION_TYPE.REPLACE;
    } else if (action.type === CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        // We want to PUSH by default to add entries to the browser history.
        action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    }

    if (extractedPolicyID) {
        const actionWithPolicyID = createActionWithPolicyID(action as StackActionType, extractedPolicyID);
        if (!actionWithPolicyID) {
            return;
        }

        navigation.dispatch(actionWithPolicyID);
        return;
    }

    const {action: minimalAction} = getMinimalAction(action, navigation.getRootState());
    navigation.dispatch(minimalAction);
}
