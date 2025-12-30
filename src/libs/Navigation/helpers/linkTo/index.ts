import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute, StackActions} from '@react-navigation/native';
import {getMatchingFullScreenRoute, isFullScreenName} from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import normalizePath from '@libs/Navigation/helpers/normalizePath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import {shallowCompare} from '@libs/ObjectUtils';
import getMatchingNewRoute from '@navigation/helpers/getMatchingNewRoute';
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

function areNamesAndParamsEqual(currentState: NavigationState<RootNavigatorParamList>, stateFromPath: PartialState<NavigationState<RootNavigatorParamList>>) {
    const currentFocusedRoute = findFocusedRoute(currentState);
    const targetFocusedRoute = findFocusedRoute(stateFromPath);

    const areNamesEqual = currentFocusedRoute?.name === targetFocusedRoute?.name;
    const areParamsEqual = shallowCompare(currentFocusedRoute?.params as Record<string, unknown> | undefined, targetFocusedRoute?.params as Record<string, unknown> | undefined);

    return areNamesEqual && areParamsEqual;
}

function arePathAndBackToEqual(stateFromPath: PartialState<NavigationState<RootNavigatorParamList>>) {
    const focusedRouteFromPath = findFocusedRoute(stateFromPath);
    const params = focusedRouteFromPath?.params ?? {};

    if (!focusedRouteFromPath?.path || !('backTo' in params) || !params.backTo || typeof params.backTo !== 'string') {
        return false;
    }
    let cleanedPath = focusedRouteFromPath.path.replaceAll(/\?.*/g, '');
    let cleanedBackTo = params.backTo.replaceAll(/\?.*/g, '');
    cleanedPath = cleanedPath.endsWith('/') ? cleanedPath.slice(0, -1) : cleanedPath;
    cleanedBackTo = cleanedBackTo.endsWith('/') ? cleanedBackTo.slice(0, -1) : cleanedBackTo;

    return cleanedPath === cleanedBackTo;
}

function shouldCheckFullScreenRouteMatching(action: StackNavigationAction): action is StackNavigationAction & {type: 'PUSH'; payload: {name: typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR}} {
    return action !== undefined && action.type === 'PUSH' && action.payload.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
}

function isNavigatingToAttachmentScreen(focusedRouteName?: string) {
    return focusedRouteName === SCREENS.REPORT_ATTACHMENTS;
}

function isNavigatingToReportWithSameReportID(currentRoute: NavigationPartialRoute, newRoute: NavigationPartialRoute) {
    if (currentRoute.name !== SCREENS.REPORT || newRoute.name !== SCREENS.REPORT) {
        return false;
    }

    const currentParams = currentRoute.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
    const newParams = newRoute?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];

    return currentParams?.reportID === newParams?.reportID;
}

function isRoutePreloaded(currentState: PlatformStackNavigationState<RootNavigatorParamList>, matchingFullScreenRoute: NavigationPartialRoute) {
    const lastRouteInMatchingFullScreen = matchingFullScreenRoute.state?.routes?.at(-1);

    const preloadedRoutes = currentState.preloadedRoutes;

    return preloadedRoutes.some((preloadedRoute) => {
        const isMatchingFullScreenRoute = preloadedRoute.name === matchingFullScreenRoute.name;

        // If the matching fullscreen route does not have a last route, then we only need to compare the fullscreen route name
        if (!lastRouteInMatchingFullScreen?.name) {
            return isMatchingFullScreenRoute;
        }

        // Compare the last route of the preloadedRoute and the last route of the matchingFullScreenRoute to ensure the preloaded route is accepted when matching subroutes as well
        const isMatchingLastRoute = preloadedRoute.params && 'screen' in preloadedRoute.params && preloadedRoute.params.screen === lastRouteInMatchingFullScreen.name;

        return isMatchingFullScreenRoute && isMatchingLastRoute;
    });
}

/**
 * We will check whether we need to navigate with the target route along with the changes of the fullscreen route.
 * When the fullscreen route needs to change, the background of the route will change according to the matchingFullScreenRoute.
 */
function shouldChangeToMatchingFullScreen(
    newFocusedRoute: ReturnType<typeof findFocusedRoute>,
    matchingFullScreenRoute: NavigationPartialRoute,
    lastFullScreenRoute: NavigationPartialRoute,
) {
    if (matchingFullScreenRoute.name !== lastFullScreenRoute.name) {
        return true;
    }

    const lastRouteInLastFullScreenRoute = lastFullScreenRoute?.state?.routes.at(-1);

    // We always want the fullscreen route of SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD to be the SUBSCRIPTION tab of SCREENS.SETTINGS.
    // The add payment card page can be opened via the Global create button from the create expense flow, so even when we are already on SCREENS.SETTINGS, with any tab currently open,
    // the add payment card page can still be opened. Therefore, checking only the fullscreen name above is not sufficient, and the check below using the last route name is necessary.
    return newFocusedRoute?.name === SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD && lastRouteInLastFullScreenRoute?.name !== SCREENS.SETTINGS.SUBSCRIPTION.ROOT;
}

export default function linkTo(navigation: NavigationContainerRef<RootNavigatorParamList> | null, path: Route, options?: LinkToOptions) {
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    // We know that the options are always defined because we have default options.
    const {forceReplace} = {...defaultLinkToOptions, ...options} as Required<LinkToOptions>;

    const normalizedPath = normalizePath(path) as Route;
    const normalizedPathAfterRedirection = (getMatchingNewRoute(normalizedPath) ?? normalizedPath) as Route;

    // This is the state generated with the default getStateFromPath function.
    // It won't include the whole state that will be generated for this path but the focused route will be correct.
    // It is necessary because getActionFromState will generate RESET action for whole state generated with our custom getStateFromPath function.
    const stateFromPath = getStateFromPath(normalizedPathAfterRedirection) as PartialState<NavigationState<RootNavigatorParamList>>;
    const currentState = navigation.getRootState() as PlatformStackNavigationState<RootNavigatorParamList>;

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
    if (areNamesAndParamsEqual(currentState, stateFromPath) || arePathAndBackToEqual(stateFromPath)) {
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

    // If we deep link to a RHP page, we want to make sure we have the correct full screen route under the overlay.
    if (shouldCheckFullScreenRouteMatching(action)) {
        const newFocusedRoute = findFocusedRoute(stateFromPath);
        if (newFocusedRoute) {
            const matchingFullScreenRoute = getMatchingFullScreenRoute(newFocusedRoute);

            const lastFullScreenRoute = currentState.routes.findLast((route) => isFullScreenName(route.name));
            if (matchingFullScreenRoute && lastFullScreenRoute && shouldChangeToMatchingFullScreen(newFocusedRoute, matchingFullScreenRoute, lastFullScreenRoute as NavigationPartialRoute)) {
                if (isRoutePreloaded(currentState, matchingFullScreenRoute)) {
                    navigation.dispatch(StackActions.push(matchingFullScreenRoute.name));
                } else {
                    const lastRouteInMatchingFullScreen = matchingFullScreenRoute.state?.routes?.at(-1);
                    const additionalAction = StackActions.push(matchingFullScreenRoute.name, {
                        screen: lastRouteInMatchingFullScreen?.name,
                        params: lastRouteInMatchingFullScreen?.params,
                    });
                    navigation.dispatch(additionalAction);
                }
            }
        }
    }

    const {action: minimalAction} = getMinimalAction(action, navigation.getRootState());
    navigation.dispatch(minimalAction);
}
