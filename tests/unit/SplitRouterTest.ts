import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import SplitRouter from '@libs/Navigation/AppNavigator/createSplitNavigator/SplitRouter';

import SCREENS from '@src/SCREENS';

import type {ParamListBase, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';

import {CommonActions} from '@react-navigation/native';

jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);

const ROUTE_NAMES = [SCREENS.INBOX, SCREENS.REPORT];

const CONFIG_OPTIONS: RouterConfigOptions = {
    routeNames: ROUTE_NAMES,
    routeParamList: {},
    routeGetIdList: {},
};

const router = SplitRouter({
    sidebarScreen: SCREENS.INBOX,
    defaultCentralScreen: SCREENS.REPORT,
    parentRoute: {key: 'ReportsSplitNavigator-key', name: 'ReportsSplitNavigator'},
});

function buildState(routeNames: string[]): StackNavigationState<ParamListBase> {
    return {
        stale: false,
        type: 'stack',
        key: 'stack-key',
        index: routeNames.length - 1,
        routeNames: ROUTE_NAMES,
        preloadedRoutes: [],
        routes: routeNames.map((name) => ({key: `${name}-key`, name})),
    };
}

describe('SplitRouter', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
    });

    it('handles navigating to the sidebar on a narrow layout when the sidebar is already the only screen', () => {
        // Given a narrow layout split navigator that shows only its sidebar, as the Inbox tab does at its chat list
        const state = buildState([SCREENS.INBOX]);

        // When the sidebar is navigated to again, which happens when the tab's navigation params are applied to an already mounted navigator
        const result = router.getStateForAction(state, CommonActions.navigate(SCREENS.INBOX, undefined, {pop: true}), CONFIG_OPTIONS);

        // Then the action is handled without changes, because an unhandled (null) result makes React Navigation log an error and ignore the navigation
        expect(result).toBe(state);
    });

    it('pops back to the sidebar on a narrow layout when a central screen is on top of it', () => {
        // Given a narrow layout split navigator with a report opened over the sidebar
        const state = buildState([SCREENS.INBOX, SCREENS.REPORT]);

        // When the sidebar is navigated to
        const result = router.getStateForAction(state, CommonActions.navigate(SCREENS.INBOX, undefined, {pop: true}), CONFIG_OPTIONS);

        // Then the report is popped so the sidebar is the only screen left
        expect(result?.index).toBe(0);
        expect(result?.routes.map((route) => route.name)).toEqual([SCREENS.INBOX]);
    });

    it('keeps the central screen on a wide layout when the sidebar is navigated to', () => {
        // Given a wide layout split navigator, where the sidebar is drawn next to the report opened over it
        mockedGetIsNarrowLayout.mockReturnValue(false);
        const state = buildState([SCREENS.INBOX, SCREENS.REPORT]);

        // When the sidebar is navigated to
        const result = router.getStateForAction(state, CommonActions.navigate(SCREENS.INBOX, undefined, {pop: true}), CONFIG_OPTIONS);

        // Then nothing changes, because the sidebar is already visible and popping would close the report next to it
        expect(result).toBe(state);
    });
});
