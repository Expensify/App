import {act, renderHook} from '@testing-library/react-native';

import useNewTransactions from '@hooks/useNewTransactions';

import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import CONST from '@src/CONST';
import type {PendingNewTransactions} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';

function rail(activeIDs: string[], expiredFlagKeys: string[] = []): PendingNewTransactions {
    return {
        activeFlagKeys: Object.fromEntries(activeIDs.map((id) => [id, id])),
        expiredFlagKeys,
    };
}

/** A rail whose flags carry distinct instance keys, so the same transaction can be re-flagged as a new instance. */
function stampedRail(activeStamps: Record<string, number>): PendingNewTransactions {
    return {
        activeFlagKeys: Object.fromEntries(Object.entries(activeStamps).map(([id, stamp]) => [id, `${id}:${stamp}`])),
        expiredFlagKeys: [],
    };
}

jest.mock('@libs/actions/IOU/PendingNewTransactions', () => ({
    deletePendingNewTransactionIDs: jest.fn(),
}));

// We need to mock requestAnimationFrame to mimic long Onyx merge overhead, returning a handle so a cancelled frame really is cancelled.
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) =>
    Number(
        setTimeout(() => {
            callback(performance.now());
        }, 30),
    ),
);
jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((handle?: number | null) => clearTimeout(handle ?? undefined));

const delay = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

