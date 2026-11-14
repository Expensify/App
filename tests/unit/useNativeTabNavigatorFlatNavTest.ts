import {renderHook} from '@testing-library/react-native';

import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getActiveTabRoute from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/getActiveTabRoute';
import {getSearchTabSearchKey} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/nativeTabItemUtils';
import useIsNativeFlatNavTabBarEnabled from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsNativeFlatNavTabBarEnabled';
import useNativeFlatNavSearchSection from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeFlatNavSearchSection';
import useNativeTabNavigator from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabNavigator';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';

import {CommonActions, TabActions, TabRouter} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const INBOX_DOT_COLOR = '#00ff00';
const WORKSPACES_DOT_COLOR = '#ff0000';
const SAVED_SEARCH_ID = '123';

let mockTabState: NavigationState | PartialState<NavigationState> | undefined;

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
    return {
        ...actual,
        useNavigation: () => ({getParent: () => undefined}),
        useRoute: () => ({key: 'tab-navigator-route'}),
        useNavigationState: (selector: (state: unknown) => unknown) => selector({index: 0, routes: [{key: 'tab-navigator-route', name: 'TabNavigator', state: mockTabState}]}),
    };
});
jest.mock('@hooks/usePermissions', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (path: string) => path}));
jest.mock('@hooks/useInboxTabIndicatorStatus', () => () => ({indicatorColor: '#00ff00'}));
jest.mock('@hooks/useWorkspacesTabIndicatorStatus', () => () => ({indicatorColor: '#ff0000', status: 'hasPolicyErrors'}));
jest.mock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsWorkspacesTabRestored', () => () => false);

const DEFAULT_ROUTE_NAMES = [
    SCREENS.HOME,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    SCREENS.INSIGHTS,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
];

const FLAT_NAV_ROUTE_NAMES = [
    SCREENS.HOME,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    SCREENS.NATIVE_TAB_ITEM.EXPENSES,
    SCREENS.NATIVE_TAB_ITEM.REPORTS,
    SCREENS.NATIVE_TAB_ITEM.MORE,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    SCREENS.INSIGHTS,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
];

function mockFlatNav({isBetaEnabled, shouldUseNarrowLayout}: {isBetaEnabled: boolean; shouldUseNarrowLayout: boolean}) {
    jest.mocked(usePermissions).mockReturnValue(createMock<ReturnType<typeof usePermissions>>({isBetaEnabled: (beta) => isBetaEnabled && beta === CONST.BETAS.FLAT_NAV}));
    jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout}));
}

/** A tab state whose Search root shows the search with the given key, or no Search state at all. */
function buildTabState(searchKey: string | undefined, {hasSearchState = true, isSearchFocused = false} = {}): PartialState<NavigationState> {
    return {
        index: isSearchFocused ? DEFAULT_ROUTE_NAMES.indexOf(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) : 0,
        routes: DEFAULT_ROUTE_NAMES.map((name) =>
            name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR && hasSearchState
                ? {name, state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT, params: {q: 'type:expense', searchKey}}]}}
                : {name},
        ),
    };
}

async function storeReportsSearch() {
    await Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {
        queryJSON: buildSearchQueryJSON(buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})),
        searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS,
    });
    await waitForBatchedUpdates();
}

/** The tab navigator as FlatNavNativeTabNavigator configures it, reading the Search tab of the mocked tab state. */
function useFlatNavTabNavigator() {
    const flatNavSearchSectionID = useNativeFlatNavSearchSection({
        searchKey: getSearchTabSearchKey(mockTabState?.routes.find((tabRoute) => tabRoute.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)),
        isSearchFocused: getActiveTabRoute(mockTabState)?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    });
    return useNativeTabNavigator({isFlatNavTabBarEnabled: true, flatNavSearchSectionID});
}

function buildRouterOptions(routeNames: string[]) {
    return {routeNames, routeParamList: {}, routeGetIdList: {}};
}

