import {renderHook} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {getFlatNavTabHostRouteName} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/nativeTabItemUtils';
import useIsNativeFlatNavTabBarEnabled from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsNativeFlatNavTabBarEnabled';
import useNativeFlatNavSearchSection from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeFlatNavSearchSection';
import useNativeTabNavigator from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabNavigator';
import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {SaveSearch} from '@src/types/onyx';

import type {NavigationAction, Router, TabNavigationState} from '@react-navigation/native';

import {CommonActions, TabActions, TabRouter} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockInboxDotColor = '#00ff00';
const mockWorkspacesDotColor = '#ff0000';
const SAVED_SEARCH_ID = '123';
const SAVED_SEARCH_KEY: SearchKey = `${CONST.SEARCH.SAVED_SEARCH_PREFIX}${SAVED_SEARCH_ID}`;
const SAVED_SEARCHES: SaveSearch = {[SAVED_SEARCH_ID]: {name: 'Mine', query: 'type:expense'}};
const SAVED_SEARCHES_PENDING_DELETE: SaveSearch = {[SAVED_SEARCH_ID]: {name: 'Mine', query: 'type:expense', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}};

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
    return {
        ...actual,
        useNavigation: () => ({getParent: () => undefined}),
        useRoute: () => ({key: 'tab-navigator-route'}),
        useNavigationState: (selector: (state: unknown) => unknown) => selector({index: 0, routes: [{key: 'tab-navigator-route', name: 'TabNavigator'}]}),
    };
});
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/usePermissions', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (path: string) => path}));
jest.mock('@hooks/useInboxTabIndicatorStatus', () => () => ({indicatorColor: mockInboxDotColor}));
jest.mock('@hooks/useWorkspacesTabIndicatorStatus', () => () => ({indicatorColor: mockWorkspacesDotColor, status: 'hasPolicyErrors'}));
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

function buildRouterOptions(routeNames: string[]) {
    return {routeNames, routeParamList: {}, routeGetIdList: {}};
}

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    mockFlatNav({isBetaEnabled: true, shouldUseNarrowLayout: true});
    jest.mocked(useNetwork).mockReturnValue({isOffline: false});
    await Onyx.clear();
});

