import {renderHook} from '@testing-library/react-native';

import useIsTabFocused from '@hooks/useIsTabFocused';
import useRootNavigationState from '@hooks/useRootNavigationState';

import {getPreInsertedOriginalTabRoute} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers', () => ({
    getPreInsertedOriginalTabRoute: jest.fn(),
}));

const mockedUseRootNavigationState = jest.mocked(useRootNavigationState);
const mockedGetPreInsertedOriginalTabRoute = jest.mocked(getPreInsertedOriginalTabRoute);

type RootRoute = NavigationState['routes'][number];

/** A tab navigator with `tabName` as the selected tab. */
function buildTabNavigatorRoute(key: string, tabName: string): RootRoute {
    const tabRoutes = [
        {key: `${key}-home`, name: SCREENS.HOME},
        {key: `${key}-inbox`, name: SCREENS.SEARCH.ROOT},
    ];

    return {
        key,
        name: NAVIGATORS.TAB_NAVIGATOR,
        state: {
            key: `${key}-state`,
            index: tabRoutes.findIndex((route) => route.name === tabName),
            routeNames: tabRoutes.map((route) => route.name),
            type: 'tab',
            stale: false,
            routes: tabRoutes,
        },
    };
}

function buildRootState(routes: RootRoute[]): NavigationState {
    return {
        key: 'root',
        index: routes.length - 1,
        routeNames: routes.map((route) => route.name),
        type: 'stack',
        stale: false,
        routes,
    };
}

function renderWithState(state: NavigationState | undefined, tabName: string = SCREENS.HOME) {
    mockedUseRootNavigationState.mockImplementation((selector) => selector(state));
    return renderHook(() => useIsTabFocused(tabName)).result.current;
}

describe('useIsTabFocused', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetPreInsertedOriginalTabRoute.mockReturnValue(undefined);
    });

    it('is true when the tab is the selected one', () => {
        // Given a navigation state with Home selected in the tab navigator

        // When the hook is asked about Home
        const isFocused = renderWithState(buildRootState([buildTabNavigatorRoute('tabs', SCREENS.HOME)]));

        // Then it reports the tab as focused
        expect(isFocused).toBe(true);
    });

    it('stays true while an RHP is pushed over the tab', () => {
        // Given Home selected with a right-hand pane stacked above it, which is what opening an expense does
        const state = buildRootState([buildTabNavigatorRoute('tabs', SCREENS.HOME), {key: 'rhp', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);

        // When the hook is asked about Home
        const isFocused = renderWithState(state);

        // Then the tab is still the active one, unlike `useIsFocused()`, so closing the pane is not an arrival
        expect(isFocused).toBe(true);
    });

    it('is false when another tab is selected', () => {
        // Given the Inbox tab selected

        // When the hook is asked about Home
        const isFocused = renderWithState(buildRootState([buildTabNavigatorRoute('tabs', SCREENS.SEARCH.ROOT)]));

        // Then Home is not the active tab, so its data is left alone
        expect(isFocused).toBe(false);
    });

    it('reads the top-most tab navigator when more than one is on the stack', () => {
        // Given an older tab navigator underneath a newer one that has Inbox selected
        const state = buildRootState([buildTabNavigatorRoute('tabs', SCREENS.HOME), buildTabNavigatorRoute('tabs-2', SCREENS.SEARCH.ROOT)]);

        // When the hook is asked about Home
        const isFocused = renderWithState(state);

        // Then it follows the top-most tab navigator, not the one buried below it
        expect(isFocused).toBe(false);
    });

    it('is false before the navigation ref is ready', () => {
        // Given navigation that has not initialized, which passes `undefined` to the selector

        // When the hook runs
        const isFocused = renderWithState(undefined);

        // Then it reports not focused rather than refreshing against an unknown state
        expect(isFocused).toBe(false);
    });

    it('is false when the stack has no tab navigator', () => {
        // Given a root route that must not be mistaken for a tab navigator
        const state = buildRootState([{key: 'home', name: SCREENS.HOME}]);

        // When the hook is asked about Home
        const isFocused = renderWithState(state);

        // Then a matching screen name alone is not tab focus
        expect(isFocused).toBe(false);
    });

    it('keeps the original tab focused while a destination is pre-inserted under an RHP', () => {
        // Given Home was selected before Search was pre-inserted beneath an RHP and its buffer
        mockedGetPreInsertedOriginalTabRoute.mockReturnValue(buildTabNavigatorRoute('tabs', SCREENS.HOME));
        const state = buildRootState([
            buildTabNavigatorRoute('tabs', SCREENS.SEARCH.ROOT),
            {key: 'buffer', name: SCREENS.PRE_MOUNT_BUFFER},
            {key: 'rhp', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
        ]);

        // When querying both the original tab and the speculative destination
        const isHomeFocused = renderWithState(state);
        const isSearchFocused = renderWithState(state, SCREENS.SEARCH.ROOT);

        // Then pre-mounting does not count as leaving Home or arriving at Search
        expect(isHomeFocused).toBe(true);
        expect(isSearchFocused).toBe(false);
    });

    it.each(['different navigator', 'no RHP', 'RHP below the navigator'] as const)('ignores the saved tab with %s', (scenario) => {
        // Given a saved Home route that no longer represents a destination hidden under its RHP
        mockedGetPreInsertedOriginalTabRoute.mockReturnValue(buildTabNavigatorRoute('tabs', SCREENS.HOME));
        const searchRoute = buildTabNavigatorRoute(scenario === 'different navigator' ? 'new-tabs' : 'tabs', SCREENS.SEARCH.ROOT);
        const rhpRoute = {key: 'rhp', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR};
        let routes = [searchRoute];
        if (scenario === 'different navigator') {
            routes = [searchRoute, rhpRoute];
        } else if (scenario === 'RHP below the navigator') {
            routes = [rhpRoute, searchRoute];
        }

        // When the hook resolves the active tab
        const isHomeFocused = renderWithState(buildRootState(routes));

        // Then stale saved state cannot keep Home focused
        expect(isHomeFocused).toBe(false);
    });
});