describe('useNativeTabNavigator with the flat nav bar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockTabState = buildTabState(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        await Onyx.clear();
    });

    it('keeps the tab bar of today without the beta', () => {
        // Given a narrow layout without the flat nav beta
        mockFlatNav({isBetaEnabled: false, shouldUseNarrowLayout: true});

        // When the native tab navigator is configured
        const {result} = renderHook(() => useNativeTabNavigator());

        // Then the bar has the five tabs of today, Account is the only tab without an item, and no tab is drawn inside another
        expect(result.current.isFlatNavTabBarEnabled).toBe(false);
        expect(Object.keys(result.current.tabLabels)).toEqual([
            SCREENS.HOME,
            NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
            NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
            SCREENS.INSIGHTS,
            NAVIGATORS.WORKSPACE_NAVIGATOR,
        ]);
        expect([...result.current.tabsWithoutBarItem]).toEqual([NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]);
        expect(result.current.dotColors).toEqual({[NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: INBOX_DOT_COLOR, [NAVIGATORS.WORKSPACE_NAVIGATOR]: WORKSPACES_DOT_COLOR});
        for (const routeName of DEFAULT_ROUTE_NAMES) {
            expect(result.current.getTabHostRouteName(routeName)).toBeUndefined();
        }
    });

    it('does not render again for the flat nav data without the beta', async () => {
        // Given a narrow layout without the flat nav beta
        mockFlatNav({isBetaEnabled: false, shouldUseNarrowLayout: true});
        let renderCount = 0;
        renderHook(() => {
            renderCount++;
            return useNativeTabNavigator();
        });
        await waitForBatchedUpdates();
        const renderCountBefore = renderCount;

        // When the stored search and the saved searches change
        await storeReportsSearch();
        await Onyx.set(ONYXKEYS.SAVED_SEARCHES, {[SAVED_SEARCH_ID]: {name: 'Mine', query: 'type:expense'}});
        await waitForBatchedUpdates();

        // Then the tab navigator does not render again, because only the flat nav bar reads them
        expect(renderCount).toBe(renderCountBefore);
    });

    it.each([
        [true, true, true],
        [true, false, false],
        [false, true, false],
    ])('shows the flat nav items with the beta %s on a narrow layout %s: %s', (isBetaEnabled, shouldUseNarrowLayout, expected) => {
        // Given a user with or without the flat nav beta, on a phone or on a tablet whose JS side bar replaces the native bar
        mockFlatNav({isBetaEnabled, shouldUseNarrowLayout});

        // When the bar decides whether to show the flat nav items
        const {result} = renderHook(() => useIsNativeFlatNavTabBarEnabled());

        // Then only a narrow layout with the beta shows them, so tablets keep the side bar of today
        expect(result.current).toBe(expected);
    });

    it('labels exactly the five flat nav items and moves the Workspaces dot to More', () => {
        // Given a narrow layout with the flat nav beta

        // When the native tab navigator is configured
        const {result} = renderHook(() => useFlatNavTabNavigator());

        // Then only the five items in the bar get a label, since iOS sizes each label by the number of labels
        expect(result.current.tabLabels).toEqual({
            [SCREENS.HOME]: 'common.home',
            [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: 'common.inbox',
            [SCREENS.NATIVE_TAB_ITEM.EXPENSES]: 'common.expenses',
            [SCREENS.NATIVE_TAB_ITEM.REPORTS]: 'common.reports',
            [SCREENS.NATIVE_TAB_ITEM.MORE]: 'common.more',
        });
        // And the routes behind Expenses, Reports and More have no item of their own
        expect([...result.current.tabsWithoutBarItem].sort()).toEqual(
            [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.INSIGHTS, NAVIGATORS.WORKSPACE_NAVIGATOR, NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR].sort(),
        );
        // And More carries the Workspaces dot, since Workspaces is reached from it
        expect(result.current.dotColors).toEqual({[NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: INBOX_DOT_COLOR, [SCREENS.NATIVE_TAB_ITEM.MORE]: WORKSPACES_DOT_COLOR});
    });

    it.each([
        [CONST.SEARCH.SEARCH_KEYS.EXPENSES, SCREENS.NATIVE_TAB_ITEM.EXPENSES],
        [CONST.SEARCH.SEARCH_KEYS.APPROVE, SCREENS.NATIVE_TAB_ITEM.REPORTS],
        [CONST.SEARCH.SEARCH_KEYS.EXPORT, SCREENS.NATIVE_TAB_ITEM.MORE],
        [`${CONST.SEARCH.SAVED_SEARCH_PREFIX}${SAVED_SEARCH_ID}`, SCREENS.NATIVE_TAB_ITEM.MORE],
        [CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS, SCREENS.NATIVE_TAB_ITEM.EXPENSES],
    ])('draws a Search on the %s search inside the %s item', async (searchKey, hostRouteName) => {
        // Given the flat nav beta, a saved search, and Search focused on a search of one of the sections
        await Onyx.set(ONYXKEYS.SAVED_SEARCHES, {[SAVED_SEARCH_ID]: {name: 'Mine', query: 'type:expense'}});
        mockTabState = buildTabState(searchKey, {isSearchFocused: true});

        // When the host of Search is resolved
        const {result} = renderHook(() => useFlatNavTabNavigator());
        await waitForBatchedUpdates();

        // Then it is the item of that section, so the bar highlights where the search belongs
        expect(result.current.getTabHostRouteName(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)).toBe(hostRouteName);
    });

    it('draws Insights and Workspaces inside More and Account inside no item', () => {
        // Given the flat nav beta

        // When the hosts of the routes behind More and of Account are resolved
        const {result} = renderHook(() => useFlatNavTabNavigator());

        // Then Insights and Workspaces highlight More, and Account highlights nothing, as it opens from the top bar
        expect(result.current.getTabHostRouteName(SCREENS.INSIGHTS)).toBe(SCREENS.NATIVE_TAB_ITEM.MORE);
        expect(result.current.getTabHostRouteName(NAVIGATORS.WORKSPACE_NAVIGATOR)).toBe(SCREENS.NATIVE_TAB_ITEM.MORE);
        expect(result.current.getTabHostRouteName(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR)).toBeUndefined();
    });

    it('starts a Search that has not mounted yet in the item of the stored search', async () => {
        // Given the flat nav beta, a stored Reports search and a Search navigator that has not mounted yet
        mockTabState = buildTabState(undefined, {hasSearchState: false});
        await storeReportsSearch();

        // When the host of Search is resolved
        const {result} = renderHook(() => useFlatNavTabNavigator());
        await waitForBatchedUpdates();

        // Then it is Reports, the search Search opens on, so Search does not move to another item and remount when it mounts
        expect(result.current.getTabHostRouteName(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)).toBe(SCREENS.NATIVE_TAB_ITEM.REPORTS);
    });

    it('follows the shown search once Search has been shown, even when it has no search key', async () => {
        // Given the flat nav beta, a stored Reports search, and Search focused on a search with no key, such as a chat search
        await storeReportsSearch();
        mockTabState = buildTabState(undefined, {isSearchFocused: true});

        // When the host of Search is resolved
        const {result} = renderHook(() => useFlatNavTabNavigator());
        await waitForBatchedUpdates();

        // Then the stored search is ignored and Search falls back to Expenses, since the stored one only says where Search opens first
        expect(result.current.getTabHostRouteName(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)).toBe(SCREENS.NATIVE_TAB_ITEM.EXPENSES);
    });

    it('draws a saved search inside Expenses while the Saved section is hidden', async () => {
        // Given the flat nav beta, an online user whose only saved search is waiting to be deleted, and Search on that search
        await Onyx.set(ONYXKEYS.SAVED_SEARCHES, {[SAVED_SEARCH_ID]: {name: 'Mine', query: 'type:expense', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}});
        mockTabState = buildTabState(`${CONST.SEARCH.SAVED_SEARCH_PREFIX}${SAVED_SEARCH_ID}`, {isSearchFocused: true});

        // When the host of Search is resolved
        const {result} = renderHook(() => useFlatNavTabNavigator());
        await waitForBatchedUpdates();

        // Then it is Expenses rather than More, because the More menu shows no Saved row to highlight
        expect(result.current.getTabHostRouteName(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)).toBe(SCREENS.NATIVE_TAB_ITEM.EXPENSES);
    });

    it('never focuses a placeholder, whatever navigates to it', () => {
        // Given the tab router with the flat nav routes, focused on Home
        const {result} = renderHook(() => useFlatNavTabNavigator());
        // The router reads route names only, so the param list it is typed with does not matter here.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const originalRouter = TabRouter({backBehavior: 'fullHistory'}) as unknown as Router<TabNavigationState<TabNavigatorParamList>, NavigationAction>;
        const router = {...originalRouter, ...result.current.tabRouterOverride(originalRouter)};
        const options = buildRouterOptions(FLAT_NAV_ROUTE_NAMES);
        const state = originalRouter.getInitialState(options);

        // When the native bar navigates to the Expenses placeholder and something jumps to More
        const afterNavigate = router.getStateForAction(state, CommonActions.navigate(SCREENS.NATIVE_TAB_ITEM.EXPENSES), options);
        const afterJump = router.getStateForAction(state, TabActions.jumpTo(SCREENS.NATIVE_TAB_ITEM.MORE), options);
        // And something navigates to Inbox
        const afterInbox = router.getStateForAction(state, CommonActions.navigate(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR), options);

        // Then the placeholders are swallowed with the state left as it is, so they are never focused nor in the history,
        // while every other navigation still works
        expect(afterNavigate).toBe(state);
        expect(afterJump).toBe(state);
        expect(afterInbox?.routes.at(afterInbox.index ?? 0)?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    });
});

describe('TabRouter with placeholders registered by the beta', () => {
    it('keeps the focused tab when the beta adds or removes the placeholders', () => {
        // Given the tab router focused on Search without the beta
        const router = TabRouter({backBehavior: 'fullHistory'});
        const defaultOptions = buildRouterOptions(DEFAULT_ROUTE_NAMES);
        const initialState = router.getInitialState(defaultOptions);
        const searchState = router.getStateForAction(initialState, CommonActions.navigate(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR), defaultOptions);
        if (searchState?.stale !== false) {
            throw new Error('No tab state');
        }

        // When the beta registers the placeholders and later removes them
        const withPlaceholders = router.getStateForRouteNamesChange(searchState, {...buildRouterOptions(FLAT_NAV_ROUTE_NAMES), routeKeyChanges: []});
        if (withPlaceholders.stale !== false) {
            throw new Error('No realized tab state');
        }
        const withoutPlaceholders = router.getStateForRouteNamesChange(withPlaceholders, {...defaultOptions, routeKeyChanges: []});

        // Then Search stays focused with the same route key both ways, since the router matches routes by name and not by position
        const searchRouteKey = searchState.routes.find((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)?.key;
        expect(withPlaceholders.routes.at(withPlaceholders.index)?.key).toBe(searchRouteKey);
        expect(withoutPlaceholders.routes.at(withoutPlaceholders.index ?? 0)?.key).toBe(searchRouteKey);
        expect(withoutPlaceholders.routes.map((route) => route.name)).toEqual(DEFAULT_ROUTE_NAMES);
    });

    it('rehydrates a deep link state built for the six tabs with the placeholders added', () => {
        // Given a partial state with the six tabs of TAB_SCREENS focused on Workspaces, as getAdaptedStateFromPath builds it
        const router = TabRouter({backBehavior: 'fullHistory'});
        const partialState = {index: 4, routes: DEFAULT_ROUTE_NAMES.map((name) => ({name}))};

        // When it is rehydrated with the beta on
        const state = router.getRehydratedState(partialState, buildRouterOptions(FLAT_NAV_ROUTE_NAMES));

        // Then Workspaces is still the focused tab, so the placeholders inserted before it do not shift the focus
        expect(state.routes.at(state.index)?.name).toBe(NAVIGATORS.WORKSPACE_NAVIGATOR);
        expect(state.routes.map((route) => route.name)).toEqual(FLAT_NAV_ROUTE_NAMES);
    });
});
