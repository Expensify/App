import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import CONST from '@src/CONST';
import type {PendingNewTransactions} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';

import {useEffect, useState} from 'react';

import useDeliveredReportTransactions from './useDeliveredReportTransactions';

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_TRANSACTION_IDS: string[] = [];

/** Sweeps already scheduled, keyed `railReportID:flagKey`. Module-level because every preview in a chat reads the same rail. */
const scheduledSweeps = new Set<string>();

type DiffState = {
    /** A different report restarts the diff. */
    reportID: string | undefined;

    /** `undefined` until the report's full list arrives. */
    sourceIDs: string[] | undefined;

    /** Emptied when their highlight window ends. */
    addedIDs: string[];
};

type UseNewTransactionsParams = {
    hasOnceLoadedReportActions: boolean | undefined;

    /** The report's transactions that have arrived so far. */
    transactions: Transaction[];

    /** Counted before the caller filters any out. */
    arrivedTransactionCount: number;

    expectedTransactionCount: number;

    /** Must be the list's own report: a split and a different report both replace the whole list, and only this tells them apart. */
    transactionsReportID: string | undefined;

    /** Creation flags; their rows are new even on first load. */
    pendingNewTransactions: PendingNewTransactions | undefined;

    /** Where `pendingNewTransactions` was read, and so where consumed flags are swept. */
    railReportID: string | undefined;

    isReportVisible: boolean;
};

/**
 * The transactions to highlight: flagged rows as soon as they arrive, and rows the list diff finds added. The diff waits until
 * every transaction has arrived, since a partial list would make the rest look new.
 */
