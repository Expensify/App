import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {isLiveWideTabPreMountTabRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';

import type {NavigationState} from '@react-navigation/native';

type Options = {
    /** When true, treat state as tab navigator: focused route is at index, not findLast. Use for screens inside Tab.Navigator. */
    freezeWhenInTabBackground?: boolean;
};

function getIsScreenBlurred(state: NavigationState, currentRouteKey: string, options?: Options) {
    if (options?.freezeWhenInTabBackground && typeof state.index === 'number' && state.index >= 0 && state.index < state.routes.length) {
        const focusedRoute = state.routes[state.index];
        // A background tab holding the wide submit pre-mount keeps rendering, or the screen would only mount on its reveal.
        return focusedRoute?.key !== currentRouteKey && !isLiveWideTabPreMountTabRouteKey(currentRouteKey);
    }
    const lastFullScreenRoute = state.routes.findLast((route) => isFullScreenName(route.name));
    return lastFullScreenRoute?.key !== currentRouteKey;
}

export default getIsScreenBlurred;
