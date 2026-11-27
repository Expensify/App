/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook} from '@testing-library/react-native';

import useSearchAutoRefetch from '@hooks/useSearchAutoRefetch';
import type {UseSearchAutoRefetch} from '@hooks/useSearchAutoRefetch';

import {search} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MemberCustomFieldsByPolicyID} from '@src/selectors/Policy';
import type {Transaction} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockUseIsFocused = jest.fn((): boolean => true);

jest.mock('@libs/actions/Search');
jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => mockUseIsFocused(),
    createNavigationContainerRef: () => ({}),
}));
let mockIsSearchTopmostFullScreenRoute = false;
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => mockIsSearchTopmostFullScreenRoute));
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

let mockIsClientTheLeader = true;
jest.mock('@libs/ActiveClientManager', () => ({...jest.requireActual<Record<string, unknown>>('@libs/ActiveClientManager'), isClientTheLeader: jest.fn(() => mockIsClientTheLeader)}));

let lastWriteID = 0;

/** Raises the signal FlagSearchTransactionWrites sends once a user write to these transactions succeeds. */
async function signalTransactionWrite(transactionIDs: string[], reportIDs: string[] = []) {
    lastWriteID += 1;
    const writeID = lastWriteID;
    // The merge re-renders the mounted hook, so it runs inside act.
    await act(() =>
        Onyx.merge(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES, {
            writeID,
            oldestWriteID: 1,
            transactionIDs: Object.fromEntries(transactionIDs.map((id) => [id, writeID])),
            reportIDs: Object.fromEntries(reportIDs.map((id) => [id, writeID])),
        }),
    );
    await waitForBatchedUpdatesWithAct();
}

afterEach(async () => {
    await Onyx.set(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES, null);
    jest.clearAllMocks();
    mockIsOffline = false;
    mockUseIsFocused.mockReturnValue(true);
    mockIsInPreloadedTab = false;
    mockIsSearchTopmostFullScreenRoute = false;
    mockIsClientTheLeader = true;
});

