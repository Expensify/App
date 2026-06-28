import {renderHook} from '@testing-library/react-native';
import useNewTransactions from '@hooks/useNewTransactions';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

// Keep the rail-cleanup timer from touching Onyx; tests assert on whether it is scheduled, not on the merge itself.
jest.mock('@libs/actions/IOU/PendingNewTransactions', () => ({
    deletePendingNewTransactionIDs: jest.fn(),
}));

// We need to mock requestAnimationFrame to mimic long Onyx merge overhead
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    setTimeout(() => {
        callback(performance.now());
    }, 30);
    return 0;
});

const delay = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

describe('useNewTransactions with empty cache', () => {
    const transactionsAlreadyInReport = [
        {transactionID: '2', amount: 200, created: '2023-10-02', currency: 'USD', reportID: 'report1', merchant: ''},
        {transactionID: '3', amount: 300, created: '2023-10-03', currency: 'USD', reportID: 'report1', merchant: ''},
    ];
    const newTransaction = {transactionID: '1', amount: 100, created: '2023-10-01T00:00:00Z', currency: 'USD', reportID: 'report1', merchant: ''};

    it("doesn't return new transactions when no transactions are added", () => {
        // 1. Report and transactions data is not loaded yet
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; hasOnceLoadedReportActions: boolean}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions),
            {
                initialProps: {
                    hasOnceLoadedReportActions: false,
                    transactions: [],
                },
            },
        );

        // 2. Report is loaded and it has no transactions so there are no further rerenders
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);
    });

    it('returns no new transactions when transactions come from initial Report load', () => {
        // 1. Report and transactions data is not loaded yet
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; hasOnceLoadedReportActions: boolean}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions),
            {
                initialProps: {
                    hasOnceLoadedReportActions: false,
                    transactions: [],
                },
            },
        );
        expect(result.current).toEqual([]);

        // 2. Report is loaded and transactions data is not loaded yet
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);

        // 3. Report is loaded and transactions data is loaded
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        // there is no new transactions, because the transactions that were already in the report are not considered new
        expect(result.current).toEqual([]);
    });

    it('returns new transactions when transactions are added after initial load', () => {
        // 1. Report and transactions data is not loaded yet
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; hasOnceLoadedReportActions: boolean}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions),
            {
                initialProps: {
                    hasOnceLoadedReportActions: false,
                    transactions: [],
                },
            },
        );
        expect(result.current).toEqual([]);

        // 2. Report is loaded and transactions data is not loaded yet
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);

        // 3. Report is loaded and transactions data is loaded
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        expect(result.current).toEqual([]);

        // 4. User added new transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [...transactionsAlreadyInReport, newTransaction],
        });
        expect(result.current).toEqual([newTransaction]);
    });

    it('returns new transactions when adding transactions to empty report', async () => {
        // 1. Report and transactions data is not loaded yet
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; hasOnceLoadedReportActions: boolean}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions),
            {
                initialProps: {
                    hasOnceLoadedReportActions: false,
                    transactions: [],
                },
            },
        );

        // 2. Report is loaded and it has no transactions so there are no further rerenders
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        await delay(1000); // We need to wait to ensure that the skipFirstTransactionsChange is set to false by the useEffect
        expect(result.current).toEqual([]);

        // 3. User added new transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [newTransaction],
        });
        expect(result.current).toEqual([newTransaction]);
    });

    it('returns no new transactions when transactions are removed', () => {
        // 1. Report and transactions data is not loaded yet
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; hasOnceLoadedReportActions: boolean}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions),
            {
                initialProps: {
                    hasOnceLoadedReportActions: false,
                    transactions: [],
                },
            },
        );
        expect(result.current).toEqual([]);

        // 2. Report is loaded and transactions data is not loaded yet
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);

        // 3. Report is loaded and transactions data is loaded
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        expect(result.current).toEqual([]);

        // 4. User removes a transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport.slice(1),
        });
        expect(result.current).toEqual([]);
    });
});

