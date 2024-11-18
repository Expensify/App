import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef, NavigationState, PartialState, StackActionType} from '@react-navigation/native';
import {findFocusedRoute, StackActions} from '@react-navigation/native';
import {getMatchingFullScreenRoute, isFullScreenName} from '@libs/Navigation/linkingConfig/getAdaptedStateFromPath';
import normalizePath from '@libs/Navigation/linkingConfig/normalizePath';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import getStateFromPath from '@navigation/getStateFromPath';
import linkingConfig from '@navigation/linkingConfig';
import type {RootStackParamList, StackNavigationAction} from '@navigation/types';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import areNamesAndParamsEqual from './helpers/areNamesAndParamsEqual';
import convertReportPath from './helpers/convertReportPath';
import createActionWithPolicyID from './helpers/createActionWithPolicyID';
import getMinimalAction from './helpers/getMinimalAction';
import isNavigatingToAttachmentScreen from './helpers/isNavigatingToAttachmentScreen';
import isNavigatingToReportWithSameReportID from './helpers/isNavigatingToReportWithSameReportID';
import shouldCheckFullScreenRouteMatching from './helpers/shouldCheckFullScreenRouteMatching';
import shouldConvertReportPath from './helpers/shouldConvertReportPath';
import type {LinkToOptions} from './types';

const defaultLinkToOptions: LinkToOptions = {
    forceReplace: false,
    reportPathConversionEnabled: true,
};

export default function linkTo(navigation: NavigationContainerRef<RootStackParamList> | null, path: Route, options?: LinkToOptions) {
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    // We know that the options are always defined because we have default options.
    const {forceReplace, reportPathConversionEnabled} = {...defaultLinkToOptions, ...options} as Required<LinkToOptions>;

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
    if (reportPathConversionEnabled && shouldConvertReportPath(currentFocusedRoute, focusedRouteFromPath)) {
        // Convert path to the opposite form and call linkTo again.
        linkTo(navigation, convertReportPath(focusedRouteFromPath), options);
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
                const additionalAction = StackActions.push(matchingFullScreenRoute.name, {screen: matchingFullScreenRoute.state?.routes?.at(-1)?.name});
                navigation.dispatch(additionalAction);
            }
        }
    }

    const {action: minimalAction} = getMinimalAction(action, navigation.getRootState());
    navigation.dispatch(minimalAction);
}