/** Counts reads of the transaction's fields */
function trackReads(transaction: Transaction) {
    const reads = {count: 0};
    const trackedTransaction = new Proxy(transaction, {
        get: (target, property, receiver) => {
            reads.count++;
            return Reflect.get(target, property, receiver) as unknown;
        },
    });
    return {trackedTransaction, reads};
}

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

    /** A Search result row for a transaction. */
    const row = (transactionID: string) => createMock<SearchTransaction>({transactionID});

    /** Renders the hook with `data` as the results and `transactions` as both the current and previous collection. */
    function renderWithResults(
        data: NonNullable<UseSearchAutoRefetch['searchResults']>['data'],
        transactions: UseSearchAutoRefetch['transactions'],
        overrides: Partial<UseSearchAutoRefetch> = {},
    ) {
        const initialProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            searchResults: {...baseProps.searchResults, data},
            transactions,
            previousTransactions: transactions,
            ...overrides,
        });
        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {initialProps});
        return {initialProps, rerender: (props: Partial<UseSearchAutoRefetch>) => rerender(createMock<UseSearchAutoRefetch>({...initialProps, ...props}))};
    }

    it('should not trigger search when collections are empty', () => {
        renderHook(() => useSearchAutoRefetch(baseProps));
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when new transaction added and focused', () => {
        const initialProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            transactions: {transactions_1: row('1')},
            previousTransactions: {transactions_1: row('1')},
        });

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            transactions: {
                transactions_1: row('1'),
                transactions_2: row('2'),
            },
            previousTransactions: {transactions_1: row('1')},
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
            transactions: {transactions_1: row('1')},
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
                transactions_1: row('1'),
                transactions_2: row('2'),
            },
            previousTransactions: {
                transactions_1: row('1'),
                transactions_2: row('2'),
            },
        });

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...baseProps,
            transactions: {
                transactions_1: row('1'),
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
                    transactions_1: row('1'),
                },
            },
            transactions: {
                transactions_1: row('1'),
            },
            previousTransactions: {
                transactions_1: row('1'),
            },
        });

        const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
            initialProps,
        });

        const updatedProps = createMock<UseSearchAutoRefetch>({
            ...initialProps,
            transactions: {
                transactions_1: row('1'),
                transactions_2: row('2'),
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
                    transactions_1: row('1'),
                    transactions_2: row('2'),
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
                transactions_2: row('2'),
            },
        });

        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a user write changes a transaction that is already in the results', async () => {
        // Given Search showing an expense
        const {rerender} = renderWithResults({transactions_1: row('1')}, {transactions_1: createMock<Transaction>({transactionID: '1', amount: 100})});

        // When the user edits it and the write succeeds
        rerender({transactions: {transactions_1: createMock<Transaction>({transactionID: '1', amount: 250})}});
        await signalTransactionWrite(['1']);

        // Then Search requests the results again, because the footer total and row actions are computed by the server
        expect(search).toHaveBeenCalledTimes(1);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it.each([
        ['edited', {amount: 250}],
        ['removed from its report', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}],
    ])('should trigger search on a grouped search when a written transaction is %s', async (_, transactionChange) => {
        // Given a search grouped by approver, whose snapshot only holds the groups and not their transactions or reports
        const transaction = createMock<Transaction>({transactionID: '1', amount: 100, reportID: '10'});
        const {rerender} = renderWithResults({}, {transactions_1: transaction}, {queryJSON: {...baseProps.queryJSON, groupBy: CONST.SEARCH.GROUP_BY.APPROVER}});

        // When the transaction changes and the write succeeds
        rerender({transactions: {transactions_1: {...transaction, ...transactionChange}}});
        await signalTransactionWrite(['1']);

        // Then the search runs again, because the snapshot can't show whether the change touches one of its groups
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should handle a write that succeeds while an earlier refetch is still running', async () => {
        // Given Search showing an expense whose first edit started a refetch that has not answered yet
        const loading = {...baseProps.searchResults, isLoading: true, search: {...baseProps.searchResults?.search, isLoading: true}};
        const {initialProps, rerender} = renderWithResults({transactions_1: row('1')}, {transactions_1: createMock<Transaction>({transactionID: '1', amount: 100})});
        await signalTransactionWrite(['1']);
        rerender({searchResults: createMock<UseSearchAutoRefetch['searchResults']>({...loading, data: initialProps.searchResults?.data})});

        // When a second edit succeeds during that request, and the request then answers
        await signalTransactionWrite(['1']);
        rerender({searchResults: initialProps.searchResults});

        // Then Search requests the results again for the second edit instead of staying one edit behind
        expect(search).toHaveBeenCalledTimes(2);
    });

    it('should not trigger search when a read rewrites a transaction that is in the results', () => {
        // Given Search showing an expense seeded from its Search row
        const {rerender} = renderWithResults({transactions_1: row('1')}, {transactions_1: createMock<Transaction>({transactionID: '1', posted: '2026-11-13'})});

        // When OpenReport replaces it with the server's shape of the same expense, which no user write signals
        rerender({transactions: {transactions_1: createMock<Transaction>({transactionID: '1', posted: '20261113000000'})}});

        // Then Search does not refetch, because nothing the results show has changed
        expect(search).not.toHaveBeenCalled();
    });

    it('should not trigger search when the written transaction is absent from the results', async () => {
        // Given Search showing one expense while Onyx also holds one the query filters out
        renderWithResults({transactions_1: row('1')}, {transactions_1: createMock<Transaction>({transactionID: '1'}), transactions_99: createMock<Transaction>({transactionID: '99'})});

        // When a write to the filtered-out expense succeeds
        await signalTransactionWrite(['99']);

        // Then Search does not refetch, because the results do not depend on it
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a written transaction moves into a report the results display', async () => {
        // Given Search showing a report, and an expense outside it
        const {rerender} = renderWithResults({report_2: {reportID: '2'}}, {transactions_99: createMock<Transaction>({transactionID: '99', reportID: '5'})});

        // When the user moves the expense into that report and the write succeeds
        rerender({transactions: {transactions_99: createMock<Transaction>({transactionID: '99', reportID: '2'})}});
        await signalTransactionWrite(['99']);

        // Then Search requests the results again, because the report row owes its count and total to the server
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should not trigger search when a written transaction moves between reports the results do not display', async () => {
        // Given Search showing a report, and an expense outside it
        const {rerender} = renderWithResults({report_2: {reportID: '2'}}, {transactions_99: createMock<Transaction>({transactionID: '99', reportID: '5'})});

        // When the user moves it to another report the results do not show
        rerender({transactions: {transactions_99: createMock<Transaction>({transactionID: '99', reportID: '7'})}});
        await signalTransactionWrite(['99']);

        // Then Search does not refetch
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a written transaction leaves a report the results display', async () => {
        // Given Search showing report 2, but not its expense 99, which the query filters out
        const {rerender} = renderWithResults({report_2: {reportID: '2'}}, {transactions_99: createMock<Transaction>({transactionID: '99', reportID: '2'})});

        // When the user moves the expense to a report the results do not show, and the write succeeds
        rerender({transactions: {transactions_99: createMock<Transaction>({transactionID: '99', reportID: '7'})}});
        await signalTransactionWrite(['99'], ['2']);

        // Then Search requests the results again, because report 2 lost an expense from its count and total
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should trigger search for an earlier write when a later one lands before the hook handles it', async () => {
        // Given Search showing expense 1 while Onyx also holds expense 99, which the query filters out, and the hook skipping its checks for now, as a frozen tab does
        mockIsInPreloadedTab = true;
        const {rerender} = renderWithResults(
            {transactions_1: row('1')},
            {transactions_1: createMock<Transaction>({transactionID: '1'}), transactions_99: createMock<Transaction>({transactionID: '99'})},
        );

        // When writes to expense 1 and then expense 99 both succeed before the hook checks the signal
        await signalTransactionWrite(['1']);
        await signalTransactionWrite(['99']);
        mockIsInPreloadedTab = false;
        rerender({});

        // Then Search still requests the results again, because the edit to expense 1 was not lost behind the later one
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should trigger search when it missed writes that were already dropped from the signal', async () => {
        // Given Search showing expense 1, skipping its checks for now as a frozen tab does
        mockIsInPreloadedTab = true;
        const {rerender} = renderWithResults({transactions_1: row('1')}, {transactions_1: createMock<Transaction>({transactionID: '1'})});

        // When so many writes succeed meanwhile that the ones it missed are dropped, and the kept one changes an expense the results do not show
        lastWriteID += 200;
        await act(() =>
            Onyx.set(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES, {
                writeID: lastWriteID,
                oldestWriteID: lastWriteID,
                transactionIDs: Object.fromEntries([['99', lastWriteID]]),
                reportIDs: {},
            }),
        );
        mockIsInPreloadedTab = false;
        rerender({});

        // Then Search requests the results again, because it cannot tell whether a dropped write changed one of its rows
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should trigger search in a background tab when another tab changes a transaction in the results', () => {
        // Given Search in a tab that is not the leader, which never receives the write signal because it is RAM-only
        mockIsClientTheLeader = false;
        const {rerender} = renderWithResults({transactions_1: row('1')}, {transactions_1: createMock<Transaction>({transactionID: '1', amount: 100})});

        // When the leader tab edits the expense and the new transaction syncs over
        rerender({transactions: {transactions_1: createMock<Transaction>({transactionID: '1', amount: 250})}});

        // Then Search requests the results again, falling back to comparing the synced transactions
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should not trigger search in a background tab when another tab writes a transaction in the results with the same values', () => {
        // Given Search in a tab that is not the leader
        mockIsClientTheLeader = false;
        const transaction = createMock<Transaction>({transactionID: '1', amount: 100});
        const {rerender} = renderWithResults({transactions_1: row('1')}, {transactions_1: transaction});

        // When another tab's Search response writes the same transaction, so this tab reads it back from storage as a new object with unchanged values
        rerender({transactions: {transactions_1: {...transaction}}});

        // Then Search does not request the results again. Otherwise two background tabs on the same to-do search refetch each other's responses forever.
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger the deferred search once Search is active again, after previousTransactions caught up', async () => {
        // Given Search showing an expense while it is offline
        mockIsOffline = true;
        const edited = {transactions_1: createMock<Transaction>({transactionID: '1', amount: 250})};
        const {rerender} = renderWithResults({transactions_1: row('1')}, {transactions_1: createMock<Transaction>({transactionID: '1', amount: 100})});

        // When a write to it succeeds before the network flag catches up, which defers the search
        rerender({transactions: edited});
        await signalTransactionWrite(['1']);

        // And `usePrevious` catches up while Search is inactive, so the edit is no longer visible to the comparisons
        rerender({transactions: edited, previousTransactions: {...edited}});
        expect(search).not.toHaveBeenCalled();

        // Then the deferred search runs once the network comes back
        mockIsOffline = false;
        rerender({transactions: edited, previousTransactions: {...edited}});
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
                    transactions_1: row('1'),
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
                    transactions_1: row('1'),
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
                        transactions_1: row('1'),
                        transactions_2: row('2'),
                    },
                },
            }),
        );

        // Then no search is triggered, because nothing in the collections changed since the last run
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger the deferred search when the collections are the same object once Search is active again', async () => {
        // Given Search rendered offline with a transaction the results show and no report action changes
        mockIsOffline = true;
        const reportActions = {};
        const edited = {transactions_1: createMock<Transaction>({transactionID: '1', amount: 250})};
        const {rerender} = renderWithResults(
            {transactions_1: row('1')},
            {transactions_1: createMock<Transaction>({transactionID: '1', amount: 100})},
            {reportActions, previousReportActions: reportActions},
        );

        // When a write to the transaction succeeds while Search still reads offline, and `usePrevious` catches up so both collections are the same object
        rerender({transactions: edited});
        await signalTransactionWrite(['1']);
        rerender({transactions: edited, previousTransactions: edited});
        expect(search).not.toHaveBeenCalled();

        // Then the deferred search still runs when the network comes back, because unchanged collections must not swallow a pending refetch
        mockIsOffline = false;
        rerender({transactions: edited, previousTransactions: edited});
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
                    transactions_1: row('1'),
                    transactions_2: row('2'),
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
                transactions_2: row('2'),
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

    it('should not trigger search when a report opens and the results show rows that were never loaded into Onyx', () => {
        // Given Search showing three expenses, only one of which was ever loaded into Onyx
        const loaded = createMock<Transaction>({transactionID: '1'});
        const {rerender} = renderWithResults({transactions_1: row('1'), transactions_2: row('2'), transactions_3: row('3')}, {transactions_1: loaded});

        // When opening a report loads another expense the results already show
        rerender({transactions: {transactions_1: loaded, transactions_2: createMock<Transaction>({transactionID: '2'})}});

        // Then Search does not refetch, because a row missing from Onyx was never loaded rather than deleted
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when a transaction the results show is deleted', () => {
        // Given Search showing two loaded expenses and one that was never loaded
        const transaction1 = createMock<Transaction>({transactionID: '1'});
        const {rerender} = renderWithResults(
            {transactions_1: row('1'), transactions_2: row('2'), transactions_3: row('3')},
            {transactions_1: transaction1, transactions_2: createMock<Transaction>({transactionID: '2'})},
        );

        // When one of them is deleted while the unloaded one gets loaded
        rerender({transactions: {transactions_1: transaction1, transactions_3: createMock<Transaction>({transactionID: '3'})}});

        // Then Search requests the results again, because a row on screen no longer exists
        expect(search).toHaveBeenCalledTimes(1);
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

        it('should refetch on refocus for a member custom field change on a policy that first showed up in the results while Search was hidden', () => {
            // Given a hidden Search whose results haven't loaded any policy yet
            const oldFields = memberWithUserID('OLD');
            const newFields = memberWithUserID('NEW');
            mockUseIsFocused.mockReturnValue(false);
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps({}, {}),
            });

            // When the response brings in the policy while hidden, and its member's custom field then changes
            rerender(buildProps(oldFields, {}));
            rerender(buildProps(oldFields, oldFields));
            rerender(buildProps(newFields, oldFields));
            rerender(buildProps(newFields, newFields));
            expect(search).not.toHaveBeenCalled();

            // Then the search fires once Search regains focus, since the policy's fields from before the edit became its baseline
            mockUseIsFocused.mockReturnValue(true);
            rerender(buildProps(newFields, newFields));
            expect(search).toHaveBeenCalledTimes(1);
        });

        it('should refetch on refocus for a custom field change on a member that first showed up in a known policy while Search was hidden', () => {
            // Given a hidden Search whose results show a policy with one member
            const oneMember = memberWithUserID('A');
            const joinedFields: MemberCustomFieldsByPolicyID = {'1': {'a@b.com': {employeeUserID: 'A'}, 'new@b.com': {employeeUserID: 'OLD'}}};
            const editedFields: MemberCustomFieldsByPolicyID = {'1': {'a@b.com': {employeeUserID: 'A'}, 'new@b.com': {employeeUserID: 'NEW'}}};
            mockUseIsFocused.mockReturnValue(false);
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(oneMember, oneMember),
            });

            // When a member joins that policy while hidden, and their custom field then changes
            rerender(buildProps(joinedFields, oneMember));
            rerender(buildProps(joinedFields, joinedFields));
            rerender(buildProps(editedFields, joinedFields));
            rerender(buildProps(editedFields, editedFields));
            expect(search).not.toHaveBeenCalled();

            // Then the search fires once Search regains focus, since the member's fields from before the edit became their baseline
            mockUseIsFocused.mockReturnValue(true);
            rerender(buildProps(editedFields, editedFields));
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

    describe('Select all jobs', () => {
        const BULK_ACTION_KEY = `${ONYXKEYS.COLLECTION.BULK_ACTION}job1` as const;

        afterEach(async () => {
            await Onyx.clear();
        });

        it('searches again when a Select all job finishes', async () => {
            // Given Search is open while a Select all job runs
            await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE});
            renderHook(() => useSearchAutoRefetch(baseProps));
            await waitForBatchedUpdatesWithAct();
            expect(search).not.toHaveBeenCalled();

            // When the job finishes
            await Onyx.merge(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, total: 1, failedReportIDs: []});
            await waitForBatchedUpdatesWithAct();

            // Then the search runs again, since the job changed reports the results show
            expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
        });

        it('searches again from the first page when a Select all job finishes after more pages loaded', async () => {
            // Given Search is open on its third page while a Select all job runs
            await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE});
            renderHook(() => useSearchAutoRefetch({...baseProps, offset: 100}));
            await waitForBatchedUpdatesWithAct();

            // When the job finishes
            await Onyx.merge(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, total: 1, failedReportIDs: []});
            await waitForBatchedUpdatesWithAct();

            // Then the search starts over, since the job can change reports on the pages already loaded
            expect(search).toHaveBeenCalledWith(expect.objectContaining({offset: 0}));
        });

        it('does not search again for a Select all job that finished while its tab was preloaded', async () => {
            // Given a preloaded Search tab while a Select all job runs
            mockIsInPreloadedTab = true;
            await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE});
            const {rerender} = renderHook(() => useSearchAutoRefetch(baseProps));
            await waitForBatchedUpdatesWithAct();
            await Onyx.merge(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, total: 1, failedReportIDs: []});
            await waitForBatchedUpdatesWithAct();

            // When the user opens the tab
            mockIsInPreloadedTab = false;
            rerender(baseProps);
            await waitForBatchedUpdatesWithAct();

            // Then nothing is searched here, since opening the tab already refreshes its whole snapshot
            expect(search).not.toHaveBeenCalled();
        });

        it('searches again when a running job is deleted after Concierge sends its summary', async () => {
            // Given Search is open while a Select all job runs
            await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE, shouldSendFromConcierge: true});
            renderHook(() => useSearchAutoRefetch(baseProps));
            await waitForBatchedUpdatesWithAct();

            // When its record is deleted before a finished state shows up
            await Onyx.set(BULK_ACTION_KEY, null);
            await waitForBatchedUpdatesWithAct();

            // Then the search still runs again
            expect(search).toHaveBeenCalledTimes(1);
        });

        it('searches again once Search is back in focus when a Select all job finished while it was away', async () => {
            // Given a Select all job running while the user is on another page
            await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE});
            mockUseIsFocused.mockReturnValue(false);
            const {rerender} = renderHook(() => useSearchAutoRefetch(baseProps));
            await waitForBatchedUpdatesWithAct();
            await Onyx.merge(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, total: 1, failedReportIDs: []});
            await waitForBatchedUpdatesWithAct();
            expect(search).not.toHaveBeenCalled();

            // When the user comes back to Search
            mockUseIsFocused.mockReturnValue(true);
            rerender(baseProps);
            await waitForBatchedUpdatesWithAct();

            // Then the search runs again, since the job changed reports the results show
            expect(search).toHaveBeenCalledTimes(1);
        });

        it('searches again once a search that was loading when a Select all job finished is done', async () => {
            // Given a Select all job that finishes while a search is loading
            const loadingProps = createMock<UseSearchAutoRefetch>({...baseProps, searchResults: {...baseProps.searchResults, search: {...baseProps.searchResults?.search, isLoading: true}}});
            await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE});
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {initialProps: loadingProps});
            await waitForBatchedUpdatesWithAct();
            await Onyx.merge(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, total: 1, failedReportIDs: []});
            await waitForBatchedUpdatesWithAct();
            expect(search).not.toHaveBeenCalled();

            // When that search finishes loading
            rerender(baseProps);
            await waitForBatchedUpdatesWithAct();

            // Then the search runs again, since the loading one started before the job changed the reports
            expect(search).toHaveBeenCalledTimes(1);
        });

        it('waits for an expense refetch already sent before refreshing from the first page', async () => {
            // Given Search on its third page while a Select all job runs, and an added expense that sends a refetch
            await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE});
            const {initialProps, rerender} = renderWithResults({}, {transactions_1: row('1')}, {offset: 100});
            await waitForBatchedUpdatesWithAct();
            const transactions = {transactions_1: row('1'), transactions_2: row('2')};
            rerender({transactions, previousTransactions: {transactions_1: row('1')}});
            await waitForBatchedUpdatesWithAct();
            expect(search).toHaveBeenCalledTimes(1);

            // When the job finishes before that refetch's results arrive
            await Onyx.merge(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.DONE, total: 1, failedReportIDs: []});
            await waitForBatchedUpdatesWithAct();

            // Then nothing else is sent until they do, and then the first page is fetched again
            expect(search).toHaveBeenCalledTimes(1);
            rerender({
                transactions,
                previousTransactions: transactions,
                searchResults: createMock<NonNullable<UseSearchAutoRefetch['searchResults']>>({...initialProps.searchResults, data: {transactions_2: row('2')}}),
            });
            await waitForBatchedUpdatesWithAct();
            expect(search).toHaveBeenCalledTimes(2);
            expect(search).toHaveBeenLastCalledWith(expect.objectContaining({offset: 0}));
        });

        it('does not search again while the job is still running', async () => {
            // Given Search is open while a Select all job runs
            await Onyx.set(BULK_ACTION_KEY, {state: CONST.BULK_ACTION.STATE.RUNNING, action: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE});
            renderHook(() => useSearchAutoRefetch(baseProps));
            await waitForBatchedUpdatesWithAct();

            // When the user hands it to Concierge, which doesn't change its state
            await Onyx.merge(BULK_ACTION_KEY, {shouldSendFromConcierge: true});
            await waitForBatchedUpdatesWithAct();

            // Then nothing is searched yet
            expect(search).not.toHaveBeenCalled();
        });
    });

    describe('while Search is inactive', () => {
        // Unedited transactions keep their reference across renders, like in Onyx.
        const transaction1 = createMock<Transaction>({transactionID: '1', amount: 100});
        const transaction2 = createMock<Transaction>({transactionID: '2', amount: 100});
        const resultsWithTransaction1 = createMock<UseSearchAutoRefetch['searchResults']>({
            ...baseProps.searchResults,
            data: {
                transactions_1: {transactionID: '1'},
            },
        });
        const buildProps = (transactions: UseSearchAutoRefetch['transactions'], previousTransactions: UseSearchAutoRefetch['previousTransactions']) =>
            createMock<UseSearchAutoRefetch>({
                ...baseProps,
                searchResults: resultsWithTransaction1,
                transactions,
                previousTransactions,
            });

        it('should not read transaction fields on a write while hidden, nor refetch on refocus when the write does not touch the results', () => {
            // Given a hidden Spend tab with one expense in the results and one outside them
            mockUseIsFocused.mockReturnValue(false);
            const initialTransactions = {transactions_1: transaction1, transactions_2: transaction2};
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(initialTransactions, initialTransactions),
            });

            // When the expense outside the results is edited while hidden
            const {trackedTransaction, reads} = trackReads(createMock<Transaction>({transactionID: '2', amount: 250}));
            const editedTransactions = {transactions_1: transaction1, transactions_2: trackedTransaction};
            rerender(buildProps(editedTransactions, initialTransactions));
            rerender(buildProps(editedTransactions, editedTransactions));

            // Then the hook doesn't diff the transactions while hidden
            expect(reads.count).toBe(0);

            // When the tab is opened again
            mockUseIsFocused.mockReturnValue(true);
            rerender(buildProps(editedTransactions, editedTransactions));

            // Then no refetch goes out, since the results didn't change
            expect(search).not.toHaveBeenCalled();
        });

        it.each([
            ['hidden', () => mockUseIsFocused.mockReturnValue(false), () => mockUseIsFocused.mockReturnValue(true)],
            [
                'offline',
                () => {
                    mockIsOffline = true;
                },
                () => {
                    mockIsOffline = false;
                },
            ],
        ])('should refetch once Search is active again for a user write made while Search is %s', async (_, deactivate, activate) => {
            // Given the leader tab showing an expense while Search can't refetch
            deactivate();
            const initialTransactions = {transactions_1: transaction1};
            const {rerender} = renderWithResults({transactions_1: row('1')}, initialTransactions);

            // When the user edits that expense and the write succeeds
            const editedTransactions = {transactions_1: createMock<Transaction>({transactionID: '1', amount: 250})};
            rerender({transactions: editedTransactions, previousTransactions: initialTransactions});
            await signalTransactionWrite(['1']);
            rerender({transactions: editedTransactions, previousTransactions: editedTransactions});

            // Then nothing is sent yet
            expect(search).not.toHaveBeenCalled();

            // When Search can refetch again
            activate();
            rerender({transactions: editedTransactions, previousTransactions: editedTransactions});

            // Then one refetch goes out, since the write was kept unhandled until Search became active
            expect(search).toHaveBeenCalledTimes(1);
        });

        it('should refetch once the in-flight search responds when the user returns before it does', () => {
            // Given a background tab, which only sees another tab's edits as replaced transactions
            mockIsClientTheLeader = false;
            // And a search is in flight when Spend is left
            const loadingResults = createMock<UseSearchAutoRefetch['searchResults']>({
                ...resultsWithTransaction1,
                search: {...resultsWithTransaction1?.search, isLoading: true},
            });
            const initialTransactions = {transactions_1: transaction1, transactions_2: transaction2};
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(initialTransactions, initialTransactions),
            });
            // That search was started by adding an expense
            const addedTransactions = {...initialTransactions, transactions_3: createMock<Transaction>({transactionID: '3'})};
            rerender(buildProps(addedTransactions, initialTransactions));
            expect(search).toHaveBeenCalledTimes(1);
            const settledProps = createMock<UseSearchAutoRefetch>({...buildProps(addedTransactions, addedTransactions), searchResults: loadingResults});
            mockUseIsFocused.mockReturnValue(false);
            rerender(settledProps);

            // When an expense in the results is edited while hidden and the user returns before the response
            const editedTransactions = {...addedTransactions, transactions_1: createMock<Transaction>({transactionID: '1', amount: 250})};
            rerender(createMock<UseSearchAutoRefetch>({...settledProps, transactions: editedTransactions}));
            rerender(createMock<UseSearchAutoRefetch>({...settledProps, transactions: editedTransactions, previousTransactions: editedTransactions}));
            mockUseIsFocused.mockReturnValue(true);
            rerender(createMock<UseSearchAutoRefetch>({...settledProps, transactions: editedTransactions, previousTransactions: editedTransactions}));
            expect(search).toHaveBeenCalledTimes(1);

            // And the in-flight search responds
            rerender(
                createMock<UseSearchAutoRefetch>({
                    ...buildProps(editedTransactions, editedTransactions),
                    searchResults: {...resultsWithTransaction1, data: {transactions_1: {transactionID: '1'}}},
                }),
            );

            // Then a second refetch goes out, since the edit came after the first search
            expect(search).toHaveBeenCalledTimes(2);
        });

        it('should refetch on refocus when an expense created while hidden is then updated by the server', () => {
            // Given a hidden Spend tab with one expense in the results
            mockUseIsFocused.mockReturnValue(false);
            const initialTransactions = {transactions_1: transaction1};
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(initialTransactions, initialTransactions),
            });

            // When an expense is created elsewhere and optimistically added to the snapshot
            const resultsWithNewExpense = createMock<UseSearchAutoRefetch['searchResults']>({
                ...resultsWithTransaction1,
                data: {transactions_1: {transactionID: '1'}, transactions_2: {transactionID: '2'}},
            });
            const buildCreatedProps = (transactions: UseSearchAutoRefetch['transactions'], previousTransactions: UseSearchAutoRefetch['previousTransactions']) =>
                createMock<UseSearchAutoRefetch>({...buildProps(transactions, previousTransactions), searchResults: resultsWithNewExpense});
            const createdTransactions = {transactions_1: transaction1, transactions_2: transaction2};
            rerender(buildCreatedProps(createdTransactions, initialTransactions));
            rerender(buildCreatedProps(createdTransactions, createdTransactions));

            // And the server then updates it before the tab is opened
            const updatedTransactions = {transactions_1: transaction1, transactions_2: createMock<Transaction>({transactionID: '2', amount: 150})};
            rerender(buildCreatedProps(updatedTransactions, createdTransactions));
            rerender(buildCreatedProps(updatedTransactions, updatedTransactions));
            mockUseIsFocused.mockReturnValue(true);
            rerender(buildCreatedProps(updatedTransactions, updatedTransactions));

            // Then a refetch goes out, since the update can't be told apart from the add
            expect(search).toHaveBeenCalledTimes(1);
        });

        it('should refetch on refocus for a change made while hidden after the collections loaded while hidden', () => {
            // Given a hidden Spend tab mounted before the collections loaded
            mockUseIsFocused.mockReturnValue(false);
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps({}, {}),
            });

            // When the collections load while hidden
            const loadedTransactions = {transactions_1: transaction1};
            rerender(buildProps(loadedTransactions, {}));
            rerender(buildProps(loadedTransactions, loadedTransactions));

            // And an expense outside the results is added, then the tab is opened
            const addedTransactions = {transactions_1: transaction1, transactions_2: transaction2};
            rerender(buildProps(addedTransactions, loadedTransactions));
            rerender(buildProps(addedTransactions, addedTransactions));
            mockUseIsFocused.mockReturnValue(true);
            rerender(buildProps(addedTransactions, addedTransactions));

            // Then a refetch goes out, since the empty pre-load collections aren't the baseline
            expect(search).toHaveBeenCalledTimes(1);
        });

        it('should not refetch on refocus when an expense was added and removed again while hidden', () => {
            // Given a hidden Spend tab with one expense in the results
            mockUseIsFocused.mockReturnValue(false);
            const initialTransactions = {transactions_1: transaction1};
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(initialTransactions, initialTransactions),
            });

            // When an expense is added and removed while hidden
            const addedTransactions = {transactions_1: transaction1, transactions_2: transaction2};
            rerender(buildProps(addedTransactions, initialTransactions));
            rerender(buildProps(addedTransactions, addedTransactions));
            const removedTransactions = {transactions_1: transaction1};
            rerender(buildProps(removedTransactions, addedTransactions));
            rerender(buildProps(removedTransactions, removedTransactions));

            // And the tab is opened again
            mockUseIsFocused.mockReturnValue(true);
            rerender(buildProps(removedTransactions, removedTransactions));

            // Then no refetch goes out, since the collections are back to what the results were fetched against
            expect(search).not.toHaveBeenCalled();
        });

        it('should refetch right away when an RHP is open on top of Search', () => {
            // Given an RHP over Search, so Search is blurred but still the topmost fullscreen route
            mockUseIsFocused.mockReturnValue(false);
            mockIsSearchTopmostFullScreenRoute = true;
            const initialTransactions = {transactions_1: transaction1};
            const {rerender} = renderHook((props: UseSearchAutoRefetch) => useSearchAutoRefetch(props), {
                initialProps: buildProps(initialTransactions, initialTransactions),
            });

            // When an expense is created from the RHP
            rerender(buildProps({transactions_1: transaction1, transactions_2: transaction2}, initialTransactions));

            // Then the refetch goes out right away
            expect(search).toHaveBeenCalledTimes(1);
        });
    });
});
