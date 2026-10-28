import {render} from '@testing-library/react-native';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getPlatform from '@libs/getPlatform';
import SearchTabPreload from '@libs/Navigation/AppNavigator/SearchTabPreload';
import {Scheduler} from '@libs/Scheduler';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const TAB_NAVIGATOR_KEY = 'tab-1';

const mockNavigationDispatch = jest.fn<void, unknown[]>();
const mockGetRootState = jest.fn<NavigationState | undefined, []>(() => undefined);

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: () => mockGetRootState(),
        dispatch: (...args: unknown[]) => mockNavigationDispatch(...args),
    },
}));

jest.mock('@libs/getIsNarrowLayout', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'web'),
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: jest.fn(),
}));

function buildRootState(focusedTabIndex = 0, preloadedRouteKeys: string[] = []): NavigationState {
    // A tab navigator state carries `preloadedRouteKeys`, which the generic root state type does not list.
    const tabState = {
        key: TAB_NAVIGATOR_KEY,
        index: focusedTabIndex,
        preloadedRouteKeys,
        routes: [
            {name: SCREENS.HOME, key: 'home-1'},
            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, key: 'reports-1'},
            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, key: 'search-1'},
        ],
    };
    return {
        key: 'root',
        index: 0,
        routeNames: [NAVIGATORS.TAB_NAVIGATOR],
        stale: false as const,
        type: 'stack',
        routes: [{key: 'tab-route', name: NAVIGATORS.TAB_NAVIGATOR, state: tabState}],
    };
}

/** Renders the preload once the app has loaded on the given tab navigator state, running the idle task right away. */
async function renderAtIdle(focusedTabIndex?: number, preloadedRouteKeys?: string[]) {
    mockGetRootState.mockReturnValue(buildRootState(focusedTabIndex, preloadedRouteKeys));
    render(
        <SearchTabPreload
            isLoadingApp={false}
            tabNavigatorStateKey={TAB_NAVIGATOR_KEY}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

function expectNoSpendPreload() {
    expect(mockNavigationDispatch).not.toHaveBeenCalledWith(expect.objectContaining({payload: expect.objectContaining({name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR})}));
}

describe('SearchTabPreload', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(Scheduler, 'scheduleWhenIdle').mockImplementation((callback) => {
            callback();
            return {cancel: jest.fn()};
        });
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
        jest.mocked(getIsNarrowLayout).mockReturnValue(false);
    });

    const savedQueryJSON = buildSearchQueryJSON('type:expense status:drafts');

    it.each([
        ['the default Expenses query when nothing was saved', undefined, buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE}), CONST.SEARCH.SEARCH_KEYS.EXPENSES],
        [
            'the last saved Spend query',
            {queryJSON: savedQueryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT},
            savedQueryJSON ? buildSearchQueryString(savedQueryJSON) : '',
            CONST.SEARCH.SEARCH_KEYS.SUBMIT,
        ],
    ])('preloads the Spend tab with %s', async (_description, lastSearchParams, expectedQuery, expectedSearchKey) => {
        // Given the app finished loading on Home, with the Spend tab neither focused nor built yet
        if (lastSearchParams) {
            await Onyx.set(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, lastSearchParams);
        }

        // When the app goes idle
        await renderAtIdle();

        // Then the Spend tab is preloaded with the exact query a tab tap would open, so the tap reveals that screen instead of building a new one
        expect(mockNavigationDispatch).toHaveBeenCalledWith({
            type: 'PRELOAD',
            payload: {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, params: {screen: SCREENS.SEARCH.ROOT, params: {q: expectedQuery, searchKey: expectedSearchKey}}},
            target: TAB_NAVIGATOR_KEY,
        });

        // And the background build is timed, so production shows what the preload costs
        expect(jest.mocked(startSpan)).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB, expect.objectContaining({name: CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB}));
    });

    it('does not preload the Spend tab when it is the focused tab', async () => {
        // Given the user is already on the Spend tab, so its screen is the one on display
        const searchTabIndex = 2;

        // When the app goes idle
        await renderAtIdle(searchTabIndex);

        // Then nothing is preloaded, because preloading the focused tab would only drop its freeze with nothing to warm
        expectNoSpendPreload();
    });

    it('does not preload the Spend tab again while its first preload is still mounting', async () => {
        // Given the Spend tab is already preloaded, but its screens have not mounted, so its route has no state yet
        const preloadedRouteKeys = ['search-1'];

        // When the idle task runs again
        await renderAtIdle(undefined, preloadedRouteKeys);

        // Then no second preload or second span goes out
        expectNoSpendPreload();
        expect(jest.mocked(startSpan)).not.toHaveBeenCalled();
    });

    it('does not preload the Spend tab in a narrow window', async () => {
        // Given a desktop browser window narrow enough for the narrow Search page, which would build only its placeholder list while hidden
        jest.mocked(getIsNarrowLayout).mockReturnValue(true);

        // When the app goes idle on Home
        await renderAtIdle();

        // Then the Spend tab is not preloaded
        expectNoSpendPreload();
    });

    it.each([CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID, CONST.PLATFORM.MOBILE_WEB])('does not preload the Spend tab on %s', async (platform) => {
        // Given the app runs outside a desktop browser, where the native tab bar already mounts every tab and the cost on a phone CPU is unmeasured
        jest.mocked(getPlatform).mockReturnValue(platform);

        // When the app goes idle on Home
        await renderAtIdle();

        // Then the Spend tab is not preloaded
        expectNoSpendPreload();
    });
});
