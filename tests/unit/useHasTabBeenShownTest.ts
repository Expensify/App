import {renderHook} from '@testing-library/react-native';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';
import useRootNavigationState from '@hooks/useRootNavigationState';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

jest.mock('@hooks/useRootNavigationState', () => jest.fn());

const mockedUseRootNavigationState = jest.mocked(useRootNavigationState);

let rootState: NavigationState | undefined;

function buildRootState(selectedTab: string): NavigationState {
    const tabRoutes = [SCREENS.HOME, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR].map((name) => ({key: `${name}-key`, name}));
    return {
        stale: false,
        type: 'stack',
        key: 'root-key',
        index: 0,
        routeNames: [NAVIGATORS.TAB_NAVIGATOR],
        routes: [
            {
                key: 'tab-navigator-key',
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    stale: false,
                    type: 'tab',
                    key: 'tab-key',
                    index: tabRoutes.findIndex((route) => route.name === selectedTab),
                    routeNames: tabRoutes.map((route) => route.name),
                    routes: tabRoutes,
                },
            },
        ],
    } as NavigationState;
}

describe('useHasTabBeenShown', () => {
    beforeEach(() => {
        mockedUseRootNavigationState.mockImplementation((selector) => selector(rootState));
    });

    it('stays false while the tab is mounted in the background', () => {
        // Given native tabs that mounted Spend at startup while Home is selected
        rootState = buildRootState(SCREENS.HOME);

        // When Spend's page reads whether it has been shown
        const {result} = renderHook(() => useHasTabBeenShown(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));

        // Then it has not, so the page holds back what it requests on mount
        expect(result.current).toBe(false);
    });

    it('stays true once the tab has been selected, after the user leaves it', () => {
        // Given Spend mounted in the background
        rootState = buildRootState(SCREENS.HOME);
        const {result, rerender} = renderHook(() => useHasTabBeenShown(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));

        // When the user selects Spend and then goes back to Home
        rootState = buildRootState(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        rerender({});
        rootState = buildRootState(SCREENS.HOME);
        rerender({});

        // Then Spend counts as shown, so its page keeps reacting to its query like a page mounted with the tab
        expect(result.current).toBe(true);
    });

    it('is true before navigation is ready', () => {
        // Given no navigation state yet, as when the page mounts with the tab on web
        rootState = undefined;

        // When the page reads whether its tab has been shown
        const {result} = renderHook(() => useHasTabBeenShown(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then it counts as shown, so nothing is held back when the tab is not a background one
        expect(result.current).toBe(true);
    });
});
