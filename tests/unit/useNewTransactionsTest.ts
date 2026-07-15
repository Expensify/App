import {act, renderHook} from '@testing-library/react-native';

import useNewTransactions from '@hooks/useNewTransactions';

import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import CONST from '@src/CONST';
import type {PendingNewTransactions} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';

function rail(activeIDs: string[], expiredIDs: string[] = []): PendingNewTransactions {
    return {activeIDs: Object.fromEntries(activeIDs.map((id) => [id, true as const])), expiredIDs};
}

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

    it('schedules the rail cleanup only from a visible consumer', () => {
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
        const txD = {
            transactionID: 'D',
            amount: 100,
            created: '2023-10-09',
            currency: 'USD',
            reportID: 'report1',
            merchant: '',
        };
        const scheduledCleanups = () => setTimeoutSpy.mock.calls.filter(([, ms]) => ms === CONST.PENDING_TRANSACTION_DELETION_DELAY).length;

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
        expect(scheduledCleanups()).toBe(0);

        rerender({
            transactions: [...transactionsAlreadyInReport, txD],
            pendingNewTransactionIDs: rail(['D']),
            isReportVisible: true,
        });
        expect(scheduledCleanups()).toBeGreaterThan(0);

        setTimeoutSpy.mockRestore();
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

afterAll(() => {
    jest.restoreAllMocks();
});
