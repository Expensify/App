import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getPlatform from '@libs/getPlatform';
import type {RootNavigationState} from '@libs/Navigation/helpers/tabNavigatorUtils';
import {getTabPreloadTarget} from '@libs/Navigation/helpers/tabNavigatorUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * Desktop browsers mount a tab only when it is opened, so the Spend tab is preloaded before its first mount. Mobile
 * browsers and narrow windows are skipped: the narrow Search page builds only its placeholder list while hidden, and
 * the cost on a phone CPU is unmeasured.
 */
function getSearchTabPreloadTarget(rootState: RootNavigationState): string | undefined {
    if (getPlatform(true) !== CONST.PLATFORM.WEB || getIsNarrowLayout()) {
        return undefined;
    }
    return getTabPreloadTarget(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
}

export default getSearchTabPreloadTarget;
