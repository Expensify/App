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

// Mimics long Onyx merge overhead, returning a handle so a cancelled frame really is cancelled.
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
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
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
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
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
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
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
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
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
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
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
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
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
        const {rerender, result} = renderHook(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
            {
                initialProps: {
                    hasOnceLoadedReportActions: true,
                    transactions: transactionsAlreadyInReport,
                },
            },
        );
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
        const {rerender, result} = renderHook(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
            {
                initialProps: {
                    hasOnceLoadedReportActions: true,
                    transactions: transactionsAlreadyInReport,
                },
            },
        );
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
            // Given a loaded report on screen with its expenses already listed
            const {rerender, result} = renderHook(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: undefined,
                        transactionsReportID: undefined,
                        railReportID: undefined,
                        isReportVisible: true,
                    }),
                {
                    initialProps: {
                        hasOnceLoadedReportActions: true,
                        transactions: transactionsAlreadyInReport,
                    },
                },
            );

            // When an expense is added while the user watches
            rerender({
                hasOnceLoadedReportActions: true,
                transactions: [...transactionsAlreadyInReport, newTransaction],
            });

            // Then it is highlighted
            expect(result.current).toEqual([newTransaction]);

            // When its highlight window runs out
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then it is no longer new, so a row that remounts afterwards has no highlight to play again
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('returns new transactions when adding transactions to empty report', async () => {
        // 1. Report and transactions data is loaded from Onyx
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; hasOnceLoadedReportActions: boolean}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
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
        const {rerender, result} = renderHook(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
            {
                initialProps: {
                    hasOnceLoadedReportActions: true,
                    transactions: transactionsAlreadyInReport,
                },
            },
        );
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

    it('highlights a flagged transaction as soon as it arrives, and not the rest of the report arriving after it', () => {
        // Given a report whose other transactions are not on this device yet
        const flags = rail([newTransaction.transactionID]);
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: transactionsAlreadyInReport.length + 1,
                    pendingNewTransactions: flags,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {initialProps: {transactions: [newTransaction]}},
        );

        // When only the added transaction, which carries a flag, has arrived
        // Then it is highlighted without waiting for the rest
        expect(result.current).toEqual([newTransaction]);

        // When the rest of the report arrives
        rerender({transactions: [newTransaction, ...transactionsAlreadyInReport]});

        // Then none of those rows is highlighted, since they were already in the report
        expect(result.current).toEqual([newTransaction]);
    });

    it('returns pending new transactions on first load when submitted from another report', () => {
        // 1. Component mounts, report not loaded yet, but transaction is already in Onyx
        const {rerender, result} = renderHook<
            Transaction[],
            {
                transactions: Transaction[];
                hasOnceLoadedReportActions: boolean;
                pendingNewTransactionIDs: PendingNewTransactions | undefined;
                isReportVisible: boolean;
            }
        >(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: props.pendingNewTransactionIDs,
                    transactionsReportID: '1',
                    railReportID: '1',
                    isReportVisible: props.isReportVisible,
                }),
            {
                initialProps: {
                    hasOnceLoadedReportActions: false,
                    transactions: [],
                    pendingNewTransactionIDs: rail([newTransaction.transactionID]),
                    isReportVisible: true,
                },
            },
        );
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
        >(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: props.pendingNewTransactionIDs,
                    transactionsReportID: undefined,
                    railReportID: undefined,
                    isReportVisible: true,
                }),
            {
                initialProps: {
                    hasOnceLoadedReportActions: false,
                    transactions: [],
                    pendingNewTransactionIDs: undefined,
                },
            },
        );

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
        >(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: props.pendingNewTransactionIDs,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {
                initialProps: {
                    transactions: stableTransactions,
                    pendingNewTransactionIDs: undefined,
                },
            },
        );
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
                isReportVisible: boolean;
            }
        >(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: props.pendingNewTransactionIDs,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: props.isReportVisible,
                }),
            {
                initialProps: {
                    hasOnceLoadedReportActions: true,
                    transactions: [originalTx, duplicateTx],
                    pendingNewTransactionIDs: undefined,
                    isReportVisible: true,
                },
            },
        );
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
        >(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: props.pendingNewTransactionIDs,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {
                initialProps: {
                    transactions: [existingTx],
                    pendingNewTransactionIDs: rail([], [existingTx.transactionID]),
                },
            },
        );
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
        >(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: props.pendingNewTransactionIDs,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {
                initialProps: {
                    transactions: [existingTx],
                    pendingNewTransactionIDs: rail([]),
                },
            },
        );
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
        // Given a loaded report covered by an RHP
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; isReportVisible: boolean}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: props.isReportVisible,
                }),
            {
                initialProps: {
                    transactions: transactionsAlreadyInReport,
                    isReportVisible: false,
                },
            },
        );
        expect(result.current).toEqual([]);

        // When an expense is added while it is covered
        rerender({
            transactions: [...transactionsAlreadyInReport, newTransaction],
            isReportVisible: false,
        });

        // Then it is still new, so it can be highlighted once the user uncovers the report
        expect(result.current).toEqual([newTransaction]);
    });

    it('emits a flagged add even when the report is not visible', () => {
        // Given a report covered by an RHP
        const allTransactions = [...transactionsAlreadyInReport, newTransaction];

        // When its list holds an expense whose creation flag is on the rail
        const {result} = renderHook(() =>
            useNewTransactions({
                hasOnceLoadedReportActions: true,
                transactions: allTransactions,
                arrivedTransactionCount: allTransactions.length,
                expectedTransactionCount: allTransactions.length,
                pendingNewTransactions: rail([newTransaction.transactionID]),
                transactionsReportID: 'report1',
                railReportID: 'report1',
                isReportVisible: false,
            }),
        );

        // Then it is new: being covered holds back only the flag's sweep, not the highlight
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
        >(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: props.pendingNewTransactionIDs,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {
                initialProps: {
                    transactions: transactionsAlreadyInReport,
                    pendingNewTransactionIDs: rail([]),
                },
            },
        );
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
            // Given a report covered by an RHP, whose rail flags an expense that has not arrived yet
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
            >(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: props.pendingNewTransactionIDs,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: props.isReportVisible,
                    }),
                {
                    initialProps: {
                        transactions: transactionsAlreadyInReport,
                        pendingNewTransactionIDs: rail(['D']),
                        isReportVisible: false,
                    },
                },
            );

            // When the flagged expense arrives while the report is still covered, and the sweep delay passes
            rerender({
                transactions: [...transactionsAlreadyInReport, txD],
                pendingNewTransactionIDs: rail(['D']),
                isReportVisible: false,
            });
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then its flag stays, because nobody has seen the highlight yet
            expect(deletePendingNewTransactionIDs).not.toHaveBeenCalled();

            // When the user uncovers the report and the delay passes again
            rerender({
                transactions: [...transactionsAlreadyInReport, txD],
                pendingNewTransactionIDs: rail(['D']),
                isReportVisible: true,
            });
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the flag is swept, since the highlight has now been shown
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('report1', ['D']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('leaves the window running when one of the added transactions is removed, rather than restarting it for the survivors', () => {
        jest.useFakeTimers();
        try {
            // Given a loaded report on screen
            const txG = {transactionID: 'G', amount: 100, created: '2023-10-10', currency: 'USD', reportID: 'report1', merchant: ''};
            const txH = {transactionID: 'H', amount: 100, created: '2023-10-11', currency: 'USD', reportID: 'report1', merchant: ''};
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: undefined,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: true,
                    }),
                {
                    initialProps: {transactions: transactionsAlreadyInReport},
                },
            );

            // When two expenses land in the same update
            rerender({transactions: [...transactionsAlreadyInReport, txG, txH]});

            // Then both are highlighted
            expect(result.current).toEqual([txG, txH]);

            // When one of them is deleted just before their window closes
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY - 100);
            });
            rerender({transactions: [...transactionsAlreadyInReport, txH]});

            // Then the other stays highlighted
            expect(result.current).toEqual([txH]);

            // When the rest of that window passes
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then it retires on schedule; a removal must not give the survivor a fresh window
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('runs the window to completion while the report is opened and closed over, rather than restarting it on every visibility flip', () => {
        jest.useFakeTimers();
        try {
            // Given a loaded report on screen
            const txV = {transactionID: 'V', amount: 100, created: '2023-10-12', currency: 'USD', reportID: 'report1', merchant: ''};
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; isReportVisible: boolean}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: undefined,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: props.isReportVisible,
                    }),
                {initialProps: {transactions: transactionsAlreadyInReport, isReportVisible: true}},
            );

            // When an expense is added
            rerender({transactions: [...transactionsAlreadyInReport, txV], isReportVisible: true});

            // Then it is highlighted
            expect(result.current).toEqual([txV]);

            // When an RHP covers and uncovers the report just before the window closes
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY - 100);
            });
            rerender({transactions: [...transactionsAlreadyInReport, txV], isReportVisible: false});
            rerender({transactions: [...transactionsAlreadyInReport, txV], isReportVisible: true});
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then it retires when the original window ends, since a visibility flip must not restart it
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('holds the window shut while the rows are covered, so a highlight cannot expire before anyone sees it', () => {
        jest.useFakeTimers();
        try {
            // Given a report covered by an RHP
            const txW = {transactionID: 'W', amount: 100, created: '2023-10-12', currency: 'USD', reportID: 'report1', merchant: ''};
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; isReportVisible: boolean}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: undefined,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: props.isReportVisible,
                    }),
                {initialProps: {transactions: transactionsAlreadyInReport, isReportVisible: false}},
            );

            // When a row is added while it is covered, and more than a whole window passes
            rerender({transactions: [...transactionsAlreadyInReport, txW], isReportVisible: false});
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY * 2);
            });

            // Then it is still new, because the window it retires on has not started
            expect(result.current).toEqual([txW]);

            // And once the user is looking at it, the window runs and retires it
            rerender({transactions: [...transactionsAlreadyInReport, txW], isReportVisible: true});
            expect(result.current).toEqual([txW]);
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('gives a second diff-detected add its own window rather than the window already running', () => {
        jest.useFakeTimers();
        try {
            // Given a loaded report on screen
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
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: undefined,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: true,
                    }),
                {
                    initialProps: {transactions: transactionsAlreadyInReport},
                },
            );

            // When an expense is added
            rerender({transactions: [...transactionsAlreadyInReport, txE]});

            // Then it is highlighted
            expect(result.current).toEqual([txE]);

            // When a second expense lands just before the first one's window closes, so there is still one add
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY - 100);
            });
            rerender({transactions: [...transactionsAlreadyInReport, txE, txF]});

            // Then the second is the one highlighted
            expect(result.current).toEqual([txF]);

            // When the first window's time runs out
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the second is still highlighted, because its window started when it landed
            expect(result.current).toEqual([txF]);

            // When its own window runs out
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then it is no longer new
            expect(result.current).toEqual([]);
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not let a settle frame queued for the outgoing report settle the report switched into', async () => {
        jest.useFakeTimers();
        try {
            // Given a consumer on report1 as its first load completes
            const txG = {
                transactionID: 'G',
                amount: 100,
                created: '2023-10-12',
                currency: 'USD',
                reportID: 'report2',
                merchant: '',
            };
            const {rerender, result} = renderHook<Transaction[], {hasOnceLoadedReportActions: boolean; reportID: string; transactions: Transaction[]}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: undefined,
                        transactionsReportID: props.reportID,
                        railReportID: props.reportID,
                        isReportVisible: true,
                    }),
                {initialProps: {hasOnceLoadedReportActions: false, reportID: 'report1', transactions: []}},
            );

            rerender({hasOnceLoadedReportActions: true, reportID: 'report1', transactions: transactionsAlreadyInReport});
            // Let report1's settle microtask queue its frame, without letting the frame run.
            await act(async () => {
                await Promise.resolve();
            });

            // When the consumer switches to report2, not yet loaded, before that frame is due to run
            rerender({hasOnceLoadedReportActions: false, reportID: 'report2', transactions: []});
            await act(async () => {
                jest.advanceTimersByTime(100);
            });

            // And report2 then loads in two merges, as Onyx usually delivers it
            rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: transactionsAlreadyInReport});
            rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: [...transactionsAlreadyInReport, txG]});

            // Then nothing is new: report1's stale frame did not settle report2, so its load is not an add
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
        // Given a loaded report whose list repeats a transaction ID
        const transactions = [txWithID('a'), txWithID('a')];

        // When it renders again with the same list, where a render-phase update that never settles would loop
        const {rerender, result} = renderHook(() =>
            useNewTransactions({
                hasOnceLoadedReportActions: true,
                transactions,
                arrivedTransactionCount: transactions.length,
                expectedTransactionCount: transactions.length,
                pendingNewTransactions: undefined,
                transactionsReportID: 'report1',
                railReportID: 'report1',
                isReportVisible: true,
            }),
        );
        rerender(undefined);
        rerender(undefined);

        // Then it settles with nothing new, since the list is the one it already recorded
        expect(result.current).toEqual([]);
    });

    it('treats a re-ordered list as unchanged, so no window opens and no render is spent recording it', () => {
        // Given a loaded report with two expenses
        const first = txWithID('a');
        const second = txWithID('b');
        const {rerender, result} = renderHook(
            (props: {transactions: Transaction[]}) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {
                initialProps: {transactions: [first, second]},
            },
        );

        // When the list re-sorts
        rerender({transactions: [second, first]});

        // Then nothing is new, because the same rows are there
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

    it("sweeps a consumed flag from the rail's report, not from the report the rows belong to", () => {
        jest.useFakeTimers();
        try {
            // Given a chat preview, whose rows are the expense report's but whose rail is written to the chat
            const transactions = [baseTx, railTx];
            renderHook(() =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions,
                    arrivedTransactionCount: transactions.length,
                    expectedTransactionCount: transactions.length,
                    pendingNewTransactions: rail(['railTx']),
                    transactionsReportID: 'report1',
                    railReportID: 'chatReport',
                    isReportVisible: true,
                }),
            );

            // When the flag it highlighted is due to be swept
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the sweep clears the chat's rail, where that flag lives
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('chatReport', expect.arrayContaining([expect.stringContaining('railTx')]));
            expect(deletePendingNewTransactionIDs).not.toHaveBeenCalledWith('report1', expect.anything());
        } finally {
            jest.useRealTimers();
        }
    });

    it('schedules one sweep for a flag two consumers of the same report both see', () => {
        jest.useFakeTimers();
        try {
            // Given two consumers showing the same flag, as every preview in a chat reads the same rail
            const transactions = [baseTx, railTx];
            const pendingNewTransactions = rail(['railTx']);
            renderHook(() =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions,
                    arrivedTransactionCount: transactions.length,
                    expectedTransactionCount: transactions.length,
                    pendingNewTransactions,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            );
            renderHook(() =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions,
                    arrivedTransactionCount: transactions.length,
                    expectedTransactionCount: transactions.length,
                    pendingNewTransactions,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            );

            // When the sweep delay passes
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the flag is deleted once, not once for each consumer that claimed it
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('completes the scheduled rail deletion even if the consumer unmounts first', () => {
        jest.useFakeTimers();
        try {
            // Given a visible consumer showing a flagged expense, which schedules the flag's sweep
            const transactions = [baseTx, railTx];
            const pendingNewTransactions = rail(['railTx']);
            const {unmount} = renderHook(() =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions,
                    arrivedTransactionCount: transactions.length,
                    expectedTransactionCount: transactions.length,
                    pendingNewTransactions,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            );

            // When the consumer unmounts before the sweep delay has passed
            unmount();
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the flag is still deleted, since its highlight was shown and must not play again
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('report1', ['railTx']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('sweeps expired flags together with the consumed ones', () => {
        jest.useFakeTimers();
        try {
            // Given a visible consumer showing a flagged expense, on a rail that also holds an expired flag
            const transactions = [baseTx, railTx];
            const pendingNewTransactions = rail(['railTx'], ['staleTx']);
            renderHook(() =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions,
                    arrivedTransactionCount: transactions.length,
                    expectedTransactionCount: transactions.length,
                    pendingNewTransactions,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            );

            // When the sweep delay passes
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then both go in one deletion, so expired flags do not pile up on the rail
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('report1', ['railTx', 'staleTx']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('schedules a flag deletion only once while report data keeps changing', () => {
        jest.useFakeTimers();
        try {
            // Given a visible consumer showing a flagged expense
            const pendingNewTransactions = rail(['railTx']);
            const {rerender} = renderHook<Transaction[], {transactions: Transaction[]}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: true,
                    }),
                {
                    initialProps: {transactions: [baseTx, railTx]},
                },
            );

            // When the report re-renders and an expense is edited before the sweep delay passes
            rerender({transactions: [baseTx, railTx]});
            rerender({transactions: [{...baseTx, amount: 150}, railTx]});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the flag is deleted once, because the sweep already scheduled for it covers those renders
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('sweeps a re-flagged transaction again, because the new flag is a different instance', () => {
        jest.useFakeTimers();
        try {
            // Given a visible consumer showing a flagged expense
            const transactions = [baseTx, railTx];
            const {rerender} = renderHook<Transaction[], {pendingNewTransactions: PendingNewTransactions | undefined}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions,
                        arrivedTransactionCount: transactions.length,
                        expectedTransactionCount: transactions.length,
                        pendingNewTransactions: props.pendingNewTransactions,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: true,
                    }),
                {initialProps: {pendingNewTransactions: stampedRail({railTx: 1000})}},
            );

            // When the sweep delay passes
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then that flag is swept
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx:1000']);

            // When the rail clears and the same expense is flagged again, and the delay passes
            rerender({pendingNewTransactions: undefined});
            rerender({pendingNewTransactions: stampedRail({railTx: 2000})});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the new flag is swept too, rather than being mistaken for the one already swept
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(2);
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx:2000']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('claims a flag again once its deletion has been issued, so a merge that never lands is retried', () => {
        jest.useFakeTimers();
        try {
            // Given a visible consumer showing a flagged expense
            const pendingNewTransactions = stampedRail({railTx: 1000});
            const {rerender} = renderHook<Transaction[], {transactions: Transaction[]}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: true,
                    }),
                {
                    initialProps: {transactions: [baseTx, railTx]},
                },
            );

            // When the sweep delay passes
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the flag's deletion is issued
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);

            // When the report re-renders with the flag still on the rail, as if that deletion never landed
            rerender({transactions: [{...baseTx, amount: 150}, railTx]});
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the deletion is issued again, so a lost merge cannot leave the flag on the rail
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(2);
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not sweep the same flag instance twice while it is still on the rail', () => {
        jest.useFakeTimers();
        try {
            // Given a visible consumer showing a flagged expense, whose sweep is scheduled
            const pendingNewTransactions = stampedRail({railTx: 1000});
            const {rerender} = renderHook<Transaction[], {transactions: Transaction[]}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: true,
                    }),
                {
                    initialProps: {transactions: [baseTx, railTx]},
                },
            );

            // When an expense is edited twice while that sweep is pending, and time runs well past its delay
            rerender({transactions: [{...baseTx, amount: 150}, railTx]});
            rerender({transactions: [{...baseTx, amount: 175}, railTx]});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY * 2);
            });

            // Then the flag is deleted once, since a pending sweep already holds it
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('sweeps a flag on the report switched into, even for a transaction already swept on the previous report', () => {
        jest.useFakeTimers();
        try {
            // Given a consumer on report1 showing a flagged expense
            const transactions = [baseTx, railTx];
            const pendingNewTransactions = rail(['railTx']);
            const {rerender} = renderHook<Transaction[], {reportID: string}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions,
                        arrivedTransactionCount: transactions.length,
                        expectedTransactionCount: transactions.length,
                        pendingNewTransactions,
                        transactionsReportID: props.reportID,
                        railReportID: props.reportID,
                        isReportVisible: true,
                    }),
                {
                    initialProps: {reportID: 'report1'},
                },
            );

            // When the sweep delay passes
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then report1's rail is swept
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx']);

            // When the consumer switches to report2, whose rail flags the same transaction
            rerender({reportID: 'report2'});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then report2's rail is swept too, since a sweep on one rail says nothing about another
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report2', ['railTx']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not arm a second sweep for a report the consumer leaves and returns to inside the delay window', () => {
        jest.useFakeTimers();
        try {
            // Given a consumer on report1 showing a flagged expense, whose sweep is scheduled
            const transactions = [baseTx, railTx];
            const {rerender} = renderHook<Transaction[], {reportID: string; pendingNewTransactions: PendingNewTransactions | undefined}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions,
                        arrivedTransactionCount: transactions.length,
                        expectedTransactionCount: transactions.length,
                        pendingNewTransactions: props.pendingNewTransactions,
                        transactionsReportID: props.reportID,
                        railReportID: props.reportID,
                        isReportVisible: true,
                    }),
                {initialProps: {reportID: 'report1', pendingNewTransactions: rail(['railTx'])}},
            );

            // When it switches to report2 and back before that sweep runs, and time runs well past its delay
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY / 4);
            });
            rerender({reportID: 'report2', pendingNewTransactions: undefined});
            rerender({reportID: 'report1', pendingNewTransactions: rail(['railTx'])});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY * 2);
            });

            // Then report1's flag is deleted once, because the sweep scheduled before leaving still holds it
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledTimes(1);
            expect(deletePendingNewTransactionIDs).toHaveBeenCalledWith('report1', ['railTx']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('sweeps a re-flagged transaction together with a flag whose deletion has not landed', () => {
        jest.useFakeTimers();
        try {
            // Given a visible consumer showing two flagged expenses on the same rail
            const otherTx: Transaction = {...railTx, transactionID: 'otherTx'};
            const transactions = [baseTx, railTx, otherTx];
            const {rerender} = renderHook<Transaction[], {pendingNewTransactions: PendingNewTransactions}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions,
                        arrivedTransactionCount: transactions.length,
                        expectedTransactionCount: transactions.length,
                        pendingNewTransactions: props.pendingNewTransactions,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: true,
                    }),
                {initialProps: {pendingNewTransactions: stampedRail({railTx: 1000, otherTx: 1000})}},
            );

            // When the sweep delay passes
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then both flags go in one sweep
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx:1000', 'otherTx:1000']);

            // When one expense is flagged again while the other's flag is still on the rail, as if its deletion never landed
            rerender({pendingNewTransactions: stampedRail({railTx: 2000, otherTx: 1000})});

            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then the new flag is swept, and the old one is retried in the same deletion so a lost merge cannot strand it
            expect(deletePendingNewTransactionIDs).toHaveBeenLastCalledWith('report1', ['railTx:2000', 'otherTx:1000']);
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not misattribute a same-length swap as new on the next addition', () => {
        // Given a loaded report with two expenses
        const txA = {...baseTx, transactionID: 'A'};
        const txB = {...baseTx, transactionID: 'B'};
        const txC = {...baseTx, transactionID: 'C'};
        const txD = {...baseTx, transactionID: 'D'};
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {
                initialProps: {transactions: [txA, txB]},
            },
        );

        // When one expense is swapped for another in a single update, so the count does not change
        rerender({transactions: [txA, txC]});

        // Then nothing is new, since the list did not grow
        expect(result.current).toEqual([]);

        // When a further expense is added
        rerender({transactions: [txA, txC, txD]});

        // Then only that one is new; the swapped-in row was already part of the list compared against
        expect(result.current).toEqual([txD]);
    });

    it('treats the incoming report as unsettled when the loaded flag lags the switch, so its hydration is not an add', () => {
        // Given a consumer on a loaded report1
        const txA = {...baseTx, transactionID: 'A'};
        const txB = {...baseTx, transactionID: 'B'};
        const txC = {...baseTx, transactionID: 'C'};
        const {rerender, result} = renderHook<Transaction[], {hasOnceLoadedReportActions: boolean; reportID: string; transactions: Transaction[]}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: props.reportID,
                    railReportID: props.reportID,
                    isReportVisible: true,
                }),
            {initialProps: {hasOnceLoadedReportActions: true, reportID: 'report1', transactions: [txA]}},
        );

        // When it switches to report2 on a render still carrying report1's loaded flag and list
        rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: [txA]});
        rerender({hasOnceLoadedReportActions: false, reportID: 'report2', transactions: []});

        // And report2 then loads, its expenses arriving one merge at a time
        rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: [txB]});
        rerender({hasOnceLoadedReportActions: true, reportID: 'report2', transactions: [txB, txC]});

        // Then none of them is new: that growth is report2's first load, whatever the lagging flag claimed
        expect(result.current).toEqual([]);
    });

    it('keeps a diff-detected add highlighted when the list re-sorts around it', () => {
        // Given a loaded report with two expenses
        const txA = {...baseTx, transactionID: 'A'};
        const txB = {...baseTx, transactionID: 'B'};
        const txC = {...baseTx, transactionID: 'C'};
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {
                initialProps: {transactions: [txA, txB]},
            },
        );

        // When an expense is added
        rerender({transactions: [txA, txB, txC]});

        // Then it is highlighted
        expect(result.current).toEqual([txC]);

        // When the optimistic row gets its server created date and the list re-sorts
        rerender({transactions: [txC, txA, txB]});

        // Then it is still the one highlighted, since a re-sort does not change what is new
        expect(result.current).toEqual([txC]);
    });

    it('drops a diff-detected add once it leaves the list', () => {
        // Given a loaded report with two expenses
        const txA = {...baseTx, transactionID: 'A'};
        const txB = {...baseTx, transactionID: 'B'};
        const txC = {...baseTx, transactionID: 'C'};
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: 'report1',
                    railReportID: 'report1',
                    isReportVisible: true,
                }),
            {
                initialProps: {transactions: [txA, txB]},
            },
        );

        // When an expense is added
        rerender({transactions: [txA, txB, txC]});

        // Then it is highlighted
        expect(result.current).toEqual([txC]);

        // When it is deleted before its window ends
        rerender({transactions: [txA, txB]});

        // Then nothing is highlighted, since the row is no longer there to show
        expect(result.current).toEqual([]);
    });

    it('expires a rail-backed diff add in the first window, so it cannot resurface once the rail clears', () => {
        jest.useFakeTimers();
        try {
            // Given a loaded report on screen whose rail flags an expense that has not arrived yet
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; pendingNewTransactionIDs: PendingNewTransactions | undefined}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: props.pendingNewTransactionIDs,
                        transactionsReportID: 'report1',
                        railReportID: 'report1',
                        isReportVisible: true,
                    }),
                {initialProps: {transactions: [baseTx], pendingNewTransactionIDs: rail(['railTx'])}},
            );

            // When it arrives, so both the flag and the list diff find it
            rerender({transactions: [baseTx, railTx], pendingNewTransactionIDs: rail(['railTx'])});

            // Then it is highlighted
            expect(result.current).toEqual([railTx]);

            // When the window passes and the flag's sweep then clears the rail
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            rerender({transactions: [baseTx, railTx], pendingNewTransactionIDs: undefined});

            // Then it is not new again, because the diff's highlight ran out alongside the flag's
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
        // Given a consumer showing report A
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; reportID: string}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: props.reportID,
                    railReportID: props.reportID,
                    isReportVisible: true,
                }),
            {initialProps: {transactions: reportATransactions, reportID: 'reportA'}},
        );

        // When it switches to report B, already loaded and holding more expenses than A
        rerender({transactions: reportBTransactions, reportID: 'reportB'});

        // Then none of B's rows is new, since a different report starts its own baseline
        expect(result.current).toEqual([]);

        // And an expense added to B afterwards still is
        const addedTransaction = buildTransaction('B4', 'reportB');
        rerender({transactions: [...reportBTransactions, addedTransaction], reportID: 'reportB'});
        expect(result.current).toEqual([addedTransaction]);
    });

    it('does not highlight the incoming report when its own list is the first one it receives', () => {
        // Given report A, then a switch to report B before any of B's transactions have arrived
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; expectedTransactionCount?: number; reportID: string}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.expectedTransactionCount ?? props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: props.reportID,
                    railReportID: props.reportID,
                    isReportVisible: true,
                }),
            {initialProps: {transactions: reportATransactions, reportID: 'reportA'}},
        );

        rerender({transactions: [], expectedTransactionCount: reportBTransactions.length, reportID: 'reportB'});

        // When B's transactions arrive
        rerender({transactions: reportBTransactions, reportID: 'reportB'});

        // Then none of them is new, while an add after that is
        expect(result.current).toEqual([]);

        const addedTransaction = buildTransaction('B4', 'reportB');
        rerender({transactions: [...reportBTransactions, addedTransaction], reportID: 'reportB'});
        expect(result.current).toEqual([addedTransaction]);
    });

    it("does not highlight a recycled preview's new report, although the chat its rail is read from stays the same", () => {
        // Given a preview of report A that the chat list recycles into another preview of the same chat
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; transactionsReportID: string}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: props.transactionsReportID,
                    railReportID: 'chatReport',
                    isReportVisible: true,
                }),
            {initialProps: {transactions: reportATransactions, transactionsReportID: 'reportA'}},
        );

        // When the same instance is reused for report B, which has more expenses and shares none of A's
        rerender({transactions: reportBTransactions, transactionsReportID: 'reportB'});

        // Then none of B's rows is new; under the same report this list would read as a split
        expect(result.current).toEqual([]);

        // And an expense added to B afterwards still is
        const addedTransaction = buildTransaction('B4', 'reportB');
        rerender({transactions: [...reportBTransactions, addedTransaction], transactionsReportID: 'reportB'});
        expect(result.current).toEqual([addedTransaction]);
    });

    it('highlights every row when a split replaces the whole list, since the rows really are new', () => {
        // Given a loaded report on screen holding one expense
        const splitChildren = [buildTransaction('A1-split-1', 'reportA'), buildTransaction('A1-split-2', 'reportA')];
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: 'reportA',
                    railReportID: 'reportA',
                    isReportVisible: true,
                }),
            {
                initialProps: {transactions: reportATransactions.slice(0, 1)},
            },
        );

        // When it is split, which takes the original off the report and puts its children there
        rerender({transactions: splitChildren});

        // Then every child is new; on the same report, a list that shares nothing is a split, not a switch
        expect(result.current).toEqual(splitChildren);
    });

    it('highlights nothing when a reconnect only clears the pending actions of rows already on the list', () => {
        // Given a report holding rows the user added offline, whose highlight window has already run
        const pendingTransactions = [buildTransaction('A1-offline', 'reportA'), buildTransaction('A2-offline', 'reportA')].map((transaction) => ({
            ...transaction,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        }));
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: 'reportA',
                    railReportID: 'reportA',
                    isReportVisible: true,
                }),
            {
                initialProps: {transactions: pendingTransactions},
            },
        );

        // When coming back online reconciles them, which rewrites every row without changing which rows are there
        rerender({transactions: pendingTransactions.map((transaction) => ({...transaction, pendingAction: undefined}))});

        // Then nothing is new: the same rows are there
        expect(result.current).toEqual([]);
    });

    it('highlights every row of a bulk add that fills a report the user watched while it was empty', () => {
        // Given a loaded report whose own list has arrived and holds nothing
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: 'reportA',
                    railReportID: 'reportA',
                    isReportVisible: true,
                }),
            {
                initialProps: {transactions: []},
            },
        );
        expect(result.current).toEqual([]);

        // When existing expenses are moved onto it, which lands both rows in one update and writes no rail flag
        const movedTransactions = [buildTransaction('A1-moved', 'reportA'), buildTransaction('A2-moved', 'reportA')];
        rerender({transactions: movedTransactions});

        // Then both are adds, however many arrive at once
        expect(result.current).toEqual(movedTransactions);
    });

    it('treats growth right after switching to a not-yet-loaded report as hydration, not an add', () => {
        // Given a consumer on a loaded report A
        const [firstTransaction, secondTransaction, thirdTransaction] = reportBTransactions;
        const {rerender, result} = renderHook<Transaction[], {hasOnceLoadedReportActions: boolean; transactions: Transaction[]; reportID: string}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: props.hasOnceLoadedReportActions,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: props.reportID,
                    railReportID: props.reportID,
                    isReportVisible: true,
                }),
            {initialProps: {hasOnceLoadedReportActions: true, transactions: reportATransactions, reportID: 'reportA'}},
        );

        // When it switches to report B before B has loaded, and B's expenses then arrive one merge at a time
        rerender({hasOnceLoadedReportActions: false, transactions: [], reportID: 'reportB'});
        rerender({hasOnceLoadedReportActions: true, transactions: [firstTransaction], reportID: 'reportB'});
        rerender({hasOnceLoadedReportActions: true, transactions: [firstTransaction, secondTransaction], reportID: 'reportB'});

        // Then none of them is new, since that growth is B loading
        expect(result.current).toEqual([]);

        // When a further expense is added once B has settled
        rerender({hasOnceLoadedReportActions: true, transactions: [firstTransaction, secondTransaction, thirdTransaction], reportID: 'reportB'});

        // Then that one is new
        expect(result.current).toEqual([thirdTransaction]);
    });

    it('does not treat the rest of a report arriving after part of it as added rows', () => {
        // Given a switch to report B, already loaded, whose transactions arrive in batches
        const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]; reportID: string}>(
            (props) =>
                useNewTransactions({
                    hasOnceLoadedReportActions: true,
                    transactions: props.transactions,
                    arrivedTransactionCount: props.transactions.length,
                    expectedTransactionCount: props.reportID === 'reportB' ? reportBTransactions.length : props.transactions.length,
                    pendingNewTransactions: undefined,
                    transactionsReportID: props.reportID,
                    railReportID: props.reportID,
                    isReportVisible: true,
                }),
            {initialProps: {transactions: reportATransactions, reportID: 'reportA'}},
        );

        // When the first batch arrives, and then the rest
        rerender({transactions: reportBTransactions.slice(0, 1), reportID: 'reportB'});
        rerender({transactions: reportBTransactions, reportID: 'reportB'});

        // Then none of them is new: a list with rows still to come is no baseline
        expect(result.current).toEqual([]);
    });

    it('highlights a transaction again when it is removed and later re-added while the consumer stays mounted', () => {
        jest.useFakeTimers();
        try {
            // Given a loaded report on screen holding one expense
            const [baseTransaction, reAddedTransaction] = reportATransactions;
            const {rerender, result} = renderHook<Transaction[], {transactions: Transaction[]}>(
                (props) =>
                    useNewTransactions({
                        hasOnceLoadedReportActions: true,
                        transactions: props.transactions,
                        arrivedTransactionCount: props.transactions.length,
                        expectedTransactionCount: props.transactions.length,
                        pendingNewTransactions: undefined,
                        transactionsReportID: 'reportA',
                        railReportID: 'reportA',
                        isReportVisible: true,
                    }),
                {
                    initialProps: {transactions: [baseTransaction]},
                },
            );

            // When a second expense is added
            rerender({transactions: [baseTransaction, reAddedTransaction]});

            // Then it is highlighted
            expect(result.current).toEqual([reAddedTransaction]);

            // When its highlight window runs out
            act(() => {
                jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_DELETION_DELAY);
            });

            // Then it is no longer new
            expect(result.current).toEqual([]);

            // When it is removed from the report and later added back
            rerender({transactions: [baseTransaction]});
            rerender({transactions: [baseTransaction, reAddedTransaction]});

            // Then it is highlighted again, since coming back is a fresh add
            expect(result.current).toEqual([reAddedTransaction]);
        } finally {
            jest.useRealTimers();
        }
    });
});

afterAll(() => {
    jest.restoreAllMocks();
});
