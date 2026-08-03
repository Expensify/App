import type {SearchFullscreenNavigatorParamList} from '@navigation/types';

import SCREENS from '@src/SCREENS';

/**
 * Deeplink-only variant of SEARCH_TO_RHP. Consulted ONLY when navigation state is built from a path
 * (deeplink / browser refresh / cold load) via the `isDeeplink` flag in getMatchingFullScreenRoute,
 * defining the default fullscreen under the RHP without forcing it for in-app navigation.
 */
const SEARCH_TO_RHP_DEEPLINK: Partial<Record<keyof SearchFullscreenNavigatorParamList, string[]>> = {
    // Create-flow entry points land on Spend > Expenses instead of the Inbox default.
    // See https://github.com/Expensify/App/pull/94952 and issue #94821.
    [SCREENS.SEARCH.ROOT]: [SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.DISTANCE_CREATE, SCREENS.MONEY_REQUEST.START, SCREENS.SUBMIT_EXPENSE, SCREENS.TRACK_EXPENSE],
};

export default SEARCH_TO_RHP_DEEPLINK;
