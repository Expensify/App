import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef, NavigationState, PartialState, StackActionType} from '@react-navigation/native';
import {findFocusedRoute, StackActions} from '@react-navigation/native';
import {getMatchingFullScreenRoute, isFullScreenName} from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import normalizePath from '@libs/Navigation/helpers/normalizePath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {shallowCompare} from '@libs/ObjectUtils';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import type {NavigationPartialRoute, ReportsSplitNavigatorParamList, RootNavigatorParamList, StackNavigationAction} from '@navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getMinimalAction from './getMinimalAction';
import type {LinkToOptions} from './types';

const defaultLinkToOptions: LinkToOptions = {
    forceReplace: false,
};

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

function areNamesAndParamsEqual(currentState: NavigationState<RootNavigatorParamList>, stateFromPath: PartialState<NavigationState<RootNavigatorParamList>>) {
    const currentFocusedRoute = findFocusedRoute(currentState);
    const targetFocusedRoute = findFocusedRoute(stateFromPath);

    const areNamesEqual = currentFocusedRoute?.name === targetFocusedRoute?.name;
    const areParamsEqual = shallowCompare(currentFocusedRoute?.params as Record<string, unknown> | undefined, targetFocusedRoute?.params as Record<string, unknown> | undefined);

    return areNamesEqual && areParamsEqual;
}

function shouldCheckFullScreenRouteMatching(action: StackNavigationAction): action is StackNavigationAction & {type: 'PUSH'; payload: {name: typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR}} {
    return action !== undefined && action.type === 'PUSH' && action.payload.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
}

function isNavigatingToAttachmentScreen(focusedRouteName?: string) {
    return focusedRouteName === SCREENS.ATTACHMENTS;
}

function isNavigatingToReportWithSameReportID(currentRoute: NavigationPartialRoute, newRoute: NavigationPartialRoute) {
    if (currentRoute.name !== SCREENS.REPORT || newRoute.name !== SCREENS.REPORT) {
        return false;
    }

    const currentParams = currentRoute.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
    const newParams = newRoute?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];

    return currentParams?.reportID === newParams?.reportID;
}

export default function linkTo(navigation: NavigationContainerRef<RootNavigatorParamList> | null, path: Route, options?: LinkToOptions) {
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    // We know that the options are always defined because we have default options.
    const {forceReplace} = {...defaultLinkToOptions, ...options} as Required<LinkToOptions>;

    const normalizedPath = normalizePath(path);
    const extractedPolicyID = extractPolicyIDFromPath(normalizedPath);
    const pathWithoutPolicyID = getPathWithoutPolicyID(normalizedPath) as Route;

    // This is the state generated with the default getStateFromPath function.
    // It won't include the whole state that will be generated for this path but the focused route will be correct.
    // It is necessary because getActionFromState will generate RESET action for whole state generated with our custom getStateFromPath function.
    const stateFromPath = getStateFromPath(pathWithoutPolicyID) as PartialState<NavigationState<RootNavigatorParamList>>;
    const currentState = navigation.getRootState() as NavigationState<RootNavigatorParamList>;

    const focusedRouteFromPath = findFocusedRoute(stateFromPath);
    const currentFocusedRoute = findFocusedRoute(currentState);

    // For type safety. It shouldn't ever happen.
    if (!focusedRouteFromPath || !currentFocusedRoute) {
        return;
    }

    const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    // If there is no action, just reset the whole state.
    if (!action) {
        navigation.resetRoot(stateFromPath);
        return;
    }

    // We don't want to dispatch action to push/replace with exactly the same route that is already focused.
    if (areNamesAndParamsEqual(currentState, stateFromPath)) {
        return;
    }

    if (forceReplace) {
        action.type = CONST.NAVIGATION.ACTION_TYPE.REPLACE;
    }

    // Attachment screen - This is a special case. We want to navigate to it instead of push. If there is no screen on the stack, it will be pushed.
    // If not, it will be replaced. This way, navigating between one attachment screen and another won't be added to the browser history.
    // Report screen - Also a special case. If we are navigating to the report with same reportID we want to replace it (navigate will do that).
    // This covers the case when we open a specific message in report (reportActionID).
    else if (
        action.type === CONST.NAVIGATION.ACTION_TYPE.NAVIGATE &&
        !isNavigatingToAttachmentScreen(focusedRouteFromPath?.name) &&
        !isNavigatingToReportWithSameReportID(currentFocusedRoute, focusedRouteFromPath)
    ) {
        // We want to PUSH by default to add entries to the browser history.
        action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    }

    // Handle deep links including policyID as /w/:policyID.
    if (extractedPolicyID) {
        const actionWithPolicyID = createActionWithPolicyID(action as StackActionType, extractedPolicyID);
        if (!actionWithPolicyID) {
            return;
        }

        navigation.dispatch(actionWithPolicyID);
        return;
    }

    // If we deep link to a RHP page, we want to make sure we have the correct full screen route under the overlay.
    if (shouldCheckFullScreenRouteMatching(action)) {
        const newFocusedRoute = findFocusedRoute(stateFromPath);
        if (newFocusedRoute) {
            const matchingFullScreenRoute = getMatchingFullScreenRoute(newFocusedRoute);

            const lastFullScreenRoute = currentState.routes.findLast((route) => isFullScreenName(route.name));
            if (matchingFullScreenRoute && lastFullScreenRoute && matchingFullScreenRoute.name !== lastFullScreenRoute.name) {
                const lastRouteInMatchingFullScreen = matchingFullScreenRoute.state?.routes?.at(-1);
                const additionalAction = StackActions.push(matchingFullScreenRoute.name, {
                    screen: lastRouteInMatchingFullScreen?.name,
                    params: lastRouteInMatchingFullScreen?.params,
                });
                navigation.dispatch(additionalAction);
            }
        }
    }

    const {action: minimalAction} = getMinimalAction(action, navigation.getRootState());
    navigation.dispatch(minimalAction);
}
