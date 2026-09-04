/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';

import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';

import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import type {UseSearchHighlightAndScroll} from '@hooks/useSearchHighlightAndScroll';

import {search} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';

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

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: mockIsOffline})));

const mockUseIsFocused = jest.fn().mockReturnValue(true);

afterEach(() => {
    jest.clearAllMocks();
    mockIsOffline = false;
});

describe('useSearchHighlightAndScroll', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    const baseProps: UseSearchHighlightAndScroll = {
        searchResults: {
            data: {
                personalDetailsList: {},
            },
            search: {
                hasMoreResults: false,
                hasResults: true,
                offset: 0,
                hash: 0,
                sortBy: 'date',
                sortOrder: 'desc',
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
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {operator: 'and', left: 'tag', right: ''},
            inputQuery: 'type:expense',
            flatFilters: [],
            hash: 123,
            recentSearchHash: 456,
            similarSearchHash: 789,
            view: 'table',
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
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            transactions: {transactions_1: {transactionID: '1'}},
            previousTransactions: {transactions_1: {transactionID: '1'}},
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            transactions: {
                transactions_1: {transactionID: '1'},
                transactions_2: {transactionID: '2'},
            },
            previousTransactions: {transactions_1: {transactionID: '1'}},
        });

        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when not focused', () => {
        mockUseIsFocused.mockReturnValue(false);

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: baseProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            transactions: {transactions_1: {transactionID: '1'}},
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search for chat when report actions added and focused', () => {
        mockUseIsFocused.mockReturnValue(true);

        const chatProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, type: 'chat' as const},
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                },
            },
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: chatProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...chatProps,
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
        });

        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: chatProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when new transaction removed and focused', () => {
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            transactions: {
                transactions_1: {transactionID: '1'},
                transactions_2: {transactionID: '2'},
            },
            previousTransactions: {
                transactions_1: {transactionID: '1'},
                transactions_2: {transactionID: '2'},
            },
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            transactions: {
                transactions_1: {transactionID: '1'},
            },
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a transaction that is absent from the results is added', () => {
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {transactionID: '1'},
                },
            },
            transactions: {
                transactions_1: {transactionID: '1'},
            },
            previousTransactions: {
                transactions_1: {transactionID: '1'},
            },
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...initialProps,
            transactions: {
                transactions_1: {transactionID: '1'},
                transactions_2: {transactionID: '2'},
            },
        });

        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when the added transaction is already in the search results', () => {
        // Onyx keeps one value object per collection member, so an unedited transaction has to keep its
        // reference across renders — the hook reads that identity to tell an edit from an untouched row.
        const transaction1 = createMock<Transaction>({transactionID: '1'});
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {transactionID: '1'},
                    transactions_2: {transactionID: '2'},
                },
            },
            transactions: {
                transactions_1: transaction1,
            },
            previousTransactions: {
                transactions_1: transaction1,
            },
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...initialProps,
            transactions: {
                transactions_1: transaction1,
                transactions_2: {transactionID: '2'},
            },
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a transaction that is already in the results is edited', () => {
        const transaction = createMock<Transaction>({transactionID: '1', amount: 100});
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {transactionID: '1'},
                },
            },
            transactions: {transactions_1: transaction},
            previousTransactions: {transactions_1: transaction},
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...initialProps,
            transactions: {transactions_1: {transactionID: '1', amount: 250}},
        });

        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when the edited transaction is absent from the results', () => {
        const visibleTransaction = createMock<Transaction>({transactionID: '1', amount: 100});
        const filteredOutTransaction = createMock<Transaction>({transactionID: '99', amount: 100});
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {transactionID: '1'},
                },
            },
            transactions: {transactions_1: visibleTransaction, transactions_99: filteredOutTransaction},
            previousTransactions: {transactions_1: visibleTransaction, transactions_99: filteredOutTransaction},
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...initialProps,
            transactions: {transactions_1: visibleTransaction, transactions_99: {transactionID: '99', amount: 250}},
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a transaction moves into a report the results display', () => {
        const movedTransaction = createMock<Transaction>({transactionID: '99', reportID: '5'});
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    report_2: {reportID: '2'},
                },
            },
            transactions: {transactions_99: movedTransaction},
            previousTransactions: {transactions_99: movedTransaction},
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...initialProps,
            transactions: {transactions_99: {transactionID: '99', reportID: '2'}},
        });

        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when a transaction moves between reports the results do not display', () => {
        const movedTransaction = createMock<Transaction>({transactionID: '99', reportID: '5'});
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    report_2: {reportID: '2'},
                },
            },
            transactions: {transactions_99: movedTransaction},
            previousTransactions: {transactions_99: movedTransaction},
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...initialProps,
            transactions: {transactions_99: {transactionID: '99', reportID: '7'}},
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger the deferred search once Search is active again, after previousTransactions caught up', () => {
        const transaction = createMock<Transaction>({transactionID: '1', amount: 100});
        const editedTransaction = createMock<Transaction>({transactionID: '1', amount: 250});
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {transactionID: '1'},
                },
            },
            transactions: {transactions_1: transaction},
            previousTransactions: {transactions_1: transaction},
        });

        mockIsOffline = true;
        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const editedProps = createMock<UseSearchHighlightAndScroll>({...initialProps, transactions: {transactions_1: editedTransaction}});

        rerender(editedProps);
        expect(search).not.toHaveBeenCalled();

        // `usePrevious` catches up while Search is inactive, so the edit is no longer visible to the comparisons.
        const settledProps = createMock<UseSearchHighlightAndScroll>({...editedProps, previousTransactions: {transactions_1: editedTransaction}});

        rerender(settledProps);
        expect(search).not.toHaveBeenCalled();

        mockIsOffline = false;

        rerender({...settledProps});
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should not trigger search on a non-chat search when a report action was added and Onyx holds a transaction the query filters out', () => {
        const transaction1 = createMock<Transaction>({transactionID: '1'});
        const transaction99 = createMock<Transaction>({transactionID: '99'});
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: transaction1,
                },
            },
            // `transactions_99` is held by the client but filtered out by the query, the normal paginated/filtered state.
            transactions: {
                transactions_1: transaction1,
                transactions_99: transaction99,
            },
            previousTransactions: {
                transactions_1: transaction1,
                transactions_99: transaction99,
            },
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                },
            },
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...initialProps,
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should not trigger search when the added transaction is already in the results and Onyx holds one the query filters out', () => {
        const transaction1 = createMock<Transaction>({transactionID: '1'});
        const transaction99 = createMock<Transaction>({transactionID: '99'});
        const initialProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {transactionID: '1'},
                    transactions_2: {transactionID: '2'},
                },
            },
            transactions: {
                transactions_1: transaction1,
                transactions_99: transaction99,
            },
            previousTransactions: {
                transactions_1: transaction1,
                transactions_99: transaction99,
            },
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...initialProps,
            transactions: {
                transactions_1: transaction1,
                transactions_99: transaction99,
                transactions_2: {transactionID: '2'},
            },
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should not trigger search for chat when report actions removed and focused', () => {
        mockUseIsFocused.mockReturnValue(true);

        const chatProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, type: 'chat' as const},
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
        });

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: chatProps,
        });

        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...chatProps,
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                },
            },
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should clear the scroll trigger when the first new expense is already first', () => {
        const {rerender, result} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: baseProps,
        });
        const updatedProps = createMock<UseSearchHighlightAndScroll>({
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
                transactions_1: {transactionID: '1'},
                transactions_2: {transactionID: '2'},
                transactions_3: {transactionID: '3'},
            },
            previousTransactions: {
                transactions_1: {transactionID: '1'},
            },
        });
        rerender(updatedProps);
        expect(result.current.newSearchResultKeys?.size).toBe(2);

        const scrollToIndex = jest.fn();
        const ref: NonNullable<Parameters<typeof result.current.handleSelectionListScroll>[1]> = {
            scrollAndHighlightItem: jest.fn(),
            scrollToIndex,
            updateFocusedIndex: jest.fn(),
            scrollToFocusedInput: jest.fn(),
            focusTextInput: jest.fn(),
        };

        const listItem1 = createMock<SearchListItem>({transactionID: '1'});
        const listItem2 = createMock<SearchListItem>({transactionID: '2'});

        result.current.handleSelectionListScroll([listItem1, listItem2], ref);
        result.current.handleSelectionListScroll([listItem2, listItem1], ref);

        expect(scrollToIndex).not.toHaveBeenCalled();
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
        const updatedProps1 = createMock<UseSearchHighlightAndScroll>({
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
                transactions_1: {transactionID: '1'},
                transactions_2: {transactionID: '2'},
                transactions_3: {transactionID: '3'},
            },
            previousTransactions: {
                transactions_1: {transactionID: '1'},
            },
        });

        // When there is no data yet, even if the transactionID has been added to manual highlight transactionIDs,
        // it still will not be included in newSearchResultKeys.
        rerender(updatedProps1);
        expect(result.current.newSearchResultKeys?.size).toBe(2);
        expect([...(result.current.newSearchResultKeys ?? new Set())]).not.toContain('transactions_3');

        // When the data contains the highlight transactionID, it will be highlighted.
        const updatedProps2 = createMock<UseSearchHighlightAndScroll>({
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
        });

        rerender(updatedProps2);
        expect(result.current.newSearchResultKeys?.size).toBe(1);
        expect([...(result.current.newSearchResultKeys ?? new Set())]).toContain('transactions_3');

        expect(spyOnMergeTransactionIdsHighlightOnSearchRoute).toHaveBeenCalledWith(baseProps.queryJSON.type, {'3': false});
    });

    it('should return multiple new search result keys when there are multiple new chats', () => {
        const chatProps = createMock<UseSearchHighlightAndScroll>({
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, type: 'chat' as const},
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                },
            },
        });
        const {rerender, result} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: chatProps,
        });
        const updatedProps = createMock<UseSearchHighlightAndScroll>({
            ...chatProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    reportActions_1: {
                        '1': {actionName: 'CREATED', reportActionID: '1'},
                    },
                    reportActions_2: {
                        '2': {actionName: 'CREATED', reportActionID: '2'},
                    },
                },
            },
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                },
                reportActions_2: {
                    '2': {actionName: 'CREATED', reportActionID: '2'},
                },
                reportActions_3: {
                    '3': {actionName: 'CREATED', reportActionID: '3'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'CREATED', reportActionID: '1'},
                },
            },
        });
        rerender(updatedProps);
        expect(result.current.newSearchResultKeys?.size).toBe(2);
    });
});