describe('useNewTransactions with transactions in cache', () => {
    const transactionsAlreadyInReport = [
        {transactionID: '2', amount: 200, created: '2023-10-02', currency: 'USD', reportID: 'report1', merchant: ''},
        {transactionID: '3', amount: 300, created: '2023-10-03', currency: 'USD', reportID: 'report1', merchant: ''},
    ];
    const newTransaction = {transactionID: '1', amount: 100, created: '2023-10-01T00:00:00Z', currency: 'USD', reportID: 'report1', merchant: ''};

    it("doesn't return new transactions when no transactions are added", () => {
        // 1. Report and transactions data is loaded from Onyx
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; hasOnceLoadedReportActions: boolean}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions),
            {
                initialProps: {
                    hasOnceLoadedReportActions: true,
                    transactions: [],
                },
            },
        );

        // 2. Report is loaded and transactions data is loaded, but there were no new transactions
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        expect(result.current).toEqual([]);
    });

    it('returns new transactions when newly added transactions come from initial Report load', () => {
        // 1. Report and transactions data is loaded from Onyx
        const {rerender, result} = renderHook((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions), {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: transactionsAlreadyInReport,
            },
        });
        expect(result.current).toEqual([]);

        // 2. New transaction comes in when report is loaded
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [...transactionsAlreadyInReport, newTransaction],
        });
        expect(result.current).toEqual([newTransaction]);
    });

    it('returns new transactions when transactions are added after initial load', () => {
        // 1. Report and transactions data is loaded from Onyx
        const {rerender, result} = renderHook((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions), {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: transactionsAlreadyInReport,
            },
        });
        expect(result.current).toEqual([]);

        // 2. Report is loaded and transactions data is loaded, but there were no new transactions
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        expect(result.current).toEqual([]);

        // 3. User added new transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [...transactionsAlreadyInReport, newTransaction],
        });
        expect(result.current).toEqual([newTransaction]);
    });

    it('returns new transactions when adding transactions to empty report', async () => {
        // 1. Report and transactions data is loaded from Onyx
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; hasOnceLoadedReportActions: boolean}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions),
            {
                initialProps: {
                    hasOnceLoadedReportActions: true,
                    transactions: [],
                },
            },
        );

        // 2. Report is loaded and it has no transactions, so there are no further rerenders
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [],
        });
        await delay(1000);
        expect(result.current).toEqual([]);

        // 3. User added new transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [newTransaction],
        });
        expect(result.current).toEqual([newTransaction]);
    });

    it('returns no new transactions when transactions are removed', () => {
        // 1. Report and transactions data is loaded from Onyx
        const {rerender, result} = renderHook((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions), {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: transactionsAlreadyInReport,
            },
        });
        expect(result.current).toEqual([]);

        // 2. Report is loaded and transactions data is loaded, but there were no new transactions
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
        });
        expect(result.current).toEqual([]);

        // 3. User removes a transaction
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport.slice(1),
        });
        expect(result.current).toEqual([]);
    });
});

