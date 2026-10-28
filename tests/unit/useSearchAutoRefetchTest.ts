/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';

import useSearchAutoRefetch from '@hooks/useSearchAutoRefetch';
import type {UseSearchAutoRefetch} from '@hooks/useSearchAutoRefetch';

import {search} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MemberCustomFieldsByPolicyID} from '@src/selectors/Policy';
import type {Transaction} from '@src/types/onyx';

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

afterEach(() => {
    jest.clearAllMocks();
    mockIsOffline = false;
    mockUseIsFocused.mockReturnValue(true);
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
