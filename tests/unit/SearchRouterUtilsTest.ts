import type {NavigationState} from '@react-navigation/native';
import {getContextualReportData} from '@components/Search/SearchRouter/SearchRouterUtils';
import SCREENS from '@src/SCREENS';

// Helper to create minimal navigation state for testing
// The function only uses index, routes, and nested state properties
function createMockState(partialState: {index: number; routes: Array<{name: string; params?: Record<string, unknown>; state?: unknown}>}): NavigationState {
    return partialState as NavigationState;
}

describe('SearchRouterUtils', () => {
    describe('getContextualReportData', () => {
        it('returns undefined contextualReportID and false isSearchRouterScreen when state is undefined', () => {
            const result = getContextualReportData(undefined);

            expect(result).toEqual({
                contextualReportID: undefined,
                isSearchRouterScreen: false,
            });
        });

        it('returns reportID when focused on a Report screen', () => {
            const state = createMockState({
                index: 0,
                routes: [
                    {
                        name: SCREENS.REPORT,
                        params: {reportID: '12345'},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '12345',
                isSearchRouterScreen: false,
            });
        });

        it('returns reportID when focused on ExpenseReport screen', () => {
            const state = createMockState({
                index: 0,
                routes: [
                    {
                        name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
                        params: {reportID: '67890'},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '67890',
                isSearchRouterScreen: false,
            });
        });

        it('returns isSearchRouterScreen true and extracts reportID from previous route when SearchRouter is open over a Report', () => {
            const state = createMockState({
                index: 1,
                routes: [
                    {
                        name: SCREENS.REPORT,
                        params: {reportID: '11111'},
                    },
                    {
                        name: SCREENS.RIGHT_MODAL.SEARCH_ROUTER,
                        params: {},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '11111',
                isSearchRouterScreen: true,
            });
        });

        it('returns undefined contextualReportID when SearchRouter is open but no report underneath', () => {
            const state = createMockState({
                index: 1,
                routes: [
                    {
                        name: SCREENS.HOME,
                        params: {},
                    },
                    {
                        name: SCREENS.RIGHT_MODAL.SEARCH_ROUTER,
                        params: {},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: undefined,
                isSearchRouterScreen: true,
            });
        });

        it('returns undefined contextualReportID when on a non-report screen', () => {
            const state = createMockState({
                index: 0,
                routes: [
                    {
                        name: SCREENS.HOME,
                        params: {},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: undefined,
                isSearchRouterScreen: false,
            });
        });

        it('handles nested navigation state with Report screen', () => {
            const state = createMockState({
                index: 0,
                routes: [
                    {
                        name: 'RootNavigator',
                        state: {
                            index: 0,
                            routes: [
                                {
                                    name: SCREENS.REPORT,
                                    params: {reportID: '55555'},
                                },
                            ],
                        },
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '55555',
                isSearchRouterScreen: false,
            });
        });

        it('extracts reportID from ExpenseReport when SearchRouter is open over it', () => {
            const state = createMockState({
                index: 1,
                routes: [
                    {
                        name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
                        params: {reportID: '99999'},
                    },
                    {
                        name: SCREENS.RIGHT_MODAL.SEARCH_ROUTER,
                        params: {},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '99999',
                isSearchRouterScreen: true,
            });
        });
    });
});
