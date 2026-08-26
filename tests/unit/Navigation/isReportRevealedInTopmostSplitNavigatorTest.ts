import isReportRevealedInTopmostSplitNavigator from '@libs/Navigation/helpers/isReportRevealedInTopmostSplitNavigator';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const mockGetRootState = jest.fn();

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: () => mockGetRootState() as unknown,
    },
}));

/**
 * Builds a root state whose topmost TAB_NAVIGATOR focuses a REPORTS_SPLIT_NAVIGATOR containing the given inner routes.
 */
function rootStateWithReportsSplitRoutes(innerRoutes: Array<{name: string; params?: Record<string, unknown>}>) {
    return {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                            state: {routes: innerRoutes},
                        },
                    ],
                },
            },
        ],
    };
}

function rootStateWithPendingReportParams(params: Record<string, unknown>) {
    return {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                            params,
                        },
                    ],
                },
            },
        ],
    };
}

describe('isReportRevealedInTopmostSplitNavigator', () => {
    beforeEach(() => {
        mockGetRootState.mockReset();
    });

    it('returns false when there is no root state', () => {
        mockGetRootState.mockReturnValue(undefined);
        expect(isReportRevealedInTopmostSplitNavigator()).toBe(false);
    });

    it('returns false when the topmost full-screen route is not a REPORTS_SPLIT_NAVIGATOR', () => {
        mockGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {index: 0, routes: [{name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}]},
                },
            ],
        });
        expect(isReportRevealedInTopmostSplitNavigator()).toBe(false);
    });

    it('returns false when the split only contains the Inbox sidebar', () => {
        mockGetRootState.mockReturnValue(rootStateWithReportsSplitRoutes([{name: SCREENS.INBOX}]));
        expect(isReportRevealedInTopmostSplitNavigator()).toBe(false);
    });

    it('returns false for a placeholder REPORT route with no reportID param', () => {
        mockGetRootState.mockReturnValue(rootStateWithReportsSplitRoutes([{name: SCREENS.INBOX}, {name: SCREENS.REPORT}]));
        expect(isReportRevealedInTopmostSplitNavigator()).toBe(false);
    });

    it('returns false for a placeholder REPORT route with an empty reportID param', () => {
        mockGetRootState.mockReturnValue(rootStateWithReportsSplitRoutes([{name: SCREENS.INBOX}, {name: SCREENS.REPORT, params: {reportID: ''}}]));
        expect(isReportRevealedInTopmostSplitNavigator()).toBe(false);
    });

    it('returns true for a REPORT route with a non-empty reportID param', () => {
        mockGetRootState.mockReturnValue(rootStateWithReportsSplitRoutes([{name: SCREENS.INBOX}, {name: SCREENS.REPORT, params: {reportID: '1234'}}]));
        expect(isReportRevealedInTopmostSplitNavigator()).toBe(true);
    });

    it('returns true for a pending REPORT route encoded in navigator params', () => {
        mockGetRootState.mockReturnValue(
            rootStateWithPendingReportParams({
                screen: SCREENS.REPORT,
                params: {reportID: '1234'},
            }),
        );
        expect(isReportRevealedInTopmostSplitNavigator()).toBe(true);
    });

    it('returns false for a pending REPORT route with an empty reportID', () => {
        mockGetRootState.mockReturnValue(
            rootStateWithPendingReportParams({
                screen: SCREENS.REPORT,
                params: {reportID: ''},
            }),
        );
        expect(isReportRevealedInTopmostSplitNavigator()).toBe(false);
    });
});