describe('useNewTransactions with empty cache', () => {
    const transactionsAlreadyInReport = [
        {
            transactionID: '2',
            amount: 200,
            created: '2023-10-02',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        },
        {
            transactionID: '3',
            amount: 300,
            created: '2023-10-03',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        },
    ];
    const newTransaction = {
        transactionID: '1',
        amount: 100,
        created: '2023-10-01T00:00:00Z',
        currency: 'USD',
        reportID: 'report1',
        merchant: '',
    };

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
        {
            transactionID: '2',
            amount: 200,
            created: '2023-10-02',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        },
        {
            transactionID: '3',
            amount: 300,
            created: '2023-10-03',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        },
    ];
    const newTransaction = {
        transactionID: '1',
        amount: 100,
        created: '2023-10-01T00:00:00Z',
        currency: 'USD',
        reportID: 'report1',
        merchant: '',
    };

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

    it('stops surfacing a diff-detected add after its highlight window, so a row remount cannot replay it', () => {
        jest.useFakeTimers();
        try {
            const {rerender, result} = renderHook((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions), {
                initialProps: {
                    hasOnceLoadedReportActions: true,
                    transactions: transactionsAlreadyInReport,
                },
            });

            rerender({
                hasOnceLoadedReportActions: true,
                transactions: [...transactionsAlreadyInReport, newTransaction],
            });
            expect(result.current).toEqual([newTransaction]);

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
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
        {
            transactionID: '2',
            amount: 200,
            created: '2023-10-02',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        },
        {
            transactionID: '3',
            amount: 300,
            created: '2023-10-03',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        },
    ];
    const newTransaction = {
        transactionID: '1',
        amount: 100,
        created: '2023-10-01T00:00:00Z',
        currency: 'USD',
        reportID: 'report1',
        merchant: '',
    };

    it('returns pending new transactions on first load when submitted from another report', () => {
        // 1. Component mounts, report not loaded yet, but transaction is already in Onyx
        const {rerender, result} = renderHook<
            Transaction[],
            {
                transactions: Transaction[];
                hasOnceLoadedReportActions: boolean;
                pendingNewTransactionIDs: PendingNewTransactions | undefined;
                isReportVisible?: boolean;
            }
        >((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions, props.pendingNewTransactionIDs, '1', props.isReportVisible), {
            initialProps: {
                hasOnceLoadedReportActions: false,
                transactions: [],
                pendingNewTransactionIDs: rail([newTransaction.transactionID]),
                isReportVisible: true,
            },
        });
        expect(result.current).toEqual([]);

        // 2. Report loads, transactions arrive (including the new one that was submitted cross-navigation)
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [...transactionsAlreadyInReport, newTransaction],
            pendingNewTransactionIDs: rail([newTransaction.transactionID]),
            isReportVisible: true,
        });
        expect(result.current).toEqual([newTransaction]);

        // 3. On subsequent renders, the pending transaction should not be returned again
        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [...transactionsAlreadyInReport, newTransaction],
            pendingNewTransactionIDs: undefined,
            isReportVisible: true,
        });
        expect(result.current).toEqual([]);
    });

    it('does not highlight transactions without pendingNewTransactionIDs', () => {
        const {rerender, result} = renderHook<
            Transaction[],
            {
                transactions: Transaction[];
                hasOnceLoadedReportActions: boolean;
                pendingNewTransactionIDs: PendingNewTransactions | undefined;
            }
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

        const {rerender, result} = renderHook<
            Transaction[],
            {
                transactions: Transaction[];
                pendingNewTransactionIDs: PendingNewTransactions | undefined;
            }
        >((props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true), {
            initialProps: {
                transactions: stableTransactions,
                pendingNewTransactionIDs: undefined,
            },
        });
        expect(result.current).toEqual([]);

        rerender({
            transactions: stableTransactions,
            pendingNewTransactionIDs: undefined,
        });
        expect(result.current).toEqual([]);

        rerender({
            transactions: stableTransactions,
            pendingNewTransactionIDs: rail([newTransaction.transactionID]),
        });
        expect(result.current).toEqual([newTransaction]);
    });

    it('highlights the duplicate when the table view mounts post-optimistic add and pendingNewTransactionIDs arrives a few renders later', () => {
        const [originalTx] = transactionsAlreadyInReport;
        const duplicateTx = {...newTransaction, pendingAction: 'add' as const};

        const {rerender, result} = renderHook<
            Transaction[],
            {
                transactions: Transaction[];
                hasOnceLoadedReportActions: boolean;
                pendingNewTransactionIDs: PendingNewTransactions | undefined;
                isReportVisible?: boolean;
            }
        >((props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions, props.pendingNewTransactionIDs, 'report1', props.isReportVisible), {
            initialProps: {
                hasOnceLoadedReportActions: true,
                transactions: [originalTx, duplicateTx],
                pendingNewTransactionIDs: undefined,
                isReportVisible: true,
            },
        });
        expect(result.current).toEqual([]);

        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [originalTx, duplicateTx],
            pendingNewTransactionIDs: undefined,
            isReportVisible: true,
        });
        expect(result.current).toEqual([]);

        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [originalTx, duplicateTx],
            pendingNewTransactionIDs: rail([duplicateTx.transactionID]),
            isReportVisible: true,
        });
        expect(result.current).toEqual([duplicateTx]);

        rerender({
            hasOnceLoadedReportActions: true,
            transactions: [originalTx, duplicateTx],
            pendingNewTransactionIDs: undefined,
            isReportVisible: true,
        });
        expect(result.current).toEqual([]);
    });

    it('falls through to the diff when the rail holds only cleared tombstones', () => {
        const [existingTx] = transactionsAlreadyInReport;
        const pusherTx = newTransaction;
        const {rerender, result} = renderHook<
            Transaction[],
            {
                transactions: Transaction[];
                pendingNewTransactionIDs: PendingNewTransactions;
            }
        >((props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true), {
            initialProps: {
                transactions: [existingTx],
                pendingNewTransactionIDs: rail([], [existingTx.transactionID]),
            },
        });
        expect(result.current).toEqual([]);

        rerender({
            transactions: [existingTx, pusherTx],
            pendingNewTransactionIDs: rail([], [existingTx.transactionID]),
        });
        expect(result.current).toEqual([pusherTx]);
    });

    it('unions a rail-flagged add with a concurrent unflagged diff add (Pusher landing inside the cleanup delay)', () => {
        const [existingTx] = transactionsAlreadyInReport;
        const txB = {
            transactionID: 'B',
            amount: 100,
            created: '2023-10-04',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        };
        const txC = {
            transactionID: 'C',
            amount: 100,
            created: '2023-10-05',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        };
        const {rerender, result} = renderHook<
            Transaction[],
            {
                transactions: Transaction[];
                pendingNewTransactionIDs: PendingNewTransactions;
            }
        >((props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true), {
            initialProps: {
                transactions: [existingTx],
                pendingNewTransactionIDs: rail([]),
            },
        });
        expect(result.current).toEqual([]);

        rerender({
            transactions: [existingTx, txB],
            pendingNewTransactionIDs: rail(['B']),
        });
        expect(result.current).toEqual([txB]);

        rerender({
            transactions: [existingTx, txB, txC],
            pendingNewTransactionIDs: rail(['B']),
        });
        expect(result.current).toEqual([txB, txC]);
        expect(result.current.at(0)).toBe(txB);
    });
});

