import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationRoute} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';

/**
 * Returns the route directly beneath the topmost one in the Right-Hand-Panel stack, or undefined when the RHP
 * has a single route (or is absent). The RHP inner stack records the drill path, so this tells you what screen
 * the current RHP screen was opened on top of (e.g. an expense report beneath a transaction thread).
 */
function getRouteBeneathTopmostRHP(): NavigationRoute | undefined {
    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return undefined;
    }

    const rhpState = rootState.routes.findLast((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.state;
    return rhpState?.routes?.at(-2);
}

export default getRouteBeneathTopmostRHP;