describe('useNewTransactions with pendingNewTransactionIDs (cross-navigation)', () => {
    const transactionsAlreadyInReport = [
        {transactionID: '2', amount: 200, created: '2023-10-02', currency: 'USD', reportID: 'report1', merchant: ''},
        {transactionID: '3', amount: 300, created: '2023-10-03', currency: 'USD', reportID: 'report1', merchant: ''},
    ];
    const newTransaction = {transactionID: '1', amount: 100, created: '2023-10-01T00:00:00Z', currency: 'USD', reportID: 'report1', merchant: ''};

    it('returns pending new transactions on first load when submitted from another report', () => {
        // Simulates: user submitted expense from Self DM to workspace, then navigated to workspace chat.
        // The transaction is already in the transactions list by the time the component mounts.
        // 1. Component mounts, report not loaded yet, but transaction is already in Onyx
        const {rerender, result} = renderHook<
            Transaction[],
            {transactions: Transaction[]; hasOnceLoadedReportActions: boolean; pendingNewTransactionIDs: Record<string, true | null> | undefined; isFocused?: boolean}
        >((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions, props.pendingNewTransactionIDs, '1', props.isFocused), {
            initialProps: {
                hasOnceLoadedReportActions: false,
                transactions: [],
                pendingNewTransactionIDs: {[newTransaction.transactionID]: true},
                isFocused: true,
            },
        });
        expect(result.current).toEqual([]);

        // 2. Report loads, transactions arrive (including the new one that was submitted cross-navigation)
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [...transactionsAlreadyInReport, newTransaction],
            pendingNewTransactionIDs: {[newTransaction.transactionID]: true},
            isFocused: true,
        });
        // The pending transaction should be detected even though it was present from the first load
        expect(result.current).toEqual([newTransaction]);

        // 3. On subsequent renders, the pending transaction should not be returned again
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [...transactionsAlreadyInReport, newTransaction],
            pendingNewTransactionIDs: undefined,
            isFocused: true,
        });
        expect(result.current).toEqual([]);
    });

    it('does not highlight transactions without pendingNewTransactionIDs', () => {
        // Normal navigation to a report (no cross-navigation pending IDs)
        const {rerender, result} = renderHook<
            Transaction[],
            {transactions: Transaction[]; hasOnceLoadedReportActions: boolean; pendingNewTransactionIDs: Record<string, true | null> | undefined}
        >((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions, props.pendingNewTransactionIDs), {
            initialProps: {
                hasOnceLoadedReportActions: false,
                transactions: [],
                pendingNewTransactionIDs: undefined,
            },
        });

        rerender({
            hasOnceLoadedReportActions: true,
            transactions: transactionsAlreadyInReport,
            pendingNewTransactionIDs: undefined,
        });
        expect(result.current).toEqual([]);
    });

    it('recomputes when only pendingNewTransactionIDs changes (stable transactions reference)', () => {
        const stableTransactions = [...transactionsAlreadyInReport, newTransaction];

        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; pendingNewTransactionIDs: Record<string, true | null> | undefined}>(
            (props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true),
            {
                initialProps: {transactions: stableTransactions, pendingNewTransactionIDs: undefined},
            },
        );
        expect(result.current).toEqual([]);

        rerender({transactions: stableTransactions, pendingNewTransactionIDs: undefined});
        expect(result.current).toEqual([]);

        rerender({transactions: stableTransactions, pendingNewTransactionIDs: {[newTransaction.transactionID]: true}});
        expect(result.current).toEqual([newTransaction]);
    });

    it('highlights the duplicate when the table view mounts post-optimistic add and pendingNewTransactionIDs arrives a few renders later', () => {
        const [originalTx] = transactionsAlreadyInReport;
        const duplicateTx = {...newTransaction, pendingAction: 'add' as const};

        const {rerender, result} = renderHook<
            Transaction[],
            {transactions: Transaction[]; hasOnceLoadedReportActions: boolean; pendingNewTransactionIDs: Record<string, true | null> | undefined; isFocused?: boolean}
        >((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions, props.pendingNewTransactionIDs, 'report1', props.isFocused), {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: [originalTx, duplicateTx],
                pendingNewTransactionIDs: undefined,
                isFocused: true,
            },
        });
        expect(result.current).toEqual([]);

        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [originalTx, duplicateTx],
            pendingNewTransactionIDs: undefined,
            isFocused: true,
        });
        expect(result.current).toEqual([]);

        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [originalTx, duplicateTx],
            pendingNewTransactionIDs: {[duplicateTx.transactionID]: true},
            isFocused: true,
        });
        expect(result.current).toEqual([duplicateTx]);

        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [originalTx, duplicateTx],
            pendingNewTransactionIDs: undefined,
            isFocused: true,
        });
        expect(result.current).toEqual([]);
    });

    it('falls through to the diff when the rail holds only cleared tombstones', () => {
        // A {clearedID: null} rail is not "active": a later add (e.g. Pusher/import) without its own flag must still be caught by the diff.
        const [existingTx] = transactionsAlreadyInReport;
        const pusherTx = newTransaction;
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; pendingNewTransactionIDs: Record<string, true | null>}>(
            (props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true),
            {
                initialProps: {transactions: [existingTx], pendingNewTransactionIDs: {[existingTx.transactionID]: null}},
            },
        );
        expect(result.current).toEqual([]);

        rerender({transactions: [existingTx, pusherTx], pendingNewTransactionIDs: {[existingTx.transactionID]: null}});
        expect(result.current).toEqual([pusherTx]);
    });

    it('unions a rail-flagged add with a concurrent unflagged diff add (Pusher landing inside the cleanup delay)', () => {
        // A rail flag (txB) must not make the branch swallow a concurrent unflagged diff add (txC) — both highlight, txB first.
        const [existingTx] = transactionsAlreadyInReport;
        const txB = {transactionID: 'B', amount: 100, created: '2023-10-04', currency: 'USD', reportID: 'report1', merchant: ''};
        const txC = {transactionID: 'C', amount: 100, created: '2023-10-05', currency: 'USD', reportID: 'report1', merchant: ''};
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; pendingNewTransactionIDs: Record<string, true | null>}>(
            (props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true),
            {initialProps: {transactions: [existingTx], pendingNewTransactionIDs: {}}},
        );
        expect(result.current).toEqual([]);

        rerender({transactions: [existingTx, txB], pendingNewTransactionIDs: {B: true}});
        expect(result.current).toEqual([txB]);

        rerender({transactions: [existingTx, txB, txC], pendingNewTransactionIDs: {B: true}});
        expect(result.current).toEqual([txB, txC]);
        expect(result.current.at(0)).toBe(txB);
    });
});