describe('useNewTransactions with a covered report', () => {
    const transactionsAlreadyInReport = [
        {
            transactionID: '2',
            amount: 200,
            created: '2023-10-02',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        },
        {
            transactionID: '3',
            amount: 300,
            created: '2023-10-03',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        },
    ];
    const newTransaction = {
        transactionID: '1',
        amount: 100,
        created: '2023-10-01T00:00:00Z',
        currency: 'USD',
        reportID: 'report1',
        merchant: '',
    };

    it('returns newly added transactions even when the report is not visible', () => {
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; isReportVisible: boolean}>(
            (props) => useNewTransactions(true, props.transactions, undefined, 'report1', props.isReportVisible),
            {
                initialProps: {
                    transactions: transactionsAlreadyInReport,
                    isReportVisible: false,
                },
            },
        );
        expect(result.current).toEqual([]);

        rerender({
            transactions: [...transactionsAlreadyInReport, newTransaction],
            isReportVisible: false,
        });
        expect(result.current).toEqual([newTransaction]);
    });

    it('emits a flagged add even when the report is not visible', () => {
        const allTransactions = [...transactionsAlreadyInReport, newTransaction];
        const {result} = renderHook(() => useNewTransactions(true, allTransactions, rail([newTransaction.transactionID]), 'report1', false));
        expect(result.current).toEqual([newTransaction]);
    });

    it('keeps an earlier pending transaction highlighted continuously when a second one is added', () => {
        const txB = {
            transactionID: 'B',
            amount: 100,
            created: '2023-10-04',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        };
        const txC = {
            transactionID: 'C',
            amount: 100,
            created: '2023-10-05',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        };
        const {rerender, result} = renderHook<
            Transaction[],
            {
                transactions: Transaction[];
                pendingNewTransactionIDs: PendingNewTransactions;
            }
        >((props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true), {
            initialProps: {
                transactions: transactionsAlreadyInReport,
                pendingNewTransactionIDs: rail([]),
            },
        });
        expect(result.current).toEqual([]);

        rerender({
            transactions: [...transactionsAlreadyInReport, txB],
            pendingNewTransactionIDs: rail(['B']),
        });
        expect(result.current).toEqual([txB]);

        rerender({
            transactions: [...transactionsAlreadyInReport, txB],
            pendingNewTransactionIDs: rail(['B']),
        });
        expect(result.current).toEqual([txB]);

        rerender({
            transactions: [...transactionsAlreadyInReport, txB, txC],
            pendingNewTransactionIDs: rail(['B', 'C']),
        });
        expect(result.current).toEqual(expect.arrayContaining([txB, txC]));
        expect(result.current).toHaveLength(2);
    });

    it('sweeps the rail only from a visible consumer', () => {
        jest.useFakeTimers();
        jest.mocked(deletePendingNewTransactionIDs).mockClear();
        try {
            const txD = {
                transactionID: 'D',
                amount: 100,
                created: '2023-10-09',
                currency: 'USD',
                reportID: 'report1',
                merchant: '',
            };

            const {rerender} = renderHook<
                Transaction[],
                {
                    transactions: Transaction[];
                    pendingNewTransactionIDs: PendingNewTransactions;
                    isReportVisible: boolean;
                }
            >((props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', props.isReportVisible), {
                initialProps: {
                    transactions: transactionsAlreadyInReport,
                    pendingNewTransactionIDs: rail(['D']),
                    isReportVisible: false,
                },
            });

            rerender({
                transactions: [...transactionsAlreadyInReport, txD],
                pendingNewTransactionIDs: rail(['D']),
                isReportVisible: false,
            });
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).not.toHaveBeenCalled();

            rerender({
                transactions: [...transactionsAlreadyInReport, txD],
                pendingNewTransactionIDs: rail(['D']),
                isReportVisible: true,
            });
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('report1', ['D']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('leaves the window running when one of the added transactions is removed, rather than restarting it for the survivors', () => {
        jest.useFakeTimers();
        try {
            const txG = {transactionID: 'G', amount: 100, created: '2023-10-10', currency: 'USD', reportID: 'report1', merchant: ''};
            const txH = {transactionID: 'H', amount: 100, created: '2023-10-11', currency: 'USD', reportID: 'report1', merchant: ''};
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, undefined, 'report1', true), {
                initialProps: {transactions: transactionsAlreadyInReport},
            });

            rerender({transactions: [...transactionsAlreadyInReport, txG, txH]});
            expect(result.current).toEqual([txG, txH]);

            // One of the two is deleted most of the way through the window the pair was given.
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY - 100);
            });
            rerender({transactions: [...transactionsAlreadyInReport, txH]});
            expect(result.current).toEqual([txH]);

            // The survivor keeps the remainder of that window rather than being handed a fresh one.
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('gives a second diff-detected add its own window rather than the window already running', () => {
        jest.useFakeTimers();
        try {
            const txE = {
                transactionID: 'E',
                amount: 100,
                created: '2023-10-10',
                currency: 'USD',
                reportID: 'report1',
                merchant: '',
            };
            const txF = {
                transactionID: 'F',
                amount: 100,
                created: '2023-10-11',
                currency: 'USD',
                reportID: 'report1',
                merchant: '',
            };
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, undefined, 'report1', true), {
                initialProps: {transactions: transactionsAlreadyInReport},
            });

            rerender({transactions: [...transactionsAlreadyInReport, txE]});
            expect(result.current).toEqual([txE]);

            // The second add lands just before the first add's window closes, leaving the number of adds unchanged.
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY - 100);
            });
            rerender({transactions: [...transactionsAlreadyInReport, txE, txF]});
            expect(result.current).toEqual([txF]);

            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(result.current).toEqual([txF]);

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not let a settle frame queued for the outgoing report settle the report switched into', async () => {
        jest.useFakeTimers();
        try {
            const txG = {
                transactionID: 'G',
                amount: 100,
                created: '2023-10-12',
                currency: 'USD',
                reportID: 'report2',
                merchant: '',
            };
            const {rerender, result} = renderHook<Transaction[], {hasOnceLoadedReportActions: boolean; reportID: string; transactions: Transaction[]}>(
                (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions, undefined, props.reportID, true),
                {initialProps: {hasOnceLoadedReportActions: false, reportID: 'report1', transactions: []}},
            );

            rerender({hasOnceLoadedReportActions: true, reportID: 'report1', transactions: transactionsAlreadyInReport});
            // Let report1's settle microtask queue its frame, without letting the frame run.
            await act(async () => {
                await Promise.resolve();
            });

            rerender({hasOnceLoadedReportActions: false, reportID: 'report2', transactions: []});
            await act(async () => {
                jest.advanceTimersByTime(100);
            });

            // report2 loads in the two merges Onyx usually delivers, so the growth belongs to its initial load rather than being an add.
            rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: transactionsAlreadyInReport});
            rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: [...transactionsAlreadyInReport, txG]});
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });
});

