import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const WORKSPACE_ROUTE_PATTERN = /^\/?workspaces\/[^/]+(\/.*)?$/;

type NavigationRouteWithState = {
    name?: string;
    key?: string;
    params?: {
        policyID?: string;
    };
    state?: {
        key?: string;
        routes?: NavigationRouteWithState[];
    };
};

function getWorkspaceRouteSuffix(route: string): string | undefined {
    const normalizedRoute = route.replace(/\?.*$/, '');
    const match = normalizedRoute.match(WORKSPACE_ROUTE_PATTERN);
    return match?.[1] ?? '';
}

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

    const routes = (navigationRef.getRootState() as {routes?: NavigationRouteWithState[]}).routes ?? [];
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

    const activeRoute = Navigation.getActiveRouteWithoutParams();
    const targetSuffix = getWorkspaceRouteSuffix(targetRoute);
    const isWorkspaceSettingsTransition = targetSuffix !== undefined && activeRoute !== targetRoute && WORKSPACE_ROUTE_PATTERN.test(activeRoute);

    if (!isWorkspaceSettingsTransition) {
        Navigation.navigate(targetRoute);
        return;
    }

    const workspaceSidebarRoute = getActiveWorkspaceSidebarRoute();
    if (workspaceSidebarRoute?.sidebarRoute.key && workspaceSidebarRoute.sidebarRoute.params?.policyID !== policyID) {
        Navigation.setParams({policyID}, workspaceSidebarRoute.sidebarRoute.key, workspaceSidebarRoute.splitStateKey);
    }

    Navigation.navigate(targetRoute, {forceReplace: true});
}

export default navigateToWorkspaceSettingsRoute;
