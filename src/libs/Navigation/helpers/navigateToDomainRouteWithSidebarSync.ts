/**
 * React Navigation reuses the existing Domain split navigator when Search Router navigation crosses Domains, so its persistent sidebar keeps the previous Domain ID.
 * Synchronize that ID before navigating to keep the sidebar and destination page consistent.
 */
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {getTabState} from './tabNavigatorUtils';

function getActiveDomainSidebarRoute(): {sidebarRouteKey: string; splitStateKey?: string; domainAccountID?: number} | undefined {
    if (!navigationRef.isReady()) {
        return undefined;
    }

    const routes = navigationRef.getRootState().routes;
    const tabNavigatorRoute = routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const workspaceNavigatorRoute = getTabState(tabNavigatorRoute)?.routes.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
    const domainSplitRoute =
        workspaceNavigatorRoute?.state?.routes.findLast((route) => route.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR) ??
        routes.findLast((route) => route.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR);
    if (!domainSplitRoute) {
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

function navigateToDomainRouteWithSidebarSync(targetRoute: Route, domainAccountID: number, shouldUseNarrowLayout: boolean) {
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

export default navigateToDomainRouteWithSidebarSync;
