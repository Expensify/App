/**
 * Navigates between Workspace settings while keeping the wide-layout sidebar policy in sync.
 */
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const WORKSPACE_ROUTE_PATTERN = /^\/?workspaces\/[^/]+(\/.*)?$/;

type NavigationRouteWithState = {
    /** Name of the screen or navigator represented by this route. */
    name?: string;

    /** Key used to target navigation updates at this route. */
    key?: string;

    /** Route parameters needed to identify the Workspace shown in the sidebar. */
    params?: {
        /** ID of the Workspace currently shown in the sidebar. */
        policyID?: string;
    };

    /** Nested navigator state used to locate the Workspace sidebar route. */
    state?: {
        /** Key of the nested navigator state. */
        key?: string;

        /** Child routes contained in the nested navigator. */
        routes?: NavigationRouteWithState[];
    };
};

function findWorkspaceSidebarRoute(route: NavigationRouteWithState | undefined): {sidebarRoute: NavigationRouteWithState; splitStateKey?: string} | undefined {
    if (!route) {
        return undefined;
    }

    if (route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
        const sidebarRoute = route.state?.routes?.find((nestedRoute) => nestedRoute.name === SCREENS.WORKSPACE.INITIAL);
        if (sidebarRoute?.key) {
            return {sidebarRoute, splitStateKey: route.state?.key};
        }
    }

    const routes = route.state?.routes ?? [];
    for (let index = routes.length - 1; index >= 0; index--) {
        const workspaceSidebarRoute = findWorkspaceSidebarRoute(routes.at(index));
        if (workspaceSidebarRoute) {
            return workspaceSidebarRoute;
        }
    }

    return undefined;
}

function getActiveWorkspaceSidebarRoute(): {sidebarRoute: NavigationRouteWithState; splitStateKey?: string} | undefined {
    if (!navigationRef.isReady()) {
        return undefined;
    }

    const routes = navigationRef.getRootState().routes;
    for (let index = routes.length - 1; index >= 0; index--) {
        const workspaceSidebarRoute = findWorkspaceSidebarRoute(routes.at(index));
        if (workspaceSidebarRoute) {
            return workspaceSidebarRoute;
        }
    }

    return undefined;
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
    if (workspaceSidebarRoute?.sidebarRoute.key && workspaceSidebarRoute.sidebarRoute.params?.policyID !== policyID) {
        Navigation.setParams({policyID}, workspaceSidebarRoute.sidebarRoute.key, workspaceSidebarRoute.splitStateKey);
    }

    Navigation.navigate(targetRoute);
}

export default navigateToWorkspaceSettingsRoute;
