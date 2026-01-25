/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import type {UseSearchHighlightAndScroll} from '@hooks/useSearchHighlightAndScroll';
import {search} from '@libs/actions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/actions/Search');
jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
    createNavigationContainerRef: () => ({}),
}));
jest.mock('@rnmapbox/maps', () => ({
    __esModule: true,
    default: {},
    MarkerView: {},
    setAccessToken: jest.fn(),
}));

const mockUseIsFocused = jest.fn().mockReturnValue(true);

afterEach(() => {
    jest.clearAllMocks();
});

describe('useSearchHighlightAndScroll', () => {
    const baseProps: UseSearchHighlightAndScroll = {
        shouldUseLiveData: false,
        searchResults: {
            data: {
                personalDetailsList: {},
            },
            search: {
                hasMoreResults: false,
                hasResults: true,
                offset: 0,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                type: 'expense',
                isLoading: false,
            },
        },
        transactions: {},
        previousTransactions: {},
        reportActions: {},
        previousReportActions: {},
        queryJSON: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {operator: 'and', left: 'tag', right: ''},
            inputQuery: 'type:expense',
            flatFilters: [],
            hash: 123,
            recentSearchHash: 456,
            similarSearchHash: 789,
        },
        searchKey: undefined,
        shouldCalculateTotals: false,
        offset: 0,
    };

    it('should not trigger search when collections are empty', () => {
        renderHook(() => useSearchHighlightAndScroll(baseProps));
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when new transaction added and focused', () => {
        const initialProps = {
            ...baseProps,
            transactions: {'1': {transactionID: '1'}},
            previousTransactions: {'1': {transactionID: '1'}},
        };

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps,
        });

        const updatedProps = {
            ...baseProps,
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
            previousTransactions: {'1': {transactionID: '1'}},
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when not focused', () => {
        mockUseIsFocused.mockReturnValue(false);

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: baseProps,
        });

        const updatedProps = {
            ...baseProps,
            transactions: {'1': {transactionID: '1'}},
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search for chat when report actions added and focused', () => {
        mockUseIsFocused.mockReturnValue(true);

        const chatProps = {
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, type: 'chat' as const},
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
            },
        };

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: chatProps,
        });

        const updatedProps = {
            ...chatProps,
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: chatProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when new transaction removed and focused', () => {
        const initialProps = {
            ...baseProps,
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
            previousTransactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
        };

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps,
        });

        const updatedProps = {
            ...baseProps,
            transactions: {
                '1': {transactionID: '1'},
            },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should not trigger search for chat when report actions removed and focused', () => {
        mockUseIsFocused.mockReturnValue(true);

        const chatProps = {
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, type: 'chat' as const},
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
        };

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: chatProps,
        });

        const updatedProps = {
            ...chatProps,
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
            },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should return multiple new search result keys when there are multiple new expenses', () => {
        const {rerender, result} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: baseProps,
        });
        const updatedProps = {
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {
                        transactionID: '1',
                    },
                    transactions_2: {
                        transactionID: '2',
                    },
                },
            },
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
                '3': {transactionID: '3'},
            },
            previousTransactions: {
                '1': {transactionID: '1'},
            },
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(result.current.newSearchResultKeys?.size).toBe(2);
    });

    it('should return new search result keys for manually highlighted expenses', async () => {
        const spyOnMergeTransactionIdsHighlightOnSearchRoute = jest
            .spyOn(require('@libs/actions/Transaction'), 'mergeTransactionIdsHighlightOnSearchRoute')
            .mockImplementationOnce(jest.fn());
        // We need to mock requestAnimationFrame to mimic long Onyx merge overhead
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            callback(performance.now());
            return 0;
        });

        await Onyx.merge(ONYXKEYS.TRANSACTION_IDS_HIGHLIGHT_ON_SEARCH_ROUTE, {[baseProps.queryJSON.type]: {'3': true}});

        const {rerender, result} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: baseProps,
        });
        const updatedProps1 = {
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {
                        transactionID: '1',
                    },
                    transactions_2: {
                        transactionID: '2',
                    },
                },
            },
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
                '3': {transactionID: '3'},
            },
            previousTransactions: {
                '1': {transactionID: '1'},
            },
        } as unknown as UseSearchHighlightAndScroll;

        // When there is no data yet, even if the transactionID has been added to manual highlight transactionIDs,
        // it still will not be included in newSearchResultKeys.
        rerender(updatedProps1);
        expect(result.current.newSearchResultKeys?.size).toBe(2);
        expect([...(result.current.newSearchResultKeys ?? new Set())]).not.toContain('transactions_3');

        // When the data contains the highlight transactionID, it will be highlighted.
        const updatedProps2 = {
            ...updatedProps1,
            searchResults: {
                ...updatedProps1.searchResults,
                data: {
                    transactions_1: {
                        transactionID: '1',
                    },
                    transactions_2: {
                        transactionID: '2',
                    },
                    transactions_3: {
                        transactionID: '3',
                    },
                },
            },
        } as unknown as UseSearchHighlightAndScroll;

        rerender(updatedProps2);
        expect(result.current.newSearchResultKeys?.size).toBe(1);
        expect([...(result.current.newSearchResultKeys ?? new Set())]).toContain('transactions_3');

        // Wait 1s for the timer in useSearchHighlightAndScroll to complete.
        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledTimes(1);
        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledWith(baseProps.queryJSON.type, {'3': false});
    });

    it('should return multiple new search result keys when there are multiple new chats', () => {
        const chatProps = {
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, type: 'chat' as const},
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
            },
        };
        const {rerender, result} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: chatProps,
        });
        const updatedProps = {
            ...chatProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    reportActions_1: {
                        '1': {actionName: 'EXISTING', reportActionID: '1'},
                    },
                    reportActions_2: {
                        '2': {actionName: 'EXISTING', reportActionID: '2'},
                    },
                },
            },
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
                reportActions_2: {
                    '2': {actionName: 'EXISTING', reportActionID: '2'},
                },
                reportActions_3: {
                    '3': {actionName: 'EXISTING', reportActionID: '3'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
            },
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(result.current.newSearchResultKeys?.size).toBe(2);
    });
});
