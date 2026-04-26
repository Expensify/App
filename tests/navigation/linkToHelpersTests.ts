import type {NavigationState, PartialState} from '@react-navigation/native';
import {getActiveScreenInRoute, isSwitchingTabsWithinTabNavigator, shouldChangeToMatchingFullScreen} from '@libs/Navigation/helpers/linkTo';
import type {NavigationPartialRoute, RootNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

function makeRootState(routes: Array<{name: string; key?: string}>): NavigationState<RootNavigatorParamList> {
    return {
        routes: routes.map((r, i) => ({name: r.name, key: r.key ?? `k-${i}`, params: undefined})),
        index: routes.length - 1,
        key: 'root',
        routeNames: routes.map((r) => r.name),
        stale: false,
        type: 'stack',
    } as unknown as NavigationState<RootNavigatorParamList>;
}

function makePartialState(routes: Array<{name: string}>): PartialState<NavigationState<RootNavigatorParamList>> {
    return {
        routes: routes.map((r) => ({name: r.name})),
    } as PartialState<NavigationState<RootNavigatorParamList>>;
}

describe('isSwitchingTabsWithinTabNavigator', () => {
    it('returns true when both last full-screen routes are TAB_NAVIGATOR', () => {
        const current = makeRootState([{name: NAVIGATORS.TAB_NAVIGATOR}]);
        const target = makePartialState([{name: NAVIGATORS.TAB_NAVIGATOR}]);
        expect(isSwitchingTabsWithinTabNavigator(current, target)).toBe(true);
    });

    it('returns false when only current is TAB_NAVIGATOR', () => {
        const current = makeRootState([{name: NAVIGATORS.TAB_NAVIGATOR}]);
        const target = makePartialState([{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);
        expect(isSwitchingTabsWithinTabNavigator(current, target)).toBe(false);
    });

    it('returns false when neither has TAB_NAVIGATOR', () => {
        const current = makeRootState([{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);
        const target = makePartialState([{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);
        expect(isSwitchingTabsWithinTabNavigator(current, target)).toBe(false);
    });

    it('returns true when TAB_NAVIGATOR is last full-screen among mixed routes', () => {
        const current = makeRootState([{name: NAVIGATORS.TAB_NAVIGATOR}, {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);
        const target = makePartialState([{name: NAVIGATORS.TAB_NAVIGATOR}]);
        // TAB_NAVIGATOR is the last full-screen in current (RHP is not full-screen)
        expect(isSwitchingTabsWithinTabNavigator(current, target)).toBe(true);
    });

    it('returns false when target state has no routes', () => {
        const current = makeRootState([{name: NAVIGATORS.TAB_NAVIGATOR}]);
        const target = {routes: undefined} as unknown as PartialState<NavigationState<RootNavigatorParamList>>;
        expect(isSwitchingTabsWithinTabNavigator(current, target)).toBe(false);
    });
});

describe('getActiveScreenInRoute', () => {
    it('returns tab at state.index for TAB_NAVIGATOR route', () => {
        const route: NavigationPartialRoute = {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {
                routes: [{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
                index: 1,
            },
        };
        expect(getActiveScreenInRoute(route)).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    });

    it('falls back to index 0 when state.index is undefined', () => {
        const route: NavigationPartialRoute = {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {
                routes: [{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
            },
        };
        expect(getActiveScreenInRoute(route)).toBe(SCREENS.HOME);
    });

    it('returns last nested route name for non-TAB routes', () => {
        const route: NavigationPartialRoute = {
            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
            state: {
                routes: [{name: SCREENS.SETTINGS.ROOT}, {name: SCREENS.SETTINGS.PROFILE.ROOT}],
            },
        };
        expect(getActiveScreenInRoute(route)).toBe(SCREENS.SETTINGS.PROFILE.ROOT);
    });

    it('returns undefined when route has no state and is not TAB', () => {
        const route: NavigationPartialRoute = {
            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
        };
        expect(getActiveScreenInRoute(route)).toBeUndefined();
    });

    it('returns undefined for non-TAB route with empty routes array', () => {
        const route: NavigationPartialRoute = {
            name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
            state: {routes: []},
        };
        expect(getActiveScreenInRoute(route)).toBeUndefined();
    });

    it('returns undefined for TAB_NAVIGATOR route with empty routes array', () => {
        const route: NavigationPartialRoute = {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {routes: [], index: 0},
        };
        expect(getActiveScreenInRoute(route)).toBeUndefined();
    });
});

describe('shouldChangeToMatchingFullScreen', () => {
    it('returns true when names differ', () => {
        const result = shouldChangeToMatchingFullScreen({name: 'SomeRHPScreen', key: 'k1'}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR});
        expect(result).toBe(true);
    });

    it('returns false when names are the same and active screens match', () => {
        const tabState = {
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
            index: 0,
        };
        const result = shouldChangeToMatchingFullScreen(
            {name: 'SomeRHPScreen', key: 'k1'},
            {name: NAVIGATORS.TAB_NAVIGATOR, state: tabState},
            {name: NAVIGATORS.TAB_NAVIGATOR, state: tabState},
        );
        expect(result).toBe(false);
    });

    it('returns true when both TAB_NAVIGATOR but active tabs differ', () => {
        const matchingState = {
            routes: [{name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}],
            index: 0,
        };
        const lastState = {
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
            index: 0,
        };
        const result = shouldChangeToMatchingFullScreen(
            {name: 'SomeRHPScreen', key: 'k1'},
            {name: NAVIGATORS.TAB_NAVIGATOR, state: matchingState},
            {name: NAVIGATORS.TAB_NAVIGATOR, state: lastState},
        );
        expect(result).toBe(true);
    });

    it('returns true for ADD_PAYMENT_CARD when not on SUBSCRIPTION tab', () => {
        const result = shouldChangeToMatchingFullScreen(
            {name: SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD, key: 'k1'},
            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
        );
        // Same name, not TAB_NAVIGATOR, but ADD_PAYMENT_CARD and lastActiveScreen is undefined (not SUBSCRIPTION.ROOT)
        expect(result).toBe(true);
    });

    it('returns false for ADD_PAYMENT_CARD when on SUBSCRIPTION tab', () => {
        const result = shouldChangeToMatchingFullScreen(
            {name: SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD, key: 'k1'},
            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.SETTINGS.SUBSCRIPTION.ROOT}]}},
            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, state: {routes: [{name: SCREENS.SETTINGS.SUBSCRIPTION.ROOT}]}},
        );
        expect(result).toBe(false);
    });

    it('returns false when same name, not TAB, not ADD_PAYMENT_CARD', () => {
        const result = shouldChangeToMatchingFullScreen({name: 'SomeOtherScreen', key: 'k1'}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR});
        expect(result).toBe(false);
    });

    it('returns false when both TAB_NAVIGATOR without state (both active screens undefined)', () => {
        const result = shouldChangeToMatchingFullScreen({name: 'SomeRHPScreen', key: 'k1'}, {name: NAVIGATORS.TAB_NAVIGATOR}, {name: NAVIGATORS.TAB_NAVIGATOR});
        expect(result).toBe(false);
    });
});
