/**
 * Navigates between Workspace settings while keeping the wide-layout sidebar policy in sync.
 */
import WORKSPACE_TO_RHP from '@libs/Navigation/linkingConfig/RELATIONS/WORKSPACE_TO_RHP';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {isWorkspaceNavigatorRouteName} from './isNavigatorName';
import {getTabState} from './tabNavigatorUtils';

function isWorkspaceSettingsScreen(screenName: string | undefined): boolean {
    return !!screenName && Object.hasOwn(WORKSPACE_TO_RHP, screenName);
}

function getActiveWorkspaceSidebarRoute(): {sidebarRouteKey: string; splitStateKey?: string; policyID?: string; activeScreenName?: string} | undefined {
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
    return {sidebarRouteKey: sidebarRoute.key, splitStateKey: workspaceSplitRoute.state?.key, policyID, activeScreenName: workspaceSplitRoute.state?.routes.at(-1)?.name};
}

function navigateToWorkspaceSettingsRoute(targetRoute: Route, policyID: string, shouldUseNarrowLayout: boolean, targetScreenName: string) {
    if (shouldUseNarrowLayout) {
        Navigation.navigate(targetRoute);
        return;
    }

    const workspaceSidebarRoute = getActiveWorkspaceSidebarRoute();
    const isWorkspaceSettingsTransition =
        isWorkspaceSettingsScreen(targetScreenName) &&
        isWorkspaceSettingsScreen(workspaceSidebarRoute?.activeScreenName) &&
        (workspaceSidebarRoute?.activeScreenName !== targetScreenName || workspaceSidebarRoute.policyID !== policyID);

    if (!isWorkspaceSettingsTransition) {
        Navigation.navigate(targetRoute);
        return;
    }

    if (workspaceSidebarRoute && workspaceSidebarRoute.policyID !== policyID) {
        Navigation.setParams({policyID}, workspaceSidebarRoute.sidebarRouteKey, workspaceSidebarRoute.splitStateKey);
    }

    Navigation.navigate(targetRoute);
}

export default navigateToWorkspaceSettingsRoute;
