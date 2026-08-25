/**
 * Navigates between Workspace settings while keeping the wide-layout sidebar policy in sync.
 */
import {isWorkspaceNavigatorRouteName} from '@libs/Navigation/helpers/isNavigatorName';
import {getTabState} from '@libs/Navigation/helpers/tabNavigatorUtils';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const WORKSPACE_ROUTE_PATTERN = /^\/?workspaces\/[^/]+(\/.*)?$/;

function getActiveWorkspaceSidebarRoute(): {sidebarRouteKey: string; splitStateKey?: string; policyID?: string} | undefined {
    if (!navigationRef.isReady()) {
        return undefined;
    }

    const routes = navigationRef.getRootState().routes;
    const tabNavigatorRoute = routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const workspaceNavigatorRoute = getTabState(tabNavigatorRoute)?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
    const workspaceSplitRoute =
        workspaceNavigatorRoute?.state?.routes.findLast((route) => isWorkspaceNavigatorRouteName(route.name)) ?? routes.findLast((route) => isWorkspaceNavigatorRouteName(route.name));
    if (workspaceSplitRoute?.name !== NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
        return undefined;
    }

    const sidebarRoute = workspaceSplitRoute.state?.routes.find((route) => route.name === SCREENS.WORKSPACE.INITIAL);
    if (!sidebarRoute?.key) {
        return undefined;
    }

    const params = sidebarRoute.params;
    const policyID = params && typeof params === 'object' && 'policyID' in params && typeof params.policyID === 'string' ? params.policyID : undefined;
    return {sidebarRouteKey: sidebarRoute.key, splitStateKey: workspaceSplitRoute.state?.key, policyID};
}

function navigateToWorkspaceSettingsRoute(targetRoute: Route, policyID: string, shouldUseNarrowLayout: boolean) {
    if (shouldUseNarrowLayout) {
        Navigation.navigate(targetRoute);
        return;
    }

    const activeRoute = Navigation.getActiveRouteWithoutParams().replace(/^\//, '');
    const targetRouteWithoutParams = targetRoute.replace(/^\//, '').replace(/\?.*/, '');
    const isWorkspaceSettingsTransition = WORKSPACE_ROUTE_PATTERN.test(targetRouteWithoutParams) && activeRoute !== targetRouteWithoutParams && WORKSPACE_ROUTE_PATTERN.test(activeRoute);

    if (!isWorkspaceSettingsTransition) {
        Navigation.navigate(targetRoute);
        return;
    }

    const workspaceSidebarRoute = getActiveWorkspaceSidebarRoute();
    if (workspaceSidebarRoute && workspaceSidebarRoute.policyID !== policyID) {
        Navigation.setParams({policyID}, workspaceSidebarRoute.sidebarRouteKey, workspaceSidebarRoute.splitStateKey);
    }

    Navigation.navigate(targetRoute);
}

export default navigateToWorkspaceSettingsRoute;
