import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import buildTabNavigatorNestedState from '@libs/Navigation/helpers/buildTabNavigatorNestedState';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

describe('buildTabNavigatorNestedState', () => {
    it('returns state with all 5 tab routes', () => {
        const result = buildTabNavigatorNestedState({name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR});
        expect(result.routes).toHaveLength(TAB_SCREENS.length);
        const routeNames = result.routes.map((r) => r.name);
        expect(routeNames).toEqual([
            SCREENS.HOME,
            NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
            NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
            NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
            NAVIGATORS.WORKSPACE_NAVIGATOR,
        ]);
    });

    it('sets index to the position of the selected tab (SETTINGS = 3)', () => {
        const result = buildTabNavigatorNestedState({name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR});
        expect(result.index).toBe(3);
    });

    it('falls back to index 0 for an unknown tab name', () => {
        const result = buildTabNavigatorNestedState({name: 'NonExistentTab'});
        expect(result.index).toBe(0);
    });

    it('copies state from selectedTabRoute onto the matched route only', () => {
        const nestedState = {routes: [{name: SCREENS.INBOX}], index: 0};
        const result = buildTabNavigatorNestedState({name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: nestedState});
        expect(result.routes.at(1)?.state).toEqual(nestedState);
        expect(result.routes.at(0)?.state).toBeUndefined();
        expect(result.routes.at(2)?.state).toBeUndefined();
    });

    it('copies params from selectedTabRoute onto the matched route only', () => {
        const params = {screen: 'SomeScreen'};
        const result = buildTabNavigatorNestedState({name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, params});
        expect(result.routes.at(3)?.params).toEqual(params);
        expect(result.routes.at(0)?.params).toBeUndefined();
        expect(result.routes.at(1)?.params).toBeUndefined();
    });
});