describe('useNativeTabNavigator', () => {
    it.each([
        {
            isFlatNavTabBarEnabled: false,
            expectedTabLabels: {
                [SCREENS.HOME]: 'common.home',
                [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: 'common.inbox',
                [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: 'common.spend',
                [SCREENS.INSIGHTS]: 'common.insights',
                [NAVIGATORS.WORKSPACE_NAVIGATOR]: 'common.workspacesTabTitle',
            },
            expectedDotColors: {[NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: mockInboxDotColor, [NAVIGATORS.WORKSPACE_NAVIGATOR]: mockWorkspacesDotColor},
        },
        {
            isFlatNavTabBarEnabled: true,
            expectedTabLabels: {
                [SCREENS.HOME]: 'common.home',
                [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: 'common.inbox',
                [SCREENS.NATIVE_TAB_ITEM.EXPENSES]: 'common.expenses',
                [SCREENS.NATIVE_TAB_ITEM.REPORTS]: 'common.reports',
                [SCREENS.NATIVE_TAB_ITEM.MORE]: 'common.more',
            },
            expectedDotColors: {[NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: mockInboxDotColor, [SCREENS.NATIVE_TAB_ITEM.MORE]: mockWorkspacesDotColor},
        },
    ])('labels exactly the five items of the bar with the flat nav bar $isFlatNavTabBarEnabled', ({isFlatNavTabBarEnabled, expectedTabLabels, expectedDotColors}) => {
        // Given the bar with or without the flat nav items

        // When the native tab navigator is configured
        const {result} = renderHook(() => useNativeTabNavigator({isFlatNavTabBarEnabled}));

        // Then only the five items in the bar get a label, since iOS sizes each label by the number of labels and a tab
        // without a label has no item
        expect(result.current.tabLabels).toEqual(expectedTabLabels);
        // And the Workspaces dot sits on the item Workspaces is reached from
        expect(result.current.dotColors).toEqual(expectedDotColors);
    });

    it('never focuses a placeholder, whatever navigates to it', () => {
        // Given the tab router with the flat nav routes, focused on Home
        const {result} = renderHook(() => useNativeTabNavigator({isFlatNavTabBarEnabled: true}));
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

describe('useNativeFlatNavSearchSection', () => {
    type SearchSectionCase = {
        description: string;
        searchKey: SearchKey | undefined;
        isSearchFocused: boolean;
        storedSearchKey?: typeof CONST.SEARCH.SEARCH_KEYS.REPORTS;
        savedSearches?: SaveSearch;
        isOffline?: boolean;
        expectedSection: FlatNavSectionID | undefined;
    };

    const searchSectionCases: SearchSectionCase[] = [
        {description: 'takes the section of the shown search', searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, isSearchFocused: true, expectedSection: FLAT_NAV.SECTION.EXPENSES},
        {description: 'takes the section of a to-do search', searchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE, isSearchFocused: true, expectedSection: FLAT_NAV.SECTION.REPORTS},
        {
            description: 'takes Saved for a saved search',
            searchKey: SAVED_SEARCH_KEY,
            isSearchFocused: true,
            savedSearches: SAVED_SEARCHES,
            expectedSection: FLAT_NAV.SECTION.SAVED,
        },
        {
            description: 'takes no section for a saved search while the Saved section is hidden online',
            searchKey: SAVED_SEARCH_KEY,
            isSearchFocused: true,
            savedSearches: SAVED_SEARCHES_PENDING_DELETE,
            expectedSection: undefined,
        },
        {
            description: 'takes Saved for a saved search waiting to be deleted offline',
            searchKey: SAVED_SEARCH_KEY,
            isSearchFocused: true,
            savedSearches: SAVED_SEARCHES_PENDING_DELETE,
            isOffline: true,
            expectedSection: FLAT_NAV.SECTION.SAVED,
        },
        {
            description: 'takes the section of the stored search before Search is shown',
            searchKey: undefined,
            isSearchFocused: false,
            storedSearchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS,
            expectedSection: FLAT_NAV.SECTION.REPORTS,
        },
        {
            description: 'ignores the stored search once Search is shown',
            searchKey: undefined,
            isSearchFocused: true,
            storedSearchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS,
            expectedSection: undefined,
        },
    ];

    it.each(searchSectionCases)('$description', async ({searchKey, isSearchFocused, storedSearchKey, savedSearches, isOffline = false, expectedSection}) => {
        // Given the stored search Search opens on first, the saved searches and the network
        if (storedSearchKey) {
            await Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {
                queryJSON: buildSearchQueryJSON(buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})),
                searchKey: storedSearchKey,
            });
        }
        if (savedSearches) {
            await Onyx.set(ONYXKEYS.SAVED_SEARCHES, savedSearches);
        }
        jest.mocked(useNetwork).mockReturnValue({isOffline});

        // When the section of the search the Search tab shows is resolved
        const {result} = renderHook(() => useNativeFlatNavSearchSection({searchKey, isSearchFocused}));
        await waitForBatchedUpdates();

        // Then it is the section the bar highlights: the stored search only until Search is shown, so Search does not move
        // to another item when it mounts, and Saved only while the Spend menu shows saved searches
        expect(result.current).toBe(expectedSection);
    });
});

describe('getFlatNavTabHostRouteName', () => {
    it.each([
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.EXPENSES, SCREENS.NATIVE_TAB_ITEM.EXPENSES],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.REPORTS, SCREENS.NATIVE_TAB_ITEM.REPORTS],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, FLAT_NAV.SECTION.ACCOUNTING, SCREENS.NATIVE_TAB_ITEM.MORE],
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, undefined, SCREENS.NATIVE_TAB_ITEM.EXPENSES],
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, undefined, undefined],
    ])('draws %s with the section %s inside %s', (routeName, sectionID, expectedHostRouteName) => {
        // Given a hidden tab route and the section of the search Search shows

        // When its host is resolved
        const hostRouteName = getFlatNavTabHostRouteName(routeName, sectionID);

        // Then Search is drawn inside the placeholder of its section, Expenses with no section, and Account, which has no
        // slot, inside no placeholder
        expect(hostRouteName).toBe(expectedHostRouteName);
    });
});

describe('useIsNativeFlatNavTabBarEnabled', () => {
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
});

describe('TabRouter with placeholders registered by the beta', () => {
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
