import {act, fireEvent, render, screen} from '@testing-library/react-native';

import MoreMenuPopover from '@components/Navigation/MoreMenu/MoreMenuPopover';
import type {MoreMenuPopoverProps} from '@components/Navigation/MoreMenu/MoreMenuPopover';
import {PressableWithoutFeedback} from '@components/Pressable';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FlatNavTabPressListeners from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/FlatNavTabPressListeners';
import type {NativeTabLayoutProps} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NativeTabLayout';
import {navigateToSpendTab} from '@libs/SearchNavigationUtils';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Navigation/MoreMenu/MoreMenuPopover', () => jest.fn(() => null));
jest.mock('@components/Search/SearchContext', () => ({useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()})}));
jest.mock('@libs/SearchNavigationUtils', () => ({navigateToSpendTab: jest.fn()}));
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

// What the navigation reports at the moment of a press, which can be ahead of the last render
let liveFocusedRouteName: string = SCREENS.HOME;
let liveSearchKey: string | undefined;

function buildProps(focusedRouteName: string): Pick<NativeTabLayoutProps, 'state' | 'descriptors'> {
    const routes = ROUTE_NAMES.map((name) => ({key: `${name}-key`, name}));
    return {
        state: createMock<NativeTabLayoutProps['state']>({routes, index: ROUTE_NAMES.indexOf(focusedRouteName)}),
        descriptors: Object.fromEntries(
            routes.map((route) => [
                route.key,
                createMock<NativeTabLayoutProps['descriptors'][string]>({
                    navigation: createMock<NativeTabLayoutProps['descriptors'][string]['navigation']>({
                        addListener: jest.fn((type: string, listener: () => void) => {
                            pressListeners.set(route.name, listener);
                            return () => pressListeners.delete(route.name);
                        }),
                        isFocused: () => liveFocusedRouteName === route.name,
                        getState: () =>
                            createMock<ReturnType<NativeTabLayoutProps['descriptors'][string]['navigation']['getState']>>({
                                routes: [
                                    {
                                        name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                        state: {routes: [{name: SCREENS.SEARCH.ROOT, params: {q: 'type:expense', searchKey: liveSearchKey}}]},
                                    },
                                ],
                            }),
                    }),
                }),
            ]),
        ),
    };
}

function MenuMock({isVisible, onClose, onModalHide}: MoreMenuPopoverProps) {
    return isVisible ? (
        <View testID="MoreMenu">
            <PressableWithoutFeedback
                testID="CloseMoreMenu"
                accessibilityLabel="Close"
                onPress={onClose}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />
        </View>
    ) : (
        <PressableWithoutFeedback
            testID="HideMoreMenu"
            accessibilityLabel="Hide"
            onPress={onModalHide}
            sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
        />
    );
}

async function renderListeners(focusedRouteName: string, searchKey?: string) {
    liveFocusedRouteName = focusedRouteName;
    liveSearchKey = searchKey;
    const props = buildProps(focusedRouteName);
    render(
        <FlatNavTabPressListeners
            state={props.state}
            descriptors={props.descriptors}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

function press(routeName: string) {
    act(() => {
        pressListeners.get(routeName)?.();
    });
}

describe('FlatNavTabPressListeners', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        pressListeners.clear();
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

    it('switches the section of a focused Search without starting the tab spans', async () => {
        // Given Search focused on a Reports search
        await renderListeners(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.APPROVE);

        // When the user presses Expenses
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);

        // Then Search opens Expenses, with no tab span, since no tab is opened
        expect(navigateToSpendTab).toHaveBeenCalledWith(CONST.SEARCH.SEARCH_KEYS.EXPENSES, undefined, expect.any(Function));
        expect(startNavigateToReportsTabSpans).not.toHaveBeenCalled();
    });

    it('does nothing when the item of the search Search already shows is pressed again', async () => {
        // Given Search focused on the Expenses search
        await renderListeners(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.EXPENSES);

        // When the user presses Expenses again
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);

        // Then JS does not navigate, as for a tab pressed on itself, and leaves the repeated selection to the native bar
        expect(navigateToSpendTab).not.toHaveBeenCalled();
    });

    it('opens Expenses from a search drawn in the Expenses item that is not the Expenses search', async () => {
        // Given Search focused on Trips, which has no item of its own and so is drawn inside Expenses
        await renderListeners(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, CONST.SEARCH.SEARCH_KEYS.TRIPS);

        // When the user presses Expenses
        press(SCREENS.NATIVE_TAB_ITEM.EXPENSES);

        // Then Search opens the Expenses search, since the tap asks for a search Search is not showing
        expect(navigateToSpendTab).toHaveBeenCalledWith(CONST.SEARCH.SEARCH_KEYS.EXPENSES, undefined, expect.any(Function));
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

    it('mounts the More menu only while it is shown or closing', async () => {
        // Given Home focused, with the More menu never opened
        jest.mocked(MoreMenuPopover).mockImplementation(MenuMock);
        await renderListeners(SCREENS.HOME);

        // Then the menu is not mounted, so it reads none of its data before the user asks for it
        expect(MoreMenuPopover).not.toHaveBeenCalled();

        // When the user presses More
        press(SCREENS.NATIVE_TAB_ITEM.MORE);

        // Then the menu opens for the focused tab, after the sign-in check
        expect(interceptAnonymousUser).toHaveBeenCalledTimes(1);
        expect(jest.mocked(MoreMenuPopover).mock.calls.at(-1)?.[0]).toMatchObject({isVisible: true, focusedTabRouteName: SCREENS.HOME});

        // When the menu is closed and has finished its closing animation
        fireEvent.press(screen.getByTestId('CloseMoreMenu'));
        fireEvent.press(screen.getByTestId('HideMoreMenu'));

        // Then it is unmounted, so its subscriptions stop until the next opening
        expect(screen.queryByTestId('HideMoreMenu')).toBeNull();
        expect(screen.queryByTestId('MoreMenu')).toBeNull();
    });

    it('keeps the More menu open when it is opened again while closing', async () => {
        // Given the More menu opened and then closed, with the hide callback of that first menu kept, as Android hands
        // over the callback of the render where the closing animation started
        jest.mocked(MoreMenuPopover).mockImplementation(MenuMock);
        await renderListeners(SCREENS.HOME);
        press(SCREENS.NATIVE_TAB_ITEM.MORE);
        fireEvent.press(screen.getByTestId('CloseMoreMenu'));
        const staleOnModalHide = jest.mocked(MoreMenuPopover).mock.calls.at(-1)?.[0].onModalHide;

        // When the user opens the menu again before it has finished closing, and only then the old hide callback runs
        press(SCREENS.NATIVE_TAB_ITEM.MORE);
        act(() => {
            staleOnModalHide?.();
        });

        // Then the menu stays mounted and shown, because the callback reads the current state, not the one it was created with
        expect(screen.getByTestId('MoreMenu')).toBeTruthy();
    });
});
