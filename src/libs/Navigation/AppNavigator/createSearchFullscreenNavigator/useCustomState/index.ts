import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

import SCREENS from '@src/SCREENS';

/**
 * Transforms SearchFullscreenNavigator state to render from the last SEARCH.ROOT onward.
 * @see SearchFullscreenNavigator use only!
 */
export default function getCustomState({state}: CustomStateHookProps) {
    const lastSearchNavigatorIndex = state.routes.findLastIndex((route) => route.name === SCREENS.SEARCH.ROOT);
    const routesToRender = state.routes.slice(Math.max(0, lastSearchNavigatorIndex), state.routes.length);
    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}
