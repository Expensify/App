import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getSearchTabPreloadTarget from '@libs/Navigation/helpers/getSearchTabPreloadTarget/index.native';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/getIsNarrowLayout', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}));

// The native tab bar mounts Spend at startup, so its route carries a mounted stack while only Home was shown.
const rootState = {
    routes: [
        {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {
                key: 'tab-1',
                index: 0,
                history: [{type: 'route' as const, key: 'home-1'}],
                routes: [
                    {name: SCREENS.HOME, key: 'home-1'},
                    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, key: 'search-1', state: {key: 'stack-1', index: 0, routes: [{name: SCREENS.SEARCH.ROOT, key: 'root-1'}]}},
                ],
            },
        },
    ],
};

describe('getSearchTabPreloadTarget on native', () => {
    it.each([
        ['targets the tab navigator on a narrow layout', true, 'tab-1'],
        ['skips a wide layout, which keeps the JS tab bar', false, undefined],
    ])('%s', (_description, isNarrowLayout, expected) => {
        // Given the app finished loading on Home, with the Spend tab mounted but never shown
        jest.mocked(getIsNarrowLayout).mockReturnValue(isNarrowLayout);

        // When the idle preload asks where to dispatch the Spend tab preload
        const target = getSearchTabPreloadTarget(rootState);

        // Then only the native tab bar's narrow layout gets the preload
        expect(target).toBe(expected);
    });
});
