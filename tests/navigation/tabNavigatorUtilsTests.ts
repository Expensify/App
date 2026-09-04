import {getTabNavigatorState, getTabScreenParam, getTabState, isReportsTabPreloaded} from '@libs/Navigation/helpers/tabNavigatorUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

describe('getTabState', () => {
    it('returns the state when route is TAB_NAVIGATOR with state', () => {
        const state = {routes: [{name: SCREENS.HOME}], index: 0};
        const route = {name: NAVIGATORS.TAB_NAVIGATOR, state};
        expect(getTabState(route)).toBe(state);
    });

    it('returns undefined when route is TAB_NAVIGATOR without state', () => {
        const route = {name: NAVIGATORS.TAB_NAVIGATOR};
        expect(getTabState(route)).toBeUndefined();
    });

    it('returns undefined when route is not TAB_NAVIGATOR even with state', () => {
        const state = {routes: [{name: SCREENS.INBOX}], index: 0};
        const route = {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state};
        expect(getTabState(route)).toBeUndefined();
    });

    it('returns undefined when route is undefined', () => {
        expect(getTabState(undefined)).toBeUndefined();
    });
});

describe('getTabScreenParam', () => {
    it('returns screen param when route is TAB_NAVIGATOR with params.screen', () => {
        const route = {name: NAVIGATORS.TAB_NAVIGATOR, params: {screen: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}};
        expect(getTabScreenParam(route)).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    });

    it('returns undefined when route is TAB_NAVIGATOR without params', () => {
        const route = {name: NAVIGATORS.TAB_NAVIGATOR};
        expect(getTabScreenParam(route)).toBeUndefined();
    });

    it('returns undefined when route is TAB_NAVIGATOR with params but no screen key', () => {
        const route = {name: NAVIGATORS.TAB_NAVIGATOR, params: {other: 'value'}};
        expect(getTabScreenParam(route)).toBeUndefined();
    });

    it('returns undefined when route is not TAB_NAVIGATOR', () => {
        const route = {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, params: {screen: 'foo'}};
        expect(getTabScreenParam(route)).toBeUndefined();
    });

    it('returns undefined when route is undefined', () => {
        expect(getTabScreenParam(undefined)).toBeUndefined();
    });
});

describe('getTabNavigatorState', () => {
    it('returns the tab navigator state from the root state', () => {
        const tabState = {key: 'tab-1', routes: [{name: SCREENS.HOME}], index: 0};
        const rootState = {routes: [{name: NAVIGATORS.TAB_NAVIGATOR, state: tabState}]};
        expect(getTabNavigatorState(rootState)).toBe(tabState);
    });

    it('returns the last TAB_NAVIGATOR when the root state holds several', () => {
        const firstTabState = {key: 'tab-1', routes: [{name: SCREENS.HOME}], index: 0};
        const lastTabState = {key: 'tab-2', routes: [{name: SCREENS.INBOX}], index: 0};
        const rootState = {
            routes: [
                {name: NAVIGATORS.TAB_NAVIGATOR, state: firstTabState},
                {name: NAVIGATORS.TAB_NAVIGATOR, state: lastTabState},
            ],
        };
        expect(getTabNavigatorState(rootState)).toBe(lastTabState);
    });

    it('returns undefined when the root state has no TAB_NAVIGATOR route', () => {
        const rootState = {routes: [{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]};
        expect(getTabNavigatorState(rootState)).toBeUndefined();
    });

    it('returns undefined when the TAB_NAVIGATOR route has no state', () => {
        const rootState = {routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]};
        expect(getTabNavigatorState(rootState)).toBeUndefined();
    });

    it('returns undefined when the root state is undefined', () => {
        expect(getTabNavigatorState(undefined)).toBeUndefined();
    });
});

describe('isReportsTabPreloaded', () => {
    const buildRootState = (preloadedRouteKeys?: string[]) => ({
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    key: 'tab-1',
                    index: 0,
                    routes: [
                        {name: SCREENS.HOME, key: 'home-1'},
                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, key: 'reports-1'},
                    ],
                    preloadedRouteKeys,
                },
            },
        ],
    });

    it('returns true when the Reports route key is preloaded', () => {
        expect(isReportsTabPreloaded(buildRootState(['reports-1']))).toBe(true);
    });

    it('returns false when a different route is preloaded', () => {
        expect(isReportsTabPreloaded(buildRootState(['home-1']))).toBe(false);
    });

    it('returns false when nothing is preloaded', () => {
        expect(isReportsTabPreloaded(buildRootState([]))).toBe(false);
    });

    // A rehydrated or partial state carries no `preloadedRouteKeys`, so the attribute has to read false
    // rather than throw.
    it('returns false when the tab state does not track preloaded keys', () => {
        expect(isReportsTabPreloaded(buildRootState(undefined))).toBe(false);
    });

    it('returns false when there is no Reports route', () => {
        const rootState = {
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR, state: {key: 'tab-1', index: 0, routes: [{name: SCREENS.HOME, key: 'home-1'}], preloadedRouteKeys: ['home-1']}}],
        };
        expect(isReportsTabPreloaded(rootState)).toBe(false);
    });

    it('returns false when the root state is undefined', () => {
        expect(isReportsTabPreloaded(undefined)).toBe(false);
    });
});
