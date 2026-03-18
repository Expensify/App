import type {NavigationState} from '@react-navigation/native';
import getPlatform from '@libs/getPlatform';
import shouldPreserveWideRHPReportOriginForInternalLink from '@libs/Navigation/helpers/shouldPreserveWideRHPReportOriginForInternalLink';
import willRouteNavigateToRHP from '@libs/Navigation/helpers/willRouteNavigateToRHP';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/getPlatform', () => jest.fn());
jest.mock('@libs/Navigation/helpers/willRouteNavigateToRHP', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);
const mockedWillRouteNavigateToRHP = jest.mocked(willRouteNavigateToRHP);

function createState(focusedRouteName: string, topmostRouteName: string = NAVIGATORS.RIGHT_MODAL_NAVIGATOR): NavigationState {
    return {
        stale: false,
        type: 'stack',
        key: 'root',
        index: 1,
        routeNames: [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, topmostRouteName],
        routes: [
            {
                key: 'split',
                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                state: {
                    stale: false,
                    type: 'stack',
                    key: 'split-state',
                    index: 1,
                    routeNames: [SCREENS.INBOX, SCREENS.REPORT],
                    routes: [
                        {key: 'inbox', name: SCREENS.INBOX},
                        {key: 'report', name: SCREENS.REPORT, params: {reportID: '123'}},
                    ],
                },
            },
            {
                key: 'rhp',
                name: topmostRouteName,
                state: {
                    stale: false,
                    type: 'stack',
                    key: 'rhp-state',
                    index: 0,
                    routeNames: [focusedRouteName],
                    routes: [{key: 'focused', name: focusedRouteName, params: {reportID: '456'}}],
                },
            },
        ],
    } as unknown as NavigationState;
}

describe('shouldPreserveWideRHPReportOriginForInternalLink', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockedWillRouteNavigateToRHP.mockReturnValue(false);
    });

    it('returns true for wide web expense report routes navigating to a non-RHP route', () => {
        const result = shouldPreserveWideRHPReportOriginForInternalLink({
            currentState: createState(SCREENS.RIGHT_MODAL.EXPENSE_REPORT),
            targetPath: 'r/123/456',
            isNarrowLayout: false,
        });

        expect(result).toBe(true);
    });

    it('returns true for wide web search money request report routes navigating to a non-RHP route', () => {
        const result = shouldPreserveWideRHPReportOriginForInternalLink({
            currentState: createState(SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT),
            targetPath: 'r/123/456',
            isNarrowLayout: false,
        });

        expect(result).toBe(true);
    });

    it('returns false on narrow layout', () => {
        const result = shouldPreserveWideRHPReportOriginForInternalLink({
            currentState: createState(SCREENS.RIGHT_MODAL.EXPENSE_REPORT),
            targetPath: 'r/123/456',
            isNarrowLayout: true,
        });

        expect(result).toBe(false);
    });

    it('returns false for non-web platforms', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);

        const result = shouldPreserveWideRHPReportOriginForInternalLink({
            currentState: createState(SCREENS.RIGHT_MODAL.EXPENSE_REPORT),
            targetPath: 'r/123/456',
            isNarrowLayout: false,
        });

        expect(result).toBe(false);
    });

    it('returns false when the target stays inside RHP', () => {
        mockedWillRouteNavigateToRHP.mockReturnValue(true);

        const result = shouldPreserveWideRHPReportOriginForInternalLink({
            currentState: createState(SCREENS.RIGHT_MODAL.EXPENSE_REPORT),
            targetPath: 'settings/profile',
            isNarrowLayout: false,
        });

        expect(result).toBe(false);
    });

    it('returns false for non-report RHP routes', () => {
        const result = shouldPreserveWideRHPReportOriginForInternalLink({
            currentState: createState(SCREENS.RIGHT_MODAL.SETTINGS),
            targetPath: 'r/123/456',
            isNarrowLayout: false,
        });

        expect(result).toBe(false);
    });

    it('returns false when the topmost route is not RHP', () => {
        const result = shouldPreserveWideRHPReportOriginForInternalLink({
            currentState: createState(SCREENS.REPORT, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR),
            targetPath: 'r/123/456',
            isNarrowLayout: false,
        });

        expect(result).toBe(false);
    });
});
