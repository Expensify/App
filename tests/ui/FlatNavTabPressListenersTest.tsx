import {act, render, screen} from '@testing-library/react-native';

import MoreMenuPopover from '@components/Navigation/MoreMenu/MoreMenuPopover';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FlatNavTabPressListeners from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/FlatNavTabPressListeners';
import MoreMenuStateContext, {isMoreItemSelectedByMenu} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/MoreMenuStateContext';
import type {MoreMenuState} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/MoreMenuStateContext';
import type {NativeTabLayoutProps} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NativeTabLayout';
import {navigateToSpendTab, showSpendTabSearchOnMountedSearchPage} from '@libs/SearchNavigationUtils';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React, {useState} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Navigation/MoreMenu/MoreMenuPopover', () => jest.fn(() => null));
jest.mock('@components/Search/SearchContext', () => ({useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()})}));
jest.mock('@libs/SearchNavigationUtils', () => ({navigateToSpendTab: jest.fn(), showSpendTabSearchOnMountedSearchPage: jest.fn()}));
jest.mock('@libs/interceptAnonymousUser', () => jest.fn((callback: () => void) => callback()));
jest.mock('@libs/telemetry/startTabNavigationSpans', () => ({startNavigateToReportsTabSpans: jest.fn()}));
jest.mock('@libs/clearSelectedText/clearSelectedText', () => jest.fn());

const ROUTE_NAMES: string[] = [
    SCREENS.HOME,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    SCREENS.NATIVE_TAB_ITEM.EXPENSES,
    SCREENS.NATIVE_TAB_ITEM.REPORTS,
    SCREENS.NATIVE_TAB_ITEM.MORE,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
];

const LAST_REPORTS_QUERY = 'type:expense-report status:outstanding';

// The tab press listener of each route, as the tab view's event emitter keeps them
const pressListeners = new Map<string, () => void>();
// The state listeners, which the tab navigator calls once it has rendered a new state
const stateListeners = new Set<() => void>();

// What the navigation reports at the moment of a press, which can be ahead of the last render
let liveFocusedRouteName: string = SCREENS.HOME;
let liveSearchKey: string | undefined;
// The params a navigation from another tab hands the Search tab route
let liveSearchTabParams: Record<string, unknown> | undefined;
// The key of the Search navigator's state, which it has once it is mounted
let liveSearchNavigatorStateKey: string | undefined;
// A screen pushed over the Search page in the Search navigator
let liveScreenOverSearchPage: string | undefined;

function buildProps(focusedRouteName: string): Pick<NativeTabLayoutProps, 'state' | 'descriptors'> {
    const routes = ROUTE_NAMES.map((name) => ({key: `${name}-key`, name}));
    return {
        state: createMock<NativeTabLayoutProps['state']>({key: 'tab-state-key', routes, index: ROUTE_NAMES.indexOf(focusedRouteName)}),
        descriptors: Object.fromEntries(
            routes.map((route) => [
                route.key,
                createMock<NativeTabLayoutProps['descriptors'][string]>({
                    navigation: createMock<NativeTabLayoutProps['descriptors'][string]['navigation']>({
                        addListener: jest.fn((type: string, listener: () => void) => {
                            if (type === 'state') {
                                stateListeners.add(listener);
                                return () => stateListeners.delete(listener);
                            }
                            pressListeners.set(route.name, listener);
                            return () => pressListeners.delete(route.name);
                        }),
                        isFocused: () => liveFocusedRouteName === route.name,
                        getState: () =>
                            createMock<ReturnType<NativeTabLayoutProps['descriptors'][string]['navigation']['getState']>>({
                                routes: [
                                    {
                                        name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                        params: liveSearchTabParams,
                                        state: {
                                            key: liveSearchNavigatorStateKey,
                                            // A mounted navigator has a full state, which is no longer stale
                                            ...(liveSearchNavigatorStateKey ? {stale: false} : {}),
                                            routes: [
                                                {name: SCREENS.SEARCH.ROOT, params: {q: 'type:expense', searchKey: liveSearchKey}},
                                                ...(liveScreenOverSearchPage ? [{name: liveScreenOverSearchPage}] : []),
                                            ],
                                        },
                                    },
                                ],
                            }),
                    }),
                }),
            ]),
        ),
    };
}

