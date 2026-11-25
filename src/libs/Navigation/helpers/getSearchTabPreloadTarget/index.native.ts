import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import type {RootNavigationState} from '@libs/Navigation/helpers/tabNavigatorUtils';
import {getFocusedTabRouteName, getTabNavigatorState} from '@libs/Navigation/helpers/tabNavigatorUtils';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * The native tab bar mounts Spend at startup, but the narrow page shows only a placeholder until it is first shown, so
 * the preload makes it build its list while hidden. Only a tab with no entry in the tab history was never shown. A back
 * press drops that entry, but preloading such a tab again rebuilds nothing. Wide layouts are unmeasured and skipped. A
 * submit that ends on Spend opens the tab itself, so the preload steps aside.
 */
function getSearchTabPreloadTarget(rootState: RootNavigationState): string | undefined {
    if (!getIsNarrowLayout() || getPendingSubmitFollowUpAction()?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH) {
        return undefined;
    }

    const tabState = getTabNavigatorState(rootState);
    const spendRoute = tabState?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const wasSpendShown = !!tabState?.history?.some((record) => record.type === 'route' && record.key === spendRoute?.key);
    if (!tabState?.key || !spendRoute?.key || wasSpendShown || getFocusedTabRouteName(rootState) === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) {
        return undefined;
    }

    return tabState.key;
}

export default getSearchTabPreloadTarget;
