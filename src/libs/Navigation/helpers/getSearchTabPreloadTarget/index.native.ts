import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import type {RootNavigationState} from '@libs/Navigation/helpers/tabNavigatorUtils';
import {getUnvisitedTabPreloadTarget} from '@libs/Navigation/helpers/tabNavigatorUtils';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * The native tab bar mounts the Spend tab at startup, but its narrow Search page shows only a still placeholder until
 * it is first shown. Preloading marks it so it builds its list while hidden. Wide layouts keep the JS tab bar, which
 * is unmeasured here, so they are skipped. A submit that ends on Spend opens the tab itself, pre-inserted under the RHP,
 * so a preload would only compete with it.
 */
function getSearchTabPreloadTarget(rootState: RootNavigationState): string | undefined {
    if (!getIsNarrowLayout() || getPendingSubmitFollowUpAction()?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH) {
        return undefined;
    }
    return getUnvisitedTabPreloadTarget(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
}

export default getSearchTabPreloadTarget;