describe('useNewTransactions baseline comparison', () => {
    const txWithID = (transactionID: string): Transaction => ({
        transactionID,
        amount: 100,
        created: '2023-10-01',
        currency: 'USD',
        reportID: 'report1',
        merchant: '',
    });

    it('settles on a list that repeats a transaction ID, which a set-size comparison could never call equal', () => {
        const transactions = [txWithID('a'), txWithID('a')];
        // Re-rendering with the same list is what a render-phase update would turn into an unbounded loop.
        const {rerender, result} = renderHook(() => useNewTransactions(true, transactions, undefined, 'report1', true));
        rerender(undefined);
        rerender(undefined);

        expect(result.current).toEqual([]);
    });

    it('treats a re-ordered list as unchanged, so no window opens and no render is spent recording it', () => {
        const first = txWithID('a');
        const second = txWithID('b');
        const {rerender, result} = renderHook((props: {transactions: Transaction[]}) => useNewTransactions(true, props.transactions, undefined, 'report1', true), {
            initialProps: {transactions: [first, second]},
        });

        rerender({transactions: [second, first]});

        expect(result.current).toEqual([]);
    });
});

describe('useNewTransactions rail cleanup lifecycle', () => {
    const baseTx: Transaction = {
        transactionID: 'base',
        amount: 100,
        created: '2023-10-01',
        currency: 'USD',
        reportID: 'report1',
        merchant: '',
    };
    const railTx: Transaction = {
        transactionID: 'railTx',
        amount: 200,
        created: '2023-10-02',
        currency: 'USD',
        reportID: 'report1',
        merchant: '',
    };

    beforeEach(() => {
        jest.mocked(deletePendingNewTransactionIDs).mockClear();
    });

    it('schedules one sweep for a flag two consumers of the same report both see', () => {
        jest.useFakeTimers();
        try {
            const transactions = [baseTx, railTx];
            const pendingNewTransactions = rail(['railTx']);
            // Every preview in a chat reads the same rail, so both would otherwise claim and delete the same flag.
            renderHook(() => useNewTransactions(true, transactions, pendingNewTransactions, 'report1', true));
            renderHook(() => useNewTransactions(true, transactions, pendingNewTransactions, 'report1', true));

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('completes the scheduled rail deletion even if the consumer unmounts first', () => {
        jest.useFakeTimers();
        try {
            const transactions = [baseTx, railTx];
            const pendingNewTransactions = rail(['railTx']);
            const {unmount} = renderHook(() => useNewTransactions(true, transactions, pendingNewTransactions, 'report1', true));
            unmount();

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('report1', ['railTx']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('sweeps expired flags together with the consumed ones', () => {
        jest.useFakeTimers();
        try {
            const transactions = [baseTx, railTx];
            const pendingNewTransactions = rail(['railTx'], ['staleTx']);
            renderHook(() => useNewTransactions(true, transactions, pendingNewTransactions, 'report1', true));

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('report1', ['railTx', 'staleTx']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('schedules a flag deletion only once while report data keeps changing', () => {
        jest.useFakeTimers();
        try {
            const pendingNewTransactions = rail(['railTx']);
            const {rerender} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, pendingNewTransactions, 'report1', true), {
                initialProps: {transactions: [baseTx, railTx]},
            });

            rerender({transactions: [baseTx, railTx]});
            rerender({transactions: [{...baseTx, amount: 150}, railTx]});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('sweeps a re-flagged transaction again, because the new flag is a different instance', () => {
        jest.useFakeTimers();
        try {
            const transactions = [baseTx, railTx];
            const {rerender} = renderHook<Transaction[], {pendingNewTransactions: PendingNewTransactions | undefined}>(
                (props) => useNewTransactions(true, transactions, props.pendingNewTransactions, 'report1', true),
                {initialProps: {pendingNewTransactions: stampedRail({railTx: 1000})}},
            );

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx:1000']);

            rerender({pendingNewTransactions: undefined});
            rerender({pendingNewTransactions: stampedRail({railTx: 2000})});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(2);
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx:2000']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('claims a flag again once its deletion has been issued, so a merge that never lands is retried', () => {
        jest.useFakeTimers();
        try {
            const pendingNewTransactions = stampedRail({railTx: 1000});
            const {rerender} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, pendingNewTransactions, 'report1', true), {
                initialProps: {transactions: [baseTx, railTx]},
            });

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);

            rerender({transactions: [{...baseTx, amount: 150}, railTx]});
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(2);
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not sweep the same flag instance twice while it is still on the rail', () => {
        jest.useFakeTimers();
        try {
            const pendingNewTransactions = stampedRail({railTx: 1000});
            const {rerender} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, pendingNewTransactions, 'report1', true), {
                initialProps: {transactions: [baseTx, railTx]},
            });

            rerender({transactions: [{...baseTx, amount: 150}, railTx]});
            rerender({transactions: [{...baseTx, amount: 175}, railTx]});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY * 2);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('sweeps a flag on the report switched into, even for a transaction already swept on the previous report', () => {
        jest.useFakeTimers();
        try {
            const transactions = [baseTx, railTx];
            const pendingNewTransactions = rail(['railTx']);
            const {rerender} = renderHook<Transaction[], {reportID: string}>((props) => useNewTransactions(true, transactions, pendingNewTransactions, props.reportID, true), {
                initialProps: {reportID: 'report1'},
            });

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx']);

            rerender({reportID: 'report2'});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report2', ['railTx']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not arm a second sweep for a report the consumer leaves and returns to inside the delay window', () => {
        jest.useFakeTimers();
        try {
            const transactions = [baseTx, railTx];
            const {rerender} = renderHook<Transaction[], {reportID: string; pendingNewTransactions: PendingNewTransactions | undefined}>(
                (props) => useNewTransactions(true, transactions, props.pendingNewTransactions, props.reportID, true),
                {initialProps: {reportID: 'report1', pendingNewTransactions: rail(['railTx'])}},
            );

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY / 4);
            });
            rerender({reportID: 'report2', pendingNewTransactions: undefined});
            rerender({reportID: 'report1', pendingNewTransactions: rail(['railTx'])});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY * 2);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('report1', ['railTx']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('sweeps a re-flagged transaction while another flag on the same rail stays swept only once', () => {
        jest.useFakeTimers();
        try {
            const otherTx: Transaction = {...railTx, transactionID: 'otherTx'};
            const transactions = [baseTx, railTx, otherTx];
            const {rerender} = renderHook<Transaction[], {pendingNewTransactions: PendingNewTransactions}>(
                (props) => useNewTransactions(true, transactions, props.pendingNewTransactions, 'report1', true),
                {initialProps: {pendingNewTransactions: stampedRail({railTx: 1000, otherTx: 1000})}},
            );

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx:1000', 'otherTx:1000']);

            rerender({pendingNewTransactions: stampedRail({railTx: 2000, otherTx: 1000})});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', expect.arrayContaining(['railTx:2000']));
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not misattribute a same-length swap as new on the next addition', () => {
        const txA = {...baseTx, transactionID: 'A'};
        const txB = {...baseTx, transactionID: 'B'};
        const txC = {...baseTx, transactionID: 'C'};
        const txD = {...baseTx, transactionID: 'D'};
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, undefined, 'report1', true), {
            initialProps: {transactions: [txA, txB]},
        });

        rerender({transactions: [txA, txC]});
        expect(result.current).toEqual([]);

        rerender({transactions: [txA, txC, txD]});
        expect(result.current).toEqual([txD]);
    });

    it('treats the incoming report as unsettled when the loaded flag lags the switch, so its hydration is not an add', () => {
        const txA = {...baseTx, transactionID: 'A'};
        const txB = {...baseTx, transactionID: 'B'};
        const txC = {...baseTx, transactionID: 'C'};
        const {rerender, result} = renderHook<Transaction[], {hasOnceLoadedReportActions: boolean; reportID: string; transactions: Transaction[]}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions, undefined, props.reportID, true),
            {initialProps: {hasOnceLoadedReportActions: true, reportID: 'report1', transactions: [txA]}},
        );

        // The switch render still carries report1's loaded flag and list, so nothing here describes report2.
        rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: [txA]});
        rerender({hasOnceLoadedReportActions: false, reportID: 'report2', transactions: []});

        // report2 then loads and hydrates in the two merges Onyx usually delivers.
        rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: [txB]});
        rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: [txB, txC]});
        expect(result.current).toEqual([]);
    });

    it('keeps a diff-detected add highlighted when the list re-sorts around it', () => {
        const txA = {...baseTx, transactionID: 'A'};
        const txB = {...baseTx, transactionID: 'B'};
        const txC = {...baseTx, transactionID: 'C'};
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, undefined, 'report1', true), {
            initialProps: {transactions: [txA, txB]},
        });

        rerender({transactions: [txA, txB, txC]});
        expect(result.current).toEqual([txC]);

        // The optimistic row gets its server created date and the list re-sorts, which is not a change to what is new.
        rerender({transactions: [txC, txA, txB]});
        expect(result.current).toEqual([txC]);
    });

    it('drops a diff-detected add once it leaves the list', () => {
        const txA = {...baseTx, transactionID: 'A'};
        const txB = {...baseTx, transactionID: 'B'};
        const txC = {...baseTx, transactionID: 'C'};
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, undefined, 'report1', true), {
            initialProps: {transactions: [txA, txB]},
        });

        rerender({transactions: [txA, txB, txC]});
        expect(result.current).toEqual([txC]);

        rerender({transactions: [txA, txB]});
        expect(result.current).toEqual([]);
    });

    it('expires a rail-backed diff add in the first window, so it cannot resurface once the rail clears', () => {
        jest.useFakeTimers();
        try {
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; pendingNewTransactionIDs: PendingNewTransactions | undefined}>(
                (props) => useNewTransactions(true, props.transactions, props.pendingNewTransactionIDs, 'report1', true),
                {initialProps: {transactions: [baseTx], pendingNewTransactionIDs: rail(['railTx'])}},
            );

            rerender({transactions: [baseTx, railTx], pendingNewTransactionIDs: rail(['railTx'])});
            expect(result.current).toEqual([railTx]);

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            rerender({transactions: [baseTx, railTx], pendingNewTransactionIDs: undefined});
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });
});

