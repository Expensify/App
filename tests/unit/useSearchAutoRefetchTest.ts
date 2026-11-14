/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';

import useSearchAutoRefetch from '@hooks/useSearchAutoRefetch';
import type {UseSearchAutoRefetch} from '@hooks/useSearchAutoRefetch';

import {search} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MemberCustomFieldsByPolicyID} from '@src/selectors/Policy';
import type {Transaction} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';

const mockUseIsFocused = jest.fn((): boolean => true);

jest.mock('@libs/actions/Search');
jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => mockUseIsFocused(),
    createNavigationContainerRef: () => ({}),
}));
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => false));
jest.mock('@rnmapbox/maps', () => ({
    __esModule: true,
    default: {},
    MarkerView: {},
    setAccessToken: jest.fn(),
}));

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: mockIsOffline})));

let mockIsInPreloadedTab = false;
jest.mock('@hooks/useIsInPreloadedTab', () => jest.fn(() => mockIsInPreloadedTab));

afterEach(() => {
    jest.clearAllMocks();
    mockIsOffline = false;
    mockUseIsFocused.mockReturnValue(true);
    mockIsInPreloadedTab = false;
});

describe('useSearchAutoRefetch', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    const baseProps: UseSearchAutoRefetch = {
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
        memberCustomFields: {},
        previousMemberCustomFields: {},
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
        renderHook(() => useSearchAutoRefetch(baseProps));
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when new transaction added and focused', () => {
        const initialProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            transactions: {transactions_1: {transactionID: '1'}},
            previousTransactions: {transactions_1: {transactionID: '1'}},
        });

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps: baseProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            transactions: {transactions_1: {transactionID: '1'}},
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search for chat when report actions added and focused', () => {
        mockUseIsFocused.mockReturnValue(true);

        const chatProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps: chatProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
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
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            transactions: {
                transactions_1: {transactionID: '1'},
            },
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a transaction that is absent from the results is added', () => {
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
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
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
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
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...initialProps,
            transactions: {transactions_1: {transactionID: '1', amount: 250}},
        });

        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it.each([
        ['edited', {amount: 250}],
        ['removed from its report', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}],
    ])('should trigger search on a grouped search when a transaction is %s', (_, transactionChange) => {
        // Given a search grouped by approver, whose snapshot only holds the groups and not their transactions or reports
        const transaction = createMock<Transaction>({transactionID: '1', amount: 100, reportID: '10'});
        const initialProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, groupBy: CONST.SEARCH.GROUP_BY.APPROVER},
            transactions: {transactions_1: transaction},
            previousTransactions: {transactions_1: transaction},
        });
        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        // When the transaction changes
        rerender(createMock<UseSearchAutoRefetch>({...initialProps, transactions: {transactions_1: {...transaction, ...transactionChange}}}));

        // Then the search runs again, because the snapshot can't show whether the change touches one of its groups
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should not trigger search when the edited transaction is absent from the results', () => {
        const visibleTransaction = createMock<Transaction>({transactionID: '1', amount: 100});
        const filteredOutTransaction = createMock<Transaction>({transactionID: '99', amount: 100});
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...initialProps,
            transactions: {transactions_1: visibleTransaction, transactions_99: {transactionID: '99', amount: 250}},
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a transaction moves into a report the results display', () => {
        const movedTransaction = createMock<Transaction>({transactionID: '99', reportID: '5'});
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...initialProps,
            transactions: {transactions_99: {transactionID: '99', reportID: '2'}},
        });

        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when a transaction moves between reports the results do not display', () => {
        const movedTransaction = createMock<Transaction>({transactionID: '99', reportID: '5'});
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...initialProps,
            transactions: {transactions_99: {transactionID: '99', reportID: '7'}},
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger the deferred search once Search is active again, after previousTransactions caught up', () => {
        const transaction = createMock<Transaction>({transactionID: '1', amount: 100});
        const editedTransaction = createMock<Transaction>({transactionID: '1', amount: 250});
        const initialProps = createMock<UseSearchAutoRefetch>({
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
        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const editedProps = createMock<UseSearchAutoRefetch>({...initialProps, transactions: {transactions_1: editedTransaction}});

        rerender(editedProps);
        expect(search).not.toHaveBeenCalled();

        // `usePrevious` catches up while Search is inactive, so the edit is no longer visible to the comparisons.
        const settledProps = createMock<UseSearchAutoRefetch>({...editedProps, previousTransactions: {transactions_1: editedTransaction}});

        rerender(settledProps);
        expect(search).not.toHaveBeenCalled();

        mockIsOffline = false;

        rerender({...settledProps});
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should not keep a deferred search from a preloaded tab for when it is opened', () => {
        // Given a Spend tab preloaded at idle that is not active yet, showing an expense
        const transaction = createMock<Transaction>({transactionID: '1', amount: 100});
        const editedTransaction = createMock<Transaction>({transactionID: '1', amount: 250});
        const initialProps = createMock<UseSearchAutoRefetch>({
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
        mockIsInPreloadedTab = true;
        mockIsOffline = true;
        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        // When that expense changes while the tab is hidden, and the user then opens the tab
        const editedProps = createMock<UseSearchAutoRefetch>({...initialProps, transactions: {transactions_1: editedTransaction}});
        rerender(editedProps);
        rerender(createMock<UseSearchAutoRefetch>({...editedProps, previousTransactions: {transactions_1: editedTransaction}}));
        mockIsInPreloadedTab = false;
        mockIsOffline = false;
        rerender(createMock<UseSearchAutoRefetch>({...editedProps, previousTransactions: {transactions_1: editedTransaction}}));

        // Then no refetch goes out, since the page refreshes the whole snapshot on first open and a second request would repeat it
        expect(search).not.toHaveBeenCalled();
    });

    it('should not trigger search when only the snapshot changes and the collections are unchanged', () => {
        // Given Search rendered with a transaction the results show, where `usePrevious` has caught up so both collections are the same object
        const reportActions = {};
        const transactions = {transactions_1: createMock<Transaction>({transactionID: '1', amount: 100})};
        const initialProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {transactionID: '1'},
                },
            },
            transactions,
            previousTransactions: transactions,
            reportActions,
            previousReportActions: reportActions,
        });

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        // When a new snapshot arrives without any transaction changing, which re-runs the effect through its `searchResultsData` dependency
        rerender(
            createMock<UseSearchAutoRefetch>({
                ...initialProps,
                searchResults: {
                    ...baseProps.searchResults,
                    data: {
                        transactions_1: {transactionID: '1'},
                        transactions_2: {transactionID: '2'},
                    },
                },
            }),
        );

        // Then no search is triggered, because nothing in the collections changed since the last run
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger the deferred search when the collections are the same object once Search is active again', () => {
        // Given Search rendered offline with a transaction the results show and no report action changes
        const reportActions = {};
        const transaction = createMock<Transaction>({transactionID: '1', amount: 100});
        const editedTransaction = createMock<Transaction>({transactionID: '1', amount: 250});
        const initialProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: {transactionID: '1'},
                },
            },
            transactions: {transactions_1: transaction},
            previousTransactions: {transactions_1: transaction},
            reportActions,
            previousReportActions: reportActions,
        });

        mockIsOffline = true;
        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        // When the transaction is edited while offline, which defers the search
        const editedTransactions = {transactions_1: editedTransaction};
        rerender(createMock<UseSearchAutoRefetch>({...initialProps, transactions: editedTransactions}));
        expect(search).not.toHaveBeenCalled();

        // And `usePrevious` catches up, so both collections are the same object like they are in Search
        const settledProps = createMock<UseSearchAutoRefetch>({...initialProps, transactions: editedTransactions, previousTransactions: editedTransactions});
        rerender(settledProps);
        expect(search).not.toHaveBeenCalled();

        // And the network comes back
        mockIsOffline = false;
        rerender({...settledProps});

        // Then the deferred search still runs, because unchanged collections must not swallow a pending refetch
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should not trigger search on a non-chat search when a report action was added and Onyx holds a transaction the query filters out', () => {
        const transaction1 = createMock<Transaction>({transactionID: '1'});
        const transaction99 = createMock<Transaction>({transactionID: '99'});
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
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
        const initialProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
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

        const chatProps = createMock<UseSearchAutoRefetch>({
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

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps: chatProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
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

    describe('workflow report actions', () => {
        const transaction1 = createMock<Transaction>({transactionID: '1'});
        const approverProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, groupBy: 'approver' as const},
            searchResults: {
                ...baseProps.searchResults,
                data: {
                    transactions_1: transaction1,
                },
            },
            transactions: {transactions_1: transaction1},
            previousTransactions: {transactions_1: transaction1},
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

        const withAddedAction = (props: UseSearchAutoRefetch, actionName: ReportActionName) =>
            createMock<UseSearchAutoRefetch>({
                ...props,
                reportActions: {
                    reportActions_1: {
                        '1': {actionName: 'CREATED', reportActionID: '1'},
                        '2': {actionName, reportActionID: '2'},
                    },
                },
            });

        it.each<ReportActionName>(CONST.REPORT.WORKFLOW_ACTIONS)('should trigger search when a %s report action is added while grouped by approver', (actionName) => {
            // Given a search grouped by approver whose results already show a row
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: approverProps,
            });

            // When a workflow action such as an approval or an approver change is added, which changes no transaction
            rerender(withAddedAction(approverProps, actionName));

            // Then the search runs again, because the report's expenses can move in or out of an approver group
            expect(search).toHaveBeenCalledTimes(1);
        });

        it.each([CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO])(
            'should trigger search when an APPROVED report action is added while the has:approved-violation filter uses %s',
            (operator) => {
                // Given a search that includes or excludes approved violations, whose results already show a row
                const approvedViolationProps = createMock<UseSearchAutoRefetch>({
                    ...approverProps,
                    queryJSON: {
                        ...baseProps.queryJSON,
                        flatFilters: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS, filters: [{operator, value: CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION}]}],
                    },
                });
                const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                    initialProps: approvedViolationProps,
                });

                // When a report is approved, which adds a report action but changes no transaction
                rerender(withAddedAction(approvedViolationProps, 'APPROVED'));

                // Then the search runs again, because the report's violations now count as approved violations either way
                expect(search).toHaveBeenCalledTimes(1);
            },
        );

        it.each([CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO])(
            'should trigger search when a SUBMITTED report action is added while the has:submitted-violation filter uses %s',
            (operator) => {
                // Given a search that includes or excludes submitted violations, whose results already show a row
                const submittedViolationProps = createMock<UseSearchAutoRefetch>({
                    ...approverProps,
                    queryJSON: {
                        ...baseProps.queryJSON,
                        flatFilters: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS, filters: [{operator, value: CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION}]}],
                    },
                });
                const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                    initialProps: submittedViolationProps,
                });

                // When a report is submitted, which adds a report action but changes no transaction
                rerender(withAddedAction(submittedViolationProps, 'SUBMITTED'));

                // Then the search runs again, because the report's violations now count as submitted violations either way
                expect(search).toHaveBeenCalledTimes(1);
            },
        );

        it('should not trigger search when a non-approval report action is added while grouped by approver', () => {
            // Given a search grouped by approver whose results already show a row
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: approverProps,
            });

            // When a comment is added, which doesn't change who approves the report
            rerender(withAddedAction(approverProps, 'ADDCOMMENT'));

            // Then no search is triggered
            expect(search).not.toHaveBeenCalled();
        });

        it("should not trigger search when an approval report action is added and the query doesn't depend on workflow state", () => {
            // Given a search with no approver grouping and no approver, workflow date or violation filter
            const ungroupedProps = createMock<UseSearchAutoRefetch>({...approverProps, queryJSON: baseProps.queryJSON});
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: ungroupedProps,
            });

            // When a report is approved
            rerender(withAddedAction(ungroupedProps, 'APPROVED'));

            // Then no search is triggered, because the query's results don't depend on the report's workflow state
            expect(search).not.toHaveBeenCalled();
        });
    });

    describe('member custom field changes', () => {
        const transactions = {transactions_1: createMock<Transaction>({transactionID: '1'})};
        const reportActions = {};
        const memberWithUserID = (employeeUserID: string): MemberCustomFieldsByPolicyID => ({'1': {'a@b.com': {employeeUserID}}});

        const buildProps = (memberCustomFields: MemberCustomFieldsByPolicyID | undefined, previousMemberCustomFields: MemberCustomFieldsByPolicyID | undefined) =>
            createMock<UseSearchAutoRefetch>({
                ...baseProps,
                transactions,
                previousTransactions: transactions,
                reportActions,
                previousReportActions: reportActions,
                memberCustomFields,
                previousMemberCustomFields,
            });

        it('should trigger search when a member custom field changes on a policy the results display', () => {
            // Given results whose member custom fields have loaded once
            const oldFields = memberWithUserID('OLD');
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(oldFields, oldFields),
            });

            // When a member's custom field value changes
            rerender(buildProps(memberWithUserID('NEW'), oldFields));

            // Then one search is sent so the snapshot picks up the new value
            expect(search).toHaveBeenCalledTimes(1);
            expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
        });

        it('should defer the search for a member custom field change until Search is focused again', () => {
            // Given Search is not the focused screen
            const oldFields = memberWithUserID('OLD');
            const newFields = memberWithUserID('NEW');
            mockUseIsFocused.mockReturnValue(false);
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(oldFields, oldFields),
            });

            // When a member's custom field changes while Search is blurred
            rerender(buildProps(newFields, oldFields));
            expect(search).not.toHaveBeenCalled();

            rerender(buildProps(newFields, newFields));
            expect(search).not.toHaveBeenCalled();

            // Then the search fires once Search regains focus
            mockUseIsFocused.mockReturnValue(true);
            rerender(buildProps(newFields, newFields));
            expect(search).toHaveBeenCalledTimes(1);
        });

        it('should not trigger search when the custom fields are rewritten with the same values', () => {
            // Given a member whose custom fields have loaded
            const oldFields = memberWithUserID('OLD');
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(oldFields, oldFields),
            });

            // When the projection is replaced by an equal one
            rerender(buildProps(memberWithUserID('OLD'), oldFields));

            // Then no search is sent
            expect(search).not.toHaveBeenCalled();
        });

        it('should not trigger search when a policy or member first appears in the custom fields', () => {
            // Given no custom fields have loaded for the results yet
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps({}, {}),
            });

            // When a policy and its member arrive for the first time
            rerender(buildProps(memberWithUserID('NEW'), {}));

            // Then no search is sent, since nothing the results already show has changed
            expect(search).not.toHaveBeenCalled();
        });
    });
});