// Keeps the state of the More menu, as the tab navigator does around its tabs, and marks the bar as showing the More
// item selected the way the navigator decides it
function MoreMenuStateProvider({children}: {children: React.ReactNode}) {
    const moreMenuState = useState<MoreMenuState>('closed');
    return (
        <MoreMenuStateContext.Provider value={moreMenuState}>
            {isMoreItemSelectedByMenu(moreMenuState[0]) && <View testID="MoreItemSelected" />}
            {children}
        </MoreMenuStateContext.Provider>
    );
}

function isMoreItemSelected() {
    return screen.queryByTestId('MoreItemSelected') !== null;
}

async function renderListeners(focusedRouteName: string, searchKey?: string) {
    liveFocusedRouteName = focusedRouteName;
    liveSearchKey = searchKey;
    const props = buildProps(focusedRouteName);
    render(
        <MoreMenuStateProvider>
            <FlatNavTabPressListeners
                state={props.state}
                descriptors={props.descriptors}
            />
        </MoreMenuStateProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

function press(routeName: string) {
    act(() => {
        pressListeners.get(routeName)?.();
    });
}

function getMoreMenuProps() {
    return jest.mocked(MoreMenuPopover).mock.calls.at(-1)?.[0];
}

function MountedMoreMenu() {
    return <View testID="MoreMenu" />;
}

describe('FlatNavTabPressListeners', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        pressListeners.clear();
        stateListeners.clear();
        liveSearchTabParams = undefined;
        liveSearchNavigatorStateKey = undefined;
        liveScreenOverSearchPage = undefined;
        await Onyx.set(ONYXKEYS.SEARCH_FILTERS, {[CONST.SEARCH.SEARCH_KEYS.REPORTS]: {timestamp: '2026-11-10 12:00:00', query: LAST_REPORTS_QUERY}});
    });

    it('opens Search on the Reports search the user last left when Reports is pressed from another tab', async () => {
        // Given Home focused, with a Reports search the user left earlier
        await renderListeners(SCREENS.HOME);

        // When the user presses Reports
        press(SCREENS.NATIVE_TAB_ITEM.REPORTS);

        // Then Search opens on that search, after the sign-in check and with the Spend navigation spans the Spend tab starts
        expect(interceptAnonymousUser).toHaveBeenCalledTimes(1);
        expect(startNavigateToReportsTabSpans).toHaveBeenCalledTimes(1);
        expect(navigateToSpendTab).toHaveBeenCalledWith(CONST.SEARCH.SEARCH_KEYS.REPORTS, LAST_REPORTS_QUERY, expect.any(Function));
    });

    it.each([
        {searchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE, expectedNavigations: [[CONST.SEARCH.SEARCH_KEYS.EXPENSES, undefined, expect.any(Function)]]},
        {searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, expectedNavigations: []},
        {searchKey: CONST.SEARCH.SEARCH_KEYS.TRIPS, expectedNavigations: [[CONST.SEARCH.SEARCH_KEYS.EXPENSES, undefined, expect.any(Function)]]},
    ])('opens Expenses from a focused Search on the $searchKey search only when it shows another search', async ({searchKey, expectedNavigations}) => {
        // Given Search focused on a Reports search, on the Expenses search, or on Trips, which has no item of its own and
        // so is drawn inside Expenses
        await renderListeners(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, searchKey);

        // When the user presses Expenses
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);

        // Then Search opens Expenses unless it already shows it, where the native bar answers the repeated selection by
        // itself, and no tab span starts, since no tab is opened
        expect(jest.mocked(navigateToSpendTab).mock.calls).toEqual(expectedNavigations);
        expect(startNavigateToReportsTabSpans).not.toHaveBeenCalled();
    });

    it.each([
        {focusedRouteName: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, tabStateKeyToFocusSearchIn: undefined},
        {focusedRouteName: SCREENS.HOME, tabStateKeyToFocusSearchIn: 'tab-state-key'},
    ])(
        'changes the search of the mounted Search page instead of opening the route when Reports is pressed from $focusedRouteName',
        async ({focusedRouteName, tabStateKeyToFocusSearchIn}) => {
            // Given the Search navigator mounted with the Search page on top, showing Expenses, and Search or Home focused
            liveSearchNavigatorStateKey = 'search-state-key';
            await renderListeners(focusedRouteName, CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            // When the user presses Reports
            press(SCREENS.NATIVE_TAB_ITEM.REPORTS);

            // Then the mounted page takes the Reports search as params, as its type tabs do, and the Search tab is focused
            // when the press came from another tab, since opening the route would mount a second Search page from scratch
            expect(showSpendTabSearchOnMountedSearchPage).toHaveBeenCalledWith(
                CONST.SEARCH.SEARCH_KEYS.REPORTS,
                LAST_REPORTS_QUERY,
                expect.any(Function),
                expect.objectContaining({key: 'search-state-key'}),
                tabStateKeyToFocusSearchIn,
            );
            expect(navigateToSpendTab).not.toHaveBeenCalled();
        },
    );

    it('opens the search route when another screen is on top of the Search page', async () => {
        // Given the Search navigator mounted with a report pushed over the Search page, which shows Expenses
        liveSearchNavigatorStateKey = 'search-state-key';
        liveScreenOverSearchPage = SCREENS.SEARCH.MONEY_REQUEST_REPORT;
        await renderListeners(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.EXPENSES);

        // When the user presses Reports
        press(SCREENS.NATIVE_TAB_ITEM.REPORTS);

        // Then Reports opens through the search route, since new params would only change the page under the report
        expect(navigateToSpendTab).toHaveBeenCalledWith(CONST.SEARCH.SEARCH_KEYS.REPORTS, LAST_REPORTS_QUERY, expect.any(Function));
        expect(showSpendTabSearchOnMountedSearchPage).not.toHaveBeenCalled();
    });

    it('navigates once on a quick double tap', async () => {
        // Given Home focused
        await renderListeners(SCREENS.HOME);

        // When the user taps Expenses twice before the tab navigator renders again, with the first tap already focusing Search
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);
        liveFocusedRouteName = NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
        liveSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES;
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);

        // Then only the first tap navigates, because the focus is read at the press rather than from the last render
        expect(navigateToSpendTab).toHaveBeenCalledTimes(1);
    });

    it('opens the search of a tap made before Search takes the search of the previous tap once Search takes it', async () => {
        // Given Home focused, where pressing Reports hands Search the Reports search in the tab route params, which Search
        // takes only in its next render
        await renderListeners(SCREENS.HOME);
        jest.mocked(navigateToSpendTab).mockImplementationOnce(() => {
            liveFocusedRouteName = NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
            liveSearchTabParams = {screen: SCREENS.SEARCH.ROOT, params: {searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS}};
        });

        // When the user taps Reports and then Expenses before Search takes the Reports search
        press(SCREENS.NATIVE_TAB_ITEM.REPORTS);
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);

        // Then only Reports navigates for now, since a navigation made now would be overridden by those params
        expect(jest.mocked(navigateToSpendTab).mock.calls.map(([searchKey]) => searchKey)).toEqual([CONST.SEARCH.SEARCH_KEYS.REPORTS]);

        // When Search takes the Reports search and the tab navigator reports its new state
        liveSearchKey = CONST.SEARCH.SEARCH_KEYS.REPORTS;
        act(() => {
            for (const listener of stateListeners) {
                listener();
            }
        });

        // Then Expenses, the last tap, opens, so the bar ends on the item the user tapped last
        expect(jest.mocked(navigateToSpendTab).mock.calls.map(([searchKey]) => searchKey)).toEqual([CONST.SEARCH.SEARCH_KEYS.REPORTS, CONST.SEARCH.SEARCH_KEYS.EXPENSES]);
    });

    it('drops a queued tap when the user left Search before Search took the search of the previous tap', async () => {
        // Given Search opened from Home with the Reports search still in the tab route params, and an Expenses tap queued
        await renderListeners(SCREENS.HOME);
        jest.mocked(navigateToSpendTab).mockImplementationOnce(() => {
            liveFocusedRouteName = NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
            liveSearchTabParams = {screen: SCREENS.SEARCH.ROOT, params: {searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS}};
        });
        press(SCREENS.NATIVE_TAB_ITEM.REPORTS);
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);

        // When the user goes back to Home before the tab navigator reports its new state
        liveFocusedRouteName = SCREENS.HOME;
        act(() => {
            for (const listener of stateListeners) {
                listener();
            }
        });

        // Then the queued Expenses tap is not replayed, so the user is not pulled back to Search
        expect(jest.mocked(navigateToSpendTab).mock.calls.map(([searchKey]) => searchKey)).toEqual([CONST.SEARCH.SEARCH_KEYS.REPORTS]);
    });

    it('opens the search of a tap made from another tab the user went to before Search took the search of the previous tap', async () => {
        // Given Search opened from Home with the Reports search still in the tab route params
        await renderListeners(SCREENS.HOME);
        jest.mocked(navigateToSpendTab).mockImplementationOnce(() => {
            liveFocusedRouteName = NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
            liveSearchTabParams = {screen: SCREENS.SEARCH.ROOT, params: {searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS}};
        });
        press(SCREENS.NATIVE_TAB_ITEM.REPORTS);

        // When the user goes back to Home and taps Expenses before the tab navigator reports its new state
        liveFocusedRouteName = SCREENS.HOME;
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);

        // Then Expenses opens right away, because a tap queued behind the Reports navigation would be dropped once the
        // user is no longer on Search
        expect(jest.mocked(navigateToSpendTab).mock.calls.map(([searchKey]) => searchKey)).toEqual([CONST.SEARCH.SEARCH_KEYS.REPORTS, CONST.SEARCH.SEARCH_KEYS.EXPENSES]);
    });

    it('mounts the More menu only while it is shown or closing', async () => {
        // Given Home focused, with the More menu never opened
        jest.mocked(MoreMenuPopover).mockImplementation(MountedMoreMenu);
        await renderListeners(SCREENS.HOME);

        // Then the menu is not mounted, so it reads none of its data before the user asks for it
        expect(MoreMenuPopover).not.toHaveBeenCalled();

        // When the user presses More
        press(SCREENS.NATIVE_TAB_ITEM.MORE);

        // Then the menu opens for the focused tab, after the sign-in check
        expect(interceptAnonymousUser).toHaveBeenCalledTimes(1);
        expect(getMoreMenuProps()).toMatchObject({isVisible: true, focusedTabRouteName: SCREENS.HOME});

        // When the menu is closed and has finished its closing animation
        act(() => getMoreMenuProps()?.onClose());
        act(() => getMoreMenuProps()?.onModalHide());

        // Then it is unmounted, so its subscriptions stop until the next opening
        expect(screen.queryByTestId('MoreMenu')).toBeNull();
    });

    it('keeps the More menu open when it is opened again while closing', async () => {
        // Given the More menu opened and then closed, with the hide callback of that first menu kept, as Android hands
        // over the callback of the render where the closing animation started
        jest.mocked(MoreMenuPopover).mockImplementation(MountedMoreMenu);
        await renderListeners(SCREENS.HOME);
        press(SCREENS.NATIVE_TAB_ITEM.MORE);
        act(() => getMoreMenuProps()?.onClose());
        const staleOnModalHide = getMoreMenuProps()?.onModalHide;

        // When the user opens the menu again before it has finished closing, and only then the old hide callback runs
        press(SCREENS.NATIVE_TAB_ITEM.MORE);
        act(() => {
            staleOnModalHide?.();
        });

        // Then the menu stays mounted and shown, because the callback reads the current state, not the one it was created with
        expect(screen.getByTestId('MoreMenu')).toBeTruthy();
        expect(getMoreMenuProps()?.isVisible).toBe(true);
    });

    it('keeps the More item selected only until the menu starts closing when the user picks nothing', async () => {
        // Given Home focused with the More menu closed, so the bar shows Home as selected
        await renderListeners(SCREENS.HOME);
        expect(isMoreItemSelected()).toBe(false);

        // When the user presses More
        press(SCREENS.NATIVE_TAB_ITEM.MORE);

        // Then the menu keeps the More item selected
        expect(isMoreItemSelected()).toBe(true);

        // When the user closes the menu without a pick, as a tap outside it or the back button does
        act(() => getMoreMenuProps()?.onClose());

        // Then the selection goes back to the tab the user is on at once, without waiting for the menu to finish closing
        expect(getMoreMenuProps()?.isVisible).toBe(false);
        expect(isMoreItemSelected()).toBe(false);
    });

    it('keeps the More item selected after a pick until the menu has closed', async () => {
        // Given Home focused with the More menu open
        await renderListeners(SCREENS.HOME);
        press(SCREENS.NATIVE_TAB_ITEM.MORE);

        // When the user picks an entry, which the menu reports before the close every pick is followed by
        act(() => {
            getMoreMenuProps()?.onItemPicked();
            getMoreMenuProps()?.onClose();
        });

        // Then the menu closes with the More item still selected, since the entry opens under More only once the menu
        // has closed and the selection would otherwise go back to Home in between
        expect(getMoreMenuProps()?.isVisible).toBe(false);
        expect(isMoreItemSelected()).toBe(true);

        // When the menu has finished closing
        act(() => getMoreMenuProps()?.onModalHide());

        // Then the menu no longer holds the selection, which now follows the tab the picked entry opened
        expect(isMoreItemSelected()).toBe(false);
    });
});