describe('useNewTransactions with an unfocused report', () => {
    const transactionsAlreadyInReport = [
        {transactionID: '2', amount: 200, created: '2023-10-02', currency: 'USD', reportID: 'report1', merchant: ''},
        {transactionID: '3', amount: 300, created: '2023-10-03', currency: 'USD', reportID: 'report1', merchant: ''},
    ];
    const newTransaction = {transactionID: '1', amount: 100, created: '2023-10-01T00:00:00Z', currency: 'USD', reportID: 'report1', merchant: ''};

    it('stays silent for an explicitly-unfocused consumer (the rail re-delivers on refocus)', () => {
        // A background chat preview must not animate a highlight off-screen; only a focused consumer surfaces adds.
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; isFocused: boolean}>(
            (props) => useNewTransactions(true, props.transactions, undefined, 'report1', props.isFocused),
            {initialProps: {transactions: transactionsAlreadyInReport, isFocused: false}},
        );
        expect(result.current).toEqual([]);

        rerender({transactions: [...transactionsAlreadyInReport, newTransaction], isFocused: false});
        expect(result.current).toEqual([]);
    });

    it('returns pending transactions only once the report is focused', () => {
        // The rail stays gated on focus so an unfocused consumer (e.g. a chat report preview) doesn't consume the flag early.
        const allTransactions = [...transactionsAlreadyInReport, newTransaction];
        const {rerender, result} = renderHook<Transaction[], {isFocused: boolean}>(
            (props) => useNewTransactions(true, allTransactions, {[newTransaction.transactionID]: true}, 'report1', props.isFocused),
            {initialProps: {isFocused: false}},
        );
        expect(result.current).toEqual([]);

        rerender({isFocused: true});
        expect(result.current).toEqual([newTransaction]);
    });

    it('keeps an earlier pending transaction highlighted continuously when a second one is added', () => {
        // Adding a later transaction must not drop the earlier one out of the result and back in — that flicker would re-fire its highlight animation.
        const txB = {transactionID: 'B', amount: 100, created: '2023-10-04', currency: 'USD', reportID: 'report1', merchant: ''};
        const txC = {transactionID: 'C', amount: 100, created: '2023-10-05', currency: 'USD', reportID: 'report1', merchant: ''};
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; pendingNewTransactionIDs: Record<string, true | null>}>(
            (props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true),
            {initialProps: {transactions: transactionsAlreadyInReport, pendingNewTransactionIDs: {}}},
        );
        expect(result.current).toEqual([]);

        rerender({transactions: [...transactionsAlreadyInReport, txB], pendingNewTransactionIDs: {B: true}});
        expect(result.current).toEqual([txB]);

        rerender({transactions: [...transactionsAlreadyInReport, txB], pendingNewTransactionIDs: {B: true}});
        expect(result.current).toEqual([txB]);

        rerender({transactions: [...transactionsAlreadyInReport, txB, txC], pendingNewTransactionIDs: {B: true, C: true}});
        expect(result.current).toEqual(expect.arrayContaining([txB, txC]));
        expect(result.current).toHaveLength(2);
    });

    it('schedules the rail cleanup only from a focused consumer', () => {
        // Only a focused consumer schedules the rail cleanup; an unfocused one stays silent and must not clear a flag a later focused mount needs.
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
        const txD = {transactionID: 'D', amount: 100, created: '2023-10-09', currency: 'USD', reportID: 'report1', merchant: ''};
        const scheduledCleanups = () => setTimeoutSpy.mock.calls.filter(([, ms]) => ms === CONST.PENDING_TRANSACTION_DELETION_DELAY).length;

        const {rerender} = renderHook<Transaction[], {transactions: Transaction[]; pendingNewTransactionIDs: Record<string, true | null>; isFocused: boolean}>(
            (props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', props.isFocused),
            {initialProps: {transactions: transactionsAlreadyInReport, pendingNewTransactionIDs: {D: true}, isFocused: false}},
        );

        rerender({transactions: [...transactionsAlreadyInReport, txD], pendingNewTransactionIDs: {D: true}, isFocused: false});
        expect(scheduledCleanups()).toBe(0);

        rerender({transactions: [...transactionsAlreadyInReport, txD], pendingNewTransactionIDs: {D: true}, isFocused: true});
        expect(scheduledCleanups()).toBeGreaterThan(0);

        setTimeoutSpy.mockRestore();
    });
});

afterAll(() => {
    jest.restoreAllMocks();
});
