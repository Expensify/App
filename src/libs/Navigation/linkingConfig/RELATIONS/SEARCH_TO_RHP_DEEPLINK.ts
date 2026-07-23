import type {SearchFullscreenNavigatorParamList} from '@navigation/types';

import SCREENS from '@src/SCREENS';

/**
 * Deeplink-only relations between the search screen and RHP screens.
 *
 * Unlike SEARCH_TO_RHP, entries here are consulted ONLY when navigation state is built from a
 * path (deeplink / browser refresh / cold load) - see the `isDeeplink` flag in
 * getMatchingFullScreenRoute. They define the DEFAULT fullscreen that should sit under the RHP in
 * that case, without forcing it for in-app navigation. So the listed RHP screens can still be
 * opened over ANY fullscreen when navigated to from within the app (the page underneath is left
 * unchanged), while a deeplink lands them on Spend > Expenses (Search) instead of the generic
 * Inbox fallback.
 */
const SEARCH_TO_RHP_DEEPLINK: Partial<Record<keyof SearchFullscreenNavigatorParamList, string[]>> = {
    // Native home-screen shortcut deeplinks (create expense / scan receipt / track distance) open the
    // create flow and should land on Spend > Expenses underneath, not the Inbox default.
    // CREATE hosts the manual/scan tabs; DISTANCE_CREATE (the `distance-new` sub-flow) hosts the
    // distance-map/manual/gps/odometer tabs - both are the focused leaf for their respective shortcut.
    // SUBMIT_EXPENSE is the `/submit-expense` redirect entry into the create flow, so it lands on
    // Spend > Expenses too instead of the default Home.
    // See https://github.com/Expensify/App/pull/94952 and issue #94821.
    [SCREENS.SEARCH.ROOT]: [SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.DISTANCE_CREATE, SCREENS.SUBMIT_EXPENSE],
};

export default SEARCH_TO_RHP_DEEPLINK;
