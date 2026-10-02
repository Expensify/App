import {isLiveWideTabPreMountRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

/** Limits the rendered routes to the visible ones: the last two screens on narrow, the sidebar and the last two central screens on wide. */
function getCustomSplitNavigatorState({state, shouldUseNarrowLayout}: Pick<CustomStateHookProps, 'state' | 'shouldUseNarrowLayout'>) {
    const sidebarScreenRoute = state.routes.at(0);

    if (!sidebarScreenRoute) {
        return state;
    }

    const centralScreenRoutes = state.routes.slice(1);
    if (shouldUseNarrowLayout) {
        const routesToRender = state.routes.slice(-2);
        return {...state, routes: routesToRender, index: routesToRender.length - 1};
    }

    // A hidden wide submit pre-mount does not take one of the two central slots, so the screens rendered before it stay mounted.
    const keptCentralRouteKeys = new Set(
        centralScreenRoutes
            .filter((route) => !isLiveWideTabPreMountRouteKey(route.key))
            .slice(-2)
            .map((route) => route.key),
    );
    const routesToRender = [sidebarScreenRoute, ...centralScreenRoutes.filter((route) => keptCentralRouteKeys.has(route.key) || isLiveWideTabPreMountRouteKey(route.key))];

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}

export default getCustomSplitNavigatorState;
