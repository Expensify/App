import {getTabScreenParam, getTabState} from '@libs/Navigation/helpers/tabNavigatorUtils';
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