describe('useNewTransactions across report switches', () => {
    const buildTransaction = (transactionID: string, reportID: string): Transaction => ({
        transactionID,
        amount: 100,
        created: '2023-10-01',
        currency: 'USD',
        reportID,
        merchant: '',
    });
    const reportATransactions = [buildTransaction('A1', 'reportA'), buildTransaction('A2', 'reportA')];
    const reportBTransactions = [buildTransaction('B1', 'reportB'), buildTransaction('B2', 'reportB'), buildTransaction('B3', 'reportB')];

    it('does not highlight anything when the same consumer switches to an already-loaded report with more transactions', () => {
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; reportID: string}>(
            (props) => useNewTransactions(true, props.transactions, undefined, props.reportID, true),
            {initialProps: {transactions: reportATransactions, reportID: 'reportA'}},
        );

        rerender({transactions: reportBTransactions, reportID: 'reportB'});
        expect(result.current).toEqual([]);

        const addedTransaction = buildTransaction('B4', 'reportB');
        rerender({transactions: [...reportBTransactions, addedTransaction], reportID: 'reportB'});
        expect(result.current).toEqual([addedTransaction]);
    });

    it('does not highlight the incoming report when its transactions arrive a render after the reportID changes', () => {
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; reportID: string}>(
            (props) => useNewTransactions(true, props.transactions, undefined, props.reportID, true),
            {initialProps: {transactions: reportATransactions, reportID: 'reportA'}},
        );

        rerender({transactions: reportATransactions, reportID: 'reportB'});
        rerender({transactions: reportBTransactions, reportID: 'reportB'});
        expect(result.current).toEqual([]);

        const addedTransaction = buildTransaction('B4', 'reportB');
        rerender({transactions: [...reportBTransactions, addedTransaction], reportID: 'reportB'});
        expect(result.current).toEqual([addedTransaction]);
    });

    it('treats growth right after switching to a not-yet-loaded report as hydration, not an add', () => {
        const [firstTransaction, secondTransaction, thirdTransaction] = reportBTransactions;
        const {rerender, result} = renderHook<Transaction[], {hasOnceLoadedReportActions: boolean; transactions: Transaction[]; reportID: string}>(
            (props) => useNewTransactions(props.hasOnceLoadedReportActions, props.transactions, undefined, props.reportID, true),
            {initialProps: {hasOnceLoadedReportActions: true, transactions: reportATransactions, reportID: 'reportA'}},
        );

        rerender({hasOnceLoadedReportActions: false, transactions: [], reportID: 'reportB'});
        rerender({hasOnceLoadedReportActions: true, transactions: [firstTransaction], reportID: 'reportB'});
        rerender({hasOnceLoadedReportActions: true, transactions: [firstTransaction, secondTransaction], reportID: 'reportB'});
        expect(result.current).toEqual([]);

        rerender({hasOnceLoadedReportActions: true, transactions: [firstTransaction, secondTransaction, thirdTransaction], reportID: 'reportB'});
        expect(result.current).toEqual([thirdTransaction]);
    });

    it('highlights a transaction again when it is removed and later re-added while the consumer stays mounted', () => {
        jest.useFakeTimers();
        try {
            const [baseTransaction, readdedTransaction] = reportATransactions;
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>((props) => useNewTransactions(true, props.transactions, undefined, 'reportA', true), {
                initialProps: {transactions: [baseTransaction]},
            });

            rerender({transactions: [baseTransaction, readdedTransaction]});
            expect(result.current).toEqual([readdedTransaction]);

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(result.current).toEqual([]);

            rerender({transactions: [baseTransaction]});
            rerender({transactions: [baseTransaction, readdedTransaction]});
            expect(result.current).toEqual([readdedTransaction]);
        } finally {
            jest.useRealTimers();
        }
    });
});

afterAll(() => {
    jest.restoreAllMocks();
});
