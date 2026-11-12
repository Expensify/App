import getActiveTabRoute from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/getActiveTabRoute';
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

describe('getActiveTabRoute', () => {
    it('reads the focused tab of a chat restored on a cold start, before the tab navigator state is realized', () => {
        // Given the partial tab state a relaunch builds for an open chat, where Inbox is the focused tab and the chat is the last route of its stack
        const tabState = createColdStartTabState([SCREENS.INBOX, SCREENS.REPORT]);

        // When the native tab bar reads the focused tab route on its first render
        const activeTabRoute = getActiveTabRoute(tabState);

        // Then the Inbox tab is read from the partial state and it isn't at its root, so the bar stays hidden instead of showing over the chat until the state is realized
        expect(activeTabRoute?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        expect(isTabRouteAtRoot(activeTabRoute)).toBe(false);
    });

    it('reads the focused tab of the Inbox list restored on a cold start', () => {
        // Given the partial tab state a relaunch builds for the Inbox list
        const tabState = createColdStartTabState([SCREENS.INBOX]);

        // When the native tab bar reads the focused tab route
        const activeTabRoute = getActiveTabRoute(tabState);

        // Then the Inbox tab is at its root, so the bar shows right away instead of appearing late
        expect(activeTabRoute?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        expect(isTabRouteAtRoot(activeTabRoute)).toBe(true);
    });

    it('falls back to the first tab when the partial state has no index', () => {
        // Given a partial tab state without an index, which TabRouter rehydrates with the first tab focused
        const tabState: PartialState<NavigationState> = {
            routes: [{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.INBOX}, {name: SCREENS.REPORT}]}}],
        };

        // When the native tab bar reads the focused tab route
        const activeTabRoute = getActiveTabRoute(tabState);

        // Then it picks the first tab like TabRouter does, rather than the last route like a stack would
        expect(activeTabRoute?.name).toBe(SCREENS.HOME);
    });

    it('returns undefined when there is no tab state yet', () => {
        // Given a tab navigator that has no state yet
        // When the native tab bar reads the focused tab route
        const activeTabRoute = getActiveTabRoute(undefined);

        // Then there is no route, which counts as a tab root, so the bar shows on the default tab
        expect(activeTabRoute).toBeUndefined();
        expect(isTabRouteAtRoot(activeTabRoute)).toBe(true);
    });
});
