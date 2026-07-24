import getFocusedReportParams, {getFocusedReportId} from '@libs/Navigation/helpers/getFocusedReportParams';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

type State = PartialState<NavigationState>;

describe('getFocusedReportParams / getFocusedReportId', () => {
    it('returns undefined for undefined state', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(getFocusedReportParams(undefined as unknown as State)).toBeUndefined();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(getFocusedReportId(undefined as unknown as State)).toBeUndefined();
    });

    it('returns undefined when there is no focused report route', () => {
        const state: State = {
            routes: [{name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}],
        };

        expect(getFocusedReportParams(state)).toBeUndefined();
        expect(getFocusedReportId(state)).toBeUndefined();
    });

    it('returns the central-pane inbox report ID', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.REPORT,
                                params: {reportID: 'central-report', reportActionID: 'action-1'},
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'central-report',
            reportActionID: 'action-1',
        });
        expect(getFocusedReportId(state)).toBe('central-report');
    });

    it('returns the central-pane report when REPORTS_SPLIT_NAVIGATOR is nested in TAB_NAVIGATOR', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: SCREENS.REPORT,
                                            params: {reportID: 'tab-inbox-report'},
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportId(state)).toBe('tab-inbox-report');
    });

    it('prefers the RHP report over the central-pane report', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.REPORT,
                                params: {reportID: 'central-report'},
                            },
                        ],
                    },
                },
                {
                    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT,
                                params: {reportID: 'rhp-report'},
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportId(state)).toBe('rhp-report');
        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'rhp-report',
            reportActionID: undefined,
        });
    });

    it('returns the search fullscreen money request report ID', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.SEARCH.MONEY_REQUEST_REPORT,
                                params: {reportID: 'search-report'},
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportId(state)).toBe('search-report');
    });

    it('returns the search fullscreen report when SEARCH_FULLSCREEN_NAVIGATOR is nested in TAB_NAVIGATOR', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: SCREENS.SEARCH.MONEY_REQUEST_REPORT,
                                            params: {reportID: 'tab-search-report'},
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportId(state)).toBe('tab-search-report');
    });

    it('ignores RHP routes that are not wide report modals', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.REPORT,
                                params: {reportID: 'central-report'},
                            },
                        ],
                    },
                },
                {
                    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.RIGHT_MODAL.DETAILS,
                                params: {reportID: 'details-report'},
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportId(state)).toBe('central-report');
    });
});
