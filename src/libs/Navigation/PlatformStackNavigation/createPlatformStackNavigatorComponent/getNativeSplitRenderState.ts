// Project one split-router state into a sidebar and a native central stack without changing route keys.
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase} from '@react-navigation/native';

function getNativeSplitRenderState(state: PlatformStackNavigationState<ParamListBase>, sidebarRouteName: string) {
    const sidebarRoute = state.routes.find((route) => route.name === sidebarRouteName);
    if (!sidebarRoute) {
        return;
    }

    const centralRoutes = state.routes.filter((route) => route.key !== sidebarRoute.key);
    if (centralRoutes.length === 0) {
        return;
    }

    const focusedRoute = state.routes.at(state.index);
    const focusedCentralIndex = centralRoutes.findIndex((route) => route.key === focusedRoute?.key);

    return {
        sidebarRoute,
        centralState: {
            ...state,
            routeNames: state.routeNames.filter((routeName) => routeName !== sidebarRouteName),
            routes: centralRoutes,
            index: focusedCentralIndex === -1 ? centralRoutes.length - 1 : focusedCentralIndex,
            preloadedRoutes: state.preloadedRoutes.filter((route) => route.name !== sidebarRouteName),
        },
    };
}

export default getNativeSplitRenderState;
