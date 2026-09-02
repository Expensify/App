import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {isWorkspaceNavigatorRouteName} from './isNavigatorName';
import {getTabState} from './tabNavigatorUtils';

function getActiveDomainSidebarRoute(): {sidebarRouteKey: string; splitStateKey?: string; domainAccountID?: number} | undefined {
    if (!navigationRef.isReady()) {
        return undefined;
    }

    const routes = navigationRef.getRootState().routes;
    const tabNavigatorRoute = routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const workspaceNavigatorRoute = getTabState(tabNavigatorRoute)?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
    const domainSplitRoute =
        workspaceNavigatorRoute?.state?.routes.findLast((route) => isWorkspaceNavigatorRouteName(route.name)) ?? routes.findLast((route) => isWorkspaceNavigatorRouteName(route.name));
    if (domainSplitRoute?.name !== NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR) {
        return undefined;
    }

    const sidebarRoute = domainSplitRoute.state?.routes.find((route) => route.name === SCREENS.DOMAIN.INITIAL);
    if (!sidebarRoute?.key) {
        return undefined;
    }

    const params = sidebarRoute.params;
    const domainAccountID = params && typeof params === 'object' && 'domainAccountID' in params && typeof params.domainAccountID === 'number' ? params.domainAccountID : undefined;
    return {sidebarRouteKey: sidebarRoute.key, splitStateKey: domainSplitRoute.state?.key, domainAccountID};
}

/** Keeps the persistent Domain sidebar in sync before opening a Search Router destination. */
function navigateToDomainSettingsRoute(targetRoute: Route, domainAccountID: number, shouldUseNarrowLayout: boolean) {
    if (shouldUseNarrowLayout) {
        Navigation.navigate(targetRoute);
        return;
    }

    const domainSidebarRoute = getActiveDomainSidebarRoute();
    if (domainSidebarRoute && domainSidebarRoute.domainAccountID !== domainAccountID) {
        Navigation.setParams({domainAccountID}, domainSidebarRoute.sidebarRouteKey, domainSidebarRoute.splitStateKey);
    }

    Navigation.navigate(targetRoute);
}

export default navigateToDomainSettingsRoute;
