import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

/** The TAB_NAVIGATOR state buildTabNavigatorNestedState builds on a cold start: not realized yet, with Inbox focused and its stack without an index. */
function createColdStartTabState(innerRouteNames: string[]): PartialState<NavigationState> {
    return {
        index: 1,
        routes: [
            {name: SCREENS.HOME},
            {
                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                state: {routes: innerRouteNames.map((name) => ({name}))},
            },
        ],
    };
}

describe('isTabRouteAtRoot', () => {
    it('is false for a chat restored on a cold start, before the tab navigator state is realized', () => {
        // Given the partial tab state a relaunch builds for an open chat, where Inbox is the focused tab and the chat is the last route of its stack
        const tabState = createColdStartTabState([SCREENS.INBOX, SCREENS.REPORT]);

        // When the focused tab route is read from that partial state, as the native tab bar does on its first render
        const isAtRoot = isTabRouteAtRoot(tabState.routes.at(tabState.index ?? 0));

        // Then the chat is not a tab root, so the bar stays hidden instead of showing over the chat until the state is realized
        expect(isAtRoot).toBe(false);
    });

    it('is true for the Inbox list restored on a cold start', () => {
        // Given the partial tab state a relaunch builds for the Inbox list
        const tabState = createColdStartTabState([SCREENS.INBOX]);

        // When the focused tab route is read from that partial state
        const isAtRoot = isTabRouteAtRoot(tabState.routes.at(tabState.index ?? 0));

        // Then the Inbox list is a tab root, so the bar shows right away instead of appearing late
        expect(isAtRoot).toBe(true);
    });

    it('is true when there is no tab route yet', () => {
        // Given a tab navigator without any state, which opens on its initial tab root
        // When there is no focused tab route to check
        const isAtRoot = isTabRouteAtRoot(undefined);

        // Then it counts as a tab root, so the bar shows on the default tab
        expect(isAtRoot).toBe(true);
    });
});