function useNewTransactions({
    hasOnceLoadedReportActions,
    transactions,
    arrivedTransactionCount,
    expectedTransactionCount,
    transactionsReportID,
    pendingNewTransactions,
    railReportID,
    isReportVisible,
}: UseNewTransactionsParams) {
    const [hasSettledAfterInitialLoad, setHasSettledAfterInitialLoad] = useState(() => !!hasOnceLoadedReportActions);
    const [diffState, setDiffState] = useState<DiffState>(() => ({reportID: transactionsReportID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS}));
    const deliveredTransactions = useDeliveredReportTransactions({reportID: transactionsReportID, transactions, arrivedTransactionCount, expectedTransactionCount});
    const trackedTransactionIDs = hasOnceLoadedReportActions && deliveredTransactions ? deliveredTransactions.map(({transactionID}) => transactionID) : undefined;
    const baselineSourceIDs = diffState.sourceIDs;
    const baselineIDs = new Set(baselineSourceIDs);
    const isReportSwitch = transactionsReportID !== diffState.reportID;
    // A reorder is not an add.
    const hasSameTransactionIDs =
        trackedTransactionIDs !== undefined &&
        baselineSourceIDs !== undefined &&
        trackedTransactionIDs.length === baselineSourceIDs.length &&
        trackedTransactionIDs.every((transactionID) => baselineIDs.has(transactionID));
    if (isReportSwitch) {
        // Only the new report's own list can set its baseline.
        setDiffState({reportID: transactionsReportID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS});
        if (hasSettledAfterInitialLoad !== !!hasOnceLoadedReportActions) {
            setHasSettledAfterInitialLoad(!!hasOnceLoadedReportActions);
        }
    } else if (trackedTransactionIDs !== baselineSourceIDs && !hasSameTransactionIDs) {
        let addedIDs = EMPTY_TRANSACTION_IDS;
        if (baselineSourceIDs !== undefined && trackedTransactionIDs !== undefined && trackedTransactionIDs.length > baselineSourceIDs.length) {
            if (!hasSettledAfterInitialLoad) {
                setHasSettledAfterInitialLoad(true);
            } else {
                // Every missing row is an add, even all of them: that is what a split looks like.
                addedIDs = trackedTransactionIDs.filter((transactionID) => !baselineIDs.has(transactionID));
            }
        } else if (diffState.addedIDs.length && trackedTransactionIDs !== undefined) {
            // The same array, so a reorder or removal doesn't restart the highlight window.
            addedIDs = diffState.addedIDs;
        }
        setDiffState({reportID: transactionsReportID, sourceIDs: trackedTransactionIDs, addedIDs});
    }

    // An unloaded report cannot have settled, even if the loaded flag lags a report switch.
    if (!hasOnceLoadedReportActions && hasSettledAfterInitialLoad) {
        setHasSettledAfterInitialLoad(false);
    }

    const activeFlagKeys = pendingNewTransactions?.activeFlagKeys;
    const railTransactions = railReportID && activeFlagKeys && transactions.length ? transactions.filter(({transactionID}) => activeFlagKeys[transactionID]) : EMPTY_TRANSACTIONS;

    let diffTransactions = EMPTY_TRANSACTIONS;
    if (diffState.addedIDs.length && transactions.length) {
        const addedIDs = new Set(diffState.addedIDs);
        diffTransactions = transactions.filter(({transactionID}) => addedIDs.has(transactionID));
    }

    let newTransactions = railTransactions;
    if (!railTransactions.length) {
        newTransactions = diffTransactions.length ? diffTransactions : EMPTY_TRANSACTIONS;
    } else {
        const extraDiff = diffTransactions.filter(({transactionID}) => !activeFlagKeys?.[transactionID]);
        newTransactions = extraDiff.length ? [...railTransactions, ...extraDiff] : railTransactions;
    }

    useEffect(() => {
        if (!isReportVisible || !pendingNewTransactions) {
            return;
        }
        const railFlagKeys = pendingNewTransactions.activeFlagKeys;
        const consumedFlagKeys = newTransactions.map(({transactionID}) => railFlagKeys[transactionID]).filter(Boolean);
        const claimedKeys: string[] = [];
        for (const flagKey of [...consumedFlagKeys, ...pendingNewTransactions.expiredFlagKeys]) {
            const sweepKey = `${railReportID}:${flagKey}`;
            if (scheduledSweeps.has(sweepKey)) {
                continue;
            }
            scheduledSweeps.add(sweepKey);
            claimedKeys.push(flagKey);
        }
        if (!claimedKeys.length) {
            return;
        }

        // No cleanup: a shown highlight's flag must go even if the row unmounts first.
        setTimeout(() => {
            // Released before deleting, so a merge that never lands stays claimable.
            for (const flagKey of claimedKeys) {
                scheduledSweeps.delete(`${railReportID}:${flagKey}`);
            }
            deletePendingNewTransactionIDs(railReportID, claimedKeys);
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
    }, [isReportVisible, pendingNewTransactions, newTransactions, railReportID]);

    // Compared by identity, so a later add of the same size gets its own window.
    const latchedAddedIDs = diffState.addedIDs;
    // Starts when the rows are first visible and never restarts, so covering them can't prolong it.
    const [visibleAddedIDs, setVisibleAddedIDs] = useState<string[] | undefined>(undefined);
    if (isReportVisible && latchedAddedIDs.length && visibleAddedIDs !== latchedAddedIDs) {
        setVisibleAddedIDs(latchedAddedIDs);
    }
    useEffect(() => {
        if (!visibleAddedIDs?.length) {
            return;
        }
        const timer = setTimeout(() => {
            setDiffState((previousDiffState) => (previousDiffState.addedIDs === visibleAddedIDs ? {...previousDiffState, addedIDs: EMPTY_TRANSACTION_IDS} : previousDiffState));
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
        return () => clearTimeout(timer);
    }, [visibleAddedIDs]);

    useEffect(() => {
        if (!hasOnceLoadedReportActions || hasSettledAfterInitialLoad) {
            return;
        }
        let frame: number | undefined;
        let isStale = false;
        new Promise<void>((resolve) => {
            resolve();
        }).then(() => {
            if (isStale) {
                return;
            }
            frame = requestAnimationFrame(() => {
                setHasSettledAfterInitialLoad(true);
            });
        });
        // Cancelled on cleanup, so a frame queued for the previous report cannot undo the reset.
        return () => {
            isStale = true;
            if (frame === undefined) {
                return;
            }
            cancelAnimationFrame(frame);
        };
    }, [hasOnceLoadedReportActions, hasSettledAfterInitialLoad]);

    return newTransactions;
}

export default useNewTransactions;
