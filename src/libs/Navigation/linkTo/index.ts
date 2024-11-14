import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef, NavigationState, PartialState, StackActionType} from '@react-navigation/native';
import {findFocusedRoute, StackActions} from '@react-navigation/native';
import {getMatchingFullScreenRoute, isFullScreenName} from '@libs/Navigation/linkingConfig/getAdaptedStateFromPath';
import normalizePath from '@libs/Navigation/linkingConfig/normalizePath';
import {shallowCompare} from '@libs/ObjectUtils';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import getStateFromPath from '@navigation/getStateFromPath';
import linkingConfig from '@navigation/linkingConfig';
import type {NavigationPartialRoute, ReportsSplitNavigatorParamList, RootStackParamList, SearchReportParamList, StackNavigationAction} from '@navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
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

function areNamesAndParamsEqual(currentState: NavigationState<RootStackParamList>, stateFromPath: PartialState<NavigationState<RootStackParamList>>) {
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

    return currentParams.reportID === newParams.reportID;
}

// Determine if we should convert the report route from fullscreen to rhp version or the other way around.
// It's necessary to stay in RHP if we are in RHP report or in fullscreen if we are in fullscreen report.
// eslint-disable-next-line rulesdir/no-inline-named-export
export function shouldConvertReportPath(currentFocusedRoute: NavigationPartialRoute, focusedRouteFromPath: NavigationPartialRoute) {
    // @TODO: Navigating from search central pane could be handled with explicit convert: false option. We would need to add it as option to linkTo.
    if (focusedRouteFromPath.name === SCREENS.REPORT && (currentFocusedRoute.name === SCREENS.SEARCH.REPORT_RHP || currentFocusedRoute.name === SCREENS.SEARCH.CENTRAL_PANE)) {
        return true;
    }

    if (focusedRouteFromPath.name === SCREENS.SEARCH.REPORT_RHP && currentFocusedRoute.name === SCREENS.REPORT) {
        return true;
    }
    return false;
}

// eslint-disable-next-line rulesdir/no-inline-named-export
export function convertReportPath(focusedRouteFromPath: NavigationPartialRoute) {
    const params = focusedRouteFromPath.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT] | SearchReportParamList[typeof SCREENS.SEARCH.REPORT_RHP];
    if (focusedRouteFromPath.name === SCREENS.REPORT) {
        return ROUTES.SEARCH_REPORT.getRoute({reportID: params.reportID, reportActionID: params.reportActionID});
    }

    return ROUTES.REPORT_WITH_ID.getRoute(params.reportID, params.reportActionID);
}

export default function linkTo(navigation: NavigationContainerRef<RootStackParamList> | null, path: Route, type?: string) {
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    const normalizedPath = normalizePath(path);
    const extractedPolicyID = extractPolicyIDFromPath(normalizedPath);
    const pathWithoutPolicyID = getPathWithoutPolicyID(normalizedPath) as Route;

    // This is the state generated with the default getStateFromPath function.
    // It won't include the whole state that will be generated for this path but the focused route will be correct.
    // It is necessary because getActionFromState will generate RESET action for whole state generated with our custom getStateFromPath function.
    const stateFromPath = getStateFromPath(pathWithoutPolicyID) as PartialState<NavigationState<RootStackParamList>>;
    const currentState = navigation.getRootState() as NavigationState<RootStackParamList>;

    const focusedRouteFromPath = findFocusedRoute(stateFromPath);
    const currentFocusedRoute = findFocusedRoute(currentState);

    // For type safety. It shouldn't ever happen.
    if (!focusedRouteFromPath || !currentFocusedRoute) {
        return;
    }

    // Check if this is a report route and it should be converted to the other form (fullscreen or rhp).
    if (shouldConvertReportPath(currentFocusedRoute, focusedRouteFromPath)) {
        // Convert path to the opposite form and call linkTo again.
        linkTo(navigation, convertReportPath(focusedRouteFromPath), type);
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

    if (type === CONST.NAVIGATION.ACTION_TYPE.REPLACE) {
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
                const additionalAction = StackActions.push(matchingFullScreenRoute.name, {screen: matchingFullScreenRoute.state?.routes?.at(-1)?.name});
                navigation.dispatch(additionalAction);
            }
        }
    }

    const {action: minimalAction} = getMinimalAction(action, navigation.getRootState());
    navigation.dispatch(minimalAction);
}
