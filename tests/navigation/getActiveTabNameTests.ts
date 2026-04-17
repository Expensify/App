import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

describe('getActiveTabName', () => {
    it('returns undefined when route is undefined', () => {
        expect(getActiveTabName(undefined)).toBeUndefined();
    });

    it('returns route.name when route is not TAB_NAVIGATOR', () => {
        const route = {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, key: 'k1'};
        expect(getActiveTabName(route)).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    });

    it('returns route.name when route is TAB_NAVIGATOR without state', () => {
        const route = {name: NAVIGATORS.TAB_NAVIGATOR, key: 'k1'};
        expect(getActiveTabName(route)).toBe(NAVIGATORS.TAB_NAVIGATOR);
    });

    it('returns focused tab name from TAB_NAVIGATOR state', () => {
        const route = {
            name: NAVIGATORS.TAB_NAVIGATOR,
            key: 'k1',
            state: {
                index: 2,
                routes: [{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}],
            },
        };
        expect(getActiveTabName(route)).toBe(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    });

    it('defaults to index 0 when state.index is undefined', () => {
        const route = {
            name: NAVIGATORS.TAB_NAVIGATOR,
            key: 'k1',
            state: {
                routes: [{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
            },
        };
        expect(getActiveTabName(route)).toBe(SCREENS.HOME);
    });

    it('returns undefined when state.routes has no element at given index', () => {
        const route = {
            name: NAVIGATORS.TAB_NAVIGATOR,
            key: 'k1',
            state: {
                index: 5,
                routes: [{name: SCREENS.HOME}],
            },
        };
        expect(getActiveTabName(route)).toBeUndefined();
    });
});
