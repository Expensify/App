import getFocusedReportParams from '@libs/Navigation/helpers/getFocusedReportParams';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

type State = PartialState<NavigationState>;

describe('getFocusedReportParams', () => {
    it('returns undefined for undefined state', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(getFocusedReportParams(undefined as unknown as State)).toBeUndefined();
    });

    it('returns undefined when there is no focused report route', () => {
        const state: State = {
            routes: [{name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}],
        };

        expect(getFocusedReportParams(state)).toBeUndefined();
    });

    it('returns the central-pane inbox report params', () => {
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
    });

    it('returns the central-pane report when REPORTS_SPLIT_NAVIGATOR is nested in TAB_NAVIGATOR', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
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

        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'tab-inbox-report',
            reportActionID: undefined,
        });
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

        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'rhp-report',
            reportActionID: undefined,
        });
    });

    it('returns the search fullscreen money request report params', () => {
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

        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'search-report',
            reportActionID: undefined,
        });
    });

    it('returns the search fullscreen report when SEARCH_FULLSCREEN_NAVIGATOR is nested in TAB_NAVIGATOR', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
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

        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'tab-search-report',
            reportActionID: undefined,
        });
    });

    it('prefers the active Search money-request report over a preserved inactive Inbox report', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: SCREENS.REPORT,
                                            params: {reportID: 'inactive-inbox-report'},
                                        },
                                    ],
                                },
                            },
                            {
                                name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: SCREENS.SEARCH.MONEY_REQUEST_REPORT,
                                            params: {reportID: 'active-search-report'},
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'active-search-report',
            reportActionID: undefined,
        });
    });

    it('returns the Inbox report when Reports is the active tab even if Search still has a money-request route', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: SCREENS.REPORT,
                                            params: {reportID: 'active-inbox-report'},
                                        },
                                    ],
                                },
                            },
                            {
                                name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: SCREENS.SEARCH.MONEY_REQUEST_REPORT,
                                            params: {reportID: 'inactive-search-report'},
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'active-inbox-report',
            reportActionID: undefined,
        });
    });

    it('does not return a preserved Inbox report when Search is active without a money-request report', () => {
        const state: State = {
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: SCREENS.REPORT,
                                            params: {reportID: 'inactive-inbox-report'},
                                        },
                                    ],
                                },
                            },
                            {
                                name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                state: {
                                    routes: [{name: SCREENS.SEARCH.ROOT}],
                                },
                            },
                        ],
                    },
                },
            ],
        };

        expect(getFocusedReportParams(state)).toBeUndefined();
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

        expect(getFocusedReportParams(state)).toEqual({
            reportID: 'central-report',
            reportActionID: undefined,
        });
    });
});
