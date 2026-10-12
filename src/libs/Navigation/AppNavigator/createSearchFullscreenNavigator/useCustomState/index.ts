import {isLiveWideTabPreMountRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';
import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

import SCREENS from '@src/SCREENS';

/**
 * Transforms SearchFullscreenNavigator state to render from the last SEARCH.ROOT onward.
 * @see SearchFullscreenNavigator use only!
 */
export default function getCustomState({state}: Pick<CustomStateHookProps, 'state'>) {
    // A hidden wide submit pre-mount is not a start point, so the Search screen it covers stays mounted until the reveal.
    const lastSearchNavigatorIndex = state.routes.findLastIndex((route) => route.name === SCREENS.SEARCH.ROOT && !isLiveWideTabPreMountRouteKey(route.key));
    const routesToRender = state.routes.slice(Math.max(0, lastSearchNavigatorIndex), state.routes.length);
    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
