import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getSearchTabPreloadTarget from '@libs/Navigation/helpers/getSearchTabPreloadTarget/index.native';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/getIsNarrowLayout', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}));

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    getPendingSubmitFollowUpAction: jest.fn(() => null),
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
    beforeEach(() => {
        jest.mocked(getIsNarrowLayout).mockReturnValue(true);
        jest.mocked(getPendingSubmitFollowUpAction).mockReturnValue(null);
    });

    it.each([
        ['leaves the Spend tab to a submit that ends on Spend', CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH, undefined],
        ['still preloads the Spend tab while a submit ends on a report', CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, 'tab-1'],
    ])('%s', (_description, followUpAction, expected) => {
        // Given an expense submit in flight, which pre-inserts the Spend tab under the RHP only when it ends on Spend
        jest.mocked(getPendingSubmitFollowUpAction).mockReturnValue({followUpAction});

        // When the idle preload asks where to dispatch the Spend tab preload
        const target = getSearchTabPreloadTarget(rootState);

        // Then the preload only steps aside for the submit that opens Spend itself
        expect(target).toBe(expected);
    });

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
