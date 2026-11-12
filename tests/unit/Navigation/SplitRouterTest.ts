import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import SplitRouter from '@libs/Navigation/AppNavigator/createSplitNavigator/SplitRouter';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {ParamListBase, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';

import {CommonActions} from '@react-navigation/native';

jest.mock('@libs/getIsNarrowLayout', () => jest.fn(() => true));

const mockGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);

const CONFIG_OPTIONS: RouterConfigOptions = {
    routeNames: [SCREENS.INBOX, SCREENS.REPORT],
    routeParamList: {},
    routeGetIdList: {},
};

const router = SplitRouter({
    sidebarScreen: SCREENS.INBOX,
    defaultCentralScreen: SCREENS.REPORT,
    parentRoute: {key: 'reports-split-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
});

function makeState(routeNames: string[]): StackNavigationState<ParamListBase> {
    return {
        key: 'split-test',
        index: routeNames.length - 1,
        routeNames: [SCREENS.INBOX, SCREENS.REPORT],
        routes: routeNames.map((name, index) => ({key: `${name}-${index}`, name})),
        type: 'stack',
        stale: false,
        preloadedRoutes: [],
    };
}

describe('SplitRouter', () => {
    describe('navigating to the sidebar screen on narrow layout', () => {
        beforeEach(() => {
            mockGetIsNarrowLayout.mockReturnValue(true);
        });

        it('returns the current state when the sidebar is the only screen', () => {
            // Given a split navigator that only shows the sidebar, as it does after the Reports tab is preloaded
            const state = makeState([SCREENS.INBOX]);

            // When something navigates to the sidebar screen again, for example tapping the Inbox tab
            const result = router.getStateForAction(state, CommonActions.navigate(SCREENS.INBOX), CONFIG_OPTIONS);

            // Then the router reports the action as handled with no change, instead of returning null, which React Navigation reports as params it couldn't apply
            expect(result).toBe(state);
        });

        it('pops back to the sidebar when a central screen is on top', () => {
            // Given a split navigator with a report opened on top of the sidebar
            const state = makeState([SCREENS.INBOX, SCREENS.REPORT]);

            // When something navigates to the sidebar screen
            const result = router.getStateForAction(state, CommonActions.navigate(SCREENS.INBOX), CONFIG_OPTIONS);

            // Then the router still pops to the sidebar, so the fallback only applies when there is nothing to pop
            expect(result?.index).toBe(0);
            expect(result?.routes.map((route) => route.name)).toEqual([SCREENS.INBOX]);
        });
    });
});
