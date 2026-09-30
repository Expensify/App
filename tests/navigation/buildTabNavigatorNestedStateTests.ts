import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import buildTabNavigatorNestedState from '@libs/Navigation/helpers/buildTabNavigatorNestedState';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

describe('buildTabNavigatorNestedState', () => {
    it('returns state with every tab route, in the order the navigator registers them', () => {
        // Given the tab screens the navigator registers on the current platform
        // When the nested state is built for one of them
        const result = buildTabNavigatorNestedState({name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR});

        // Then it holds a route for every tab, in the same order, since the native tab bars draw their items in it
        expect(result.routes.map((r) => r.name)).toEqual([...TAB_SCREENS]);
    });

    it('sets index to the position of the selected tab', () => {
        // Given the settings tab, whose position differs between platforms
        // When the nested state is built for it
        const result = buildTabNavigatorNestedState({name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR});

        // Then the index points at that tab's own route
        expect(result.index).toBe(TAB_SCREENS.indexOf(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));
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
        expect(result.routes.at(TAB_SCREENS.indexOf(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR))?.params).toEqual(params);
        expect(result.routes.at(0)?.params).toBeUndefined();
        expect(result.routes.at(1)?.params).toBeUndefined();
    });
});
