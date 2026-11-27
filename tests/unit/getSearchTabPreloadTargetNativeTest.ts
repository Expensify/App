import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getSearchTabPreloadTarget from '@libs/Navigation/helpers/getSearchTabPreloadTarget/index.native';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

jest.mock('@libs/getIsNarrowLayout', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}));

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    getPendingSubmitFollowUpAction: jest.fn(() => null),
}));

type Case = {
    isNarrowLayout?: boolean;
    followUpAction?: ValueOf<typeof CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION>;
    index?: number;
    history?: Array<{type: 'route'; key: string}>;
    withSearchRoute?: boolean;
};

// The native tab bar mounts Spend at startup, so its route carries a mounted stack while only Home was shown.
const buildRootState = ({index = 0, history = [{type: 'route', key: 'home-1'}], withSearchRoute = true}: Case) => ({
    routes: [
        {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {
                key: 'tab-1',
                index,
                history,
                routes: [
                    {name: SCREENS.HOME, key: 'home-1'},
                    ...(withSearchRoute
                        ? [{name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, key: 'search-1', state: {key: 'stack-1', index: 0, routes: [{name: SCREENS.SEARCH.ROOT, key: 'root-1'}]}}]
                        : []),
                ],
            },
        },
    ],
});

describe('getSearchTabPreloadTarget on native', () => {
    it.each<[string, Case, string | undefined]>([
        ['targets a Spend tab that was never shown', {}, 'tab-1'],
        ['skips a wide layout, which keeps the JS tab bar', {isNarrowLayout: false}, undefined],
        ['leaves the Spend tab to a submit that ends on Spend', {followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH}, undefined],
        ['still preloads the Spend tab while a submit ends on a report', {followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT}, 'tab-1'],
        ['skips Spend while it is the focused tab', {index: 1, history: [{type: 'route', key: 'search-1'}]}, undefined],
        [
            'skips Spend once it was shown in the session',
            {
                history: [
                    {type: 'route', key: 'search-1'},
                    {type: 'route', key: 'home-1'},
                ],
            },
            undefined,
        ],
        ['skips a tab navigator with no Spend route', {withSearchRoute: false}, undefined],
    ])('%s', (_description, testCase, expected) => {
        // Given the app finished loading, with the layout, pending submit and tab history this case describes
        jest.mocked(getIsNarrowLayout).mockReturnValue(testCase.isNarrowLayout ?? true);
        jest.mocked(getPendingSubmitFollowUpAction).mockReturnValue(testCase.followUpAction ? {followUpAction: testCase.followUpAction} : null);

        // When the idle preload asks where to dispatch the Spend tab preload
        const target = getSearchTabPreloadTarget(buildRootState(testCase));

        // Then only a narrow Spend tab that was never shown is preloaded, and never ahead of a submit that opens Spend itself
        expect(target).toBe(expected);
    });
});
