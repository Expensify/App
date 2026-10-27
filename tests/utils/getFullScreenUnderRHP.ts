import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';

import NAVIGATORS from '@src/NAVIGATORS';

/** Resolves the path the way a deep link or refresh does and returns the full screen left under the RHP. */
function getFullScreenUnderRHP(path: string) {
    const state = getAdaptedStateFromPath(path, undefined);
    const tabRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabRoute?.state;
    const fullScreen = tabState?.routes?.at(tabState.index ?? (tabState.routes?.length ?? 1) - 1);
    return {name: fullScreen?.name, central: fullScreen?.state?.routes?.at(-1)?.name};
}

export default getFullScreenUnderRHP;
