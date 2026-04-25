import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import {CommonActions, findFocusedRoute} from '@react-navigation/native';
import ROOT_TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/ROOT_TAB_SCREENS';
import findMatchingDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/findMatchingDynamicSuffix';
import {getMatchingFullScreenRoute, isFullScreenName} from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import normalizePath from '@libs/Navigation/helpers/normalizePath';
import {getTabState} from '@libs/Navigation/helpers/tabNavigatorUtils';
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
import type {ActionPayloadParams, LinkToOptions} from './types';

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
    return action?.type === 'PUSH' && action.payload.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
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

/**
 * Returns true when both current and target states are within TabNavigator (tab switching).
 * In this case we must keep NAVIGATE (not PUSH) because tab navigators use jumpTo/navigate.
 */
function isSwitchingTabsWithinTabNavigator(currentState: NavigationState<RootNavigatorParamList>, stateFromPath: PartialState<NavigationState<RootNavigatorParamList>>) {
    const lastFullScreenRoute = currentState.routes.findLast((route) => isFullScreenName(route.name));
    const targetFullScreenRoute = stateFromPath.routes?.findLast((route) => isFullScreenName(route.name));

    return lastFullScreenRoute?.name === NAVIGATORS.TAB_NAVIGATOR && targetFullScreenRoute?.name === NAVIGATORS.TAB_NAVIGATOR;
}

/**
 * For TAB_NAVIGATOR routes, returns the focused (active) tab screen name.
 * For other routes, returns the last nested route name (original behavior).
 */
function getActiveScreenInRoute(route: NavigationPartialRoute): string | undefined {
    const tabState = getTabState(route);
    if (tabState) {
        const index = tabState.index ?? 0;
        return tabState.routes?.at(index)?.name;
    }
    return route.state?.routes?.at(-1)?.name;
}

function shouldChangeToMatchingFullScreen(
    newFocusedRoute: ReturnType<typeof findFocusedRoute>,
    matchingFullScreenRoute: NavigationPartialRoute,
    lastFullScreenRoute: NavigationPartialRoute,
) {
    if (matchingFullScreenRoute.name !== lastFullScreenRoute.name) {
        return true;
    }

    // When both are TAB_NAVIGATOR, compare the active tab inside rather than the last declared route.
    const lastActiveScreen = getActiveScreenInRoute(lastFullScreenRoute);
    const matchingActiveScreen = getActiveScreenInRoute(matchingFullScreenRoute);
    if (matchingFullScreenRoute.name === NAVIGATORS.TAB_NAVIGATOR && lastActiveScreen !== matchingActiveScreen) {
        return true;
    }

    // We always want the fullscreen route of SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD to be the SUBSCRIPTION tab of SCREENS.SETTINGS.
    // The add payment card page can be opened via the Global create button from the create expense flow, so even when we are already on SCREENS.SETTINGS, with any tab currently open,
    // the add payment card page can still be opened. Therefore, checking only the fullscreen name above is not sufficient, and the check below using the last route name is necessary.
    return newFocusedRoute?.name === SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD && lastActiveScreen !== SCREENS.SETTINGS.SUBSCRIPTION.ROOT;
}

export {isSwitchingTabsWithinTabNavigator, getActiveScreenInRoute, shouldChangeToMatchingFullScreen};

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
        !isNavigatingToReportWithSameReportID(currentFocusedRoute, focusedRouteFromPath) &&
        !isSwitchingTabsWithinTabNavigator(currentState, stateFromPath) &&
        !findMatchingDynamicSuffix(normalizedPath)
    ) {
        // We want to PUSH by default to add entries to the browser history.
        action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    }

    // When something other than TAB_NAVIGATOR is on top of the stack and we're navigating
    // to TAB_NAVIGATOR, PUSH a new instance above (e.g., above RHP).
    const currentTopRoute = currentState.routes[currentState.index];
    const typedPayload = (action as {payload: {name?: string; params?: ActionPayloadParams}}).payload;
    if (currentTopRoute?.name !== NAVIGATORS.TAB_NAVIGATOR && typedPayload.name === NAVIGATORS.TAB_NAVIGATOR) {
        (action as {type: string}).type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    }

    // Cross-tab navigation to a deep leaf (e.g. Settings → Concierge): PUSH a new TAB_NAVIGATOR so
    // swipe-back reveals the original tab. Skipped when the target is a tab root (plain tab switch).
    const targetTopRoute = stateFromPath.routes?.at(-1) as NavigationPartialRoute | undefined;
    const currentActiveScreen = currentTopRoute?.name === NAVIGATORS.TAB_NAVIGATOR ? getActiveScreenInRoute(currentTopRoute as NavigationPartialRoute) : undefined;
    const targetActiveScreen = targetTopRoute?.name === NAVIGATORS.TAB_NAVIGATOR ? getActiveScreenInRoute(targetTopRoute) : undefined;
    const isTargetAtTabRoot = ROOT_TAB_SCREENS.has(focusedRouteFromPath?.name ?? '');
    if (currentActiveScreen && targetActiveScreen && currentActiveScreen !== targetActiveScreen && !isTargetAtTabRoot) {
        (action as {type: string}).type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
        navigation.dispatch(action);
        return;
    }

    // If we deep link to a RHP page, we want to make sure we have the correct full screen route under the overlay.
    if (shouldCheckFullScreenRouteMatching(action)) {
        const newFocusedRoute = findFocusedRoute(stateFromPath);
        if (newFocusedRoute) {
            // getMatchingFullScreenRoute returns a TAB_NAVIGATOR wrapper; unwrap it to get the
            // actual inner tab route (e.g. REPORTS_SPLIT_NAVIGATOR) at the correct index.
            const matchingTabNavigatorRoute = getMatchingFullScreenRoute(newFocusedRoute);
            const matchingTabState = matchingTabNavigatorRoute ? getTabState(matchingTabNavigatorRoute) : undefined;
            const matchingFullScreenRoute = matchingTabState ? (matchingTabState.routes?.at(matchingTabState.index ?? 0) as NavigationPartialRoute | undefined) : undefined;
            // Full-screen routes only exist inside TAB_NAVIGATOR, so look at the active tab directly.
            const tabRoute = currentState.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
            const tabState = tabRoute ? getTabState(tabRoute as NavigationPartialRoute) : undefined;
            const lastFullScreenRoute = tabState?.routes?.at(tabState.index ?? 0) as NavigationPartialRoute | undefined;
            if (matchingFullScreenRoute && lastFullScreenRoute && shouldChangeToMatchingFullScreen(newFocusedRoute, matchingFullScreenRoute, lastFullScreenRoute)) {
                // Navigate within the existing TAB_NAVIGATOR (tab switch) rather than pushing a new one.
                const lastRouteInMatchingFullScreen = matchingFullScreenRoute.state?.routes?.at(-1);
                const additionalAction = CommonActions.navigate({
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    params: {
                        screen: matchingFullScreenRoute.name,
                        params: lastRouteInMatchingFullScreen ? {screen: lastRouteInMatchingFullScreen.name, params: lastRouteInMatchingFullScreen.params} : matchingFullScreenRoute.params,
                    },
                });
                navigation.dispatch(additionalAction);
            }
        }
    }

    const {action: minimalAction} = getMinimalAction(action, navigation.getRootState());
    if (
        action.type === CONST.NAVIGATION.ACTION_TYPE.NAVIGATE &&
        action.payload.name === NAVIGATORS.TAB_NAVIGATOR &&
        !isFullScreenName((minimalAction.payload as {name?: string} | undefined)?.name)
    ) {
        minimalAction.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    }
    navigation.dispatch(minimalAction);
}
