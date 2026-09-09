import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import CONST from '@src/CONST';
import type {PendingNewTransactions} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';

import {useEffect, useState} from 'react';

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_TRANSACTION_IDS: string[] = [];

/**
 * Flag instances a sweep has already been scheduled for, keyed `reportID:flagKey`. Shared, because every preview in a
 * chat reads the same rail and would otherwise each schedule the same delete.
 */
const scheduledSweeps = new Set<string>();

type DiffState = {
    /** Report the baseline belongs to, so a switch restarts the latch as a fresh mount would. */
    reportID: string | undefined;

    /** Baseline the next growth is diffed against, `undefined` until the report's own list arrives. */
    sourceIDs: string[] | undefined;

    /** Diff-detected adds still eligible to highlight, emptied once their window elapses. */
    addedIDs: string[];
};

/**
 * This hook returns new transactions that have been added since the last transactions update.
 * This hook should be used only in the context of highlighting the new transactions on the Report table view.
 *
 * When `pendingNewTransactions` is provided, its active transactions will be treated as new even on the
 * first load. This handles the case where a transaction was created before the component mounts
 * (e.g., submitting a tracked expense from Self DM to a workspace on Web).
 */
function useNewTransactions(
    hasOnceLoadedReportActions: boolean | undefined,
    transactions: Transaction[] | undefined,
    pendingNewTransactions?: PendingNewTransactions,
    reportID?: string,
    isReportVisible?: boolean,
) {
    const [hasSettledAfterInitialLoad, setHasSettledAfterInitialLoad] = useState(() => !!hasOnceLoadedReportActions);
    const [diffState, setDiffState] = useState<DiffState>(() => ({reportID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS}));
    const trackedTransactionIDs = hasOnceLoadedReportActions && transactions ? transactions.map(({transactionID}) => transactionID) : undefined;
    const baselineSourceIDs = diffState.sourceIDs;
    const baselineIDs = new Set(baselineSourceIDs);
    const isReportSwitch = reportID !== diffState.reportID;
    // Membership, not sequence: a reorder says nothing about what is new, so recording one would cost a render pass and change nothing.
    const hasSameTransactionIDs =
        trackedTransactionIDs !== undefined &&
        baselineSourceIDs !== undefined &&
        trackedTransactionIDs.length === baselineSourceIDs.length &&
        trackedTransactionIDs.every((transactionID) => baselineIDs.has(transactionID));
    if (isReportSwitch) {
        // The list in hand can still be the outgoing report's, so let the incoming report's own list set the baseline.
        setDiffState({reportID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS});
        if (hasSettledAfterInitialLoad !== !!hasOnceLoadedReportActions) {
            setHasSettledAfterInitialLoad(!!hasOnceLoadedReportActions);
        }
    } else if (trackedTransactionIDs !== baselineSourceIDs && !hasSameTransactionIDs) {
        let addedIDs = EMPTY_TRANSACTION_IDS;
        if (baselineSourceIDs !== undefined && trackedTransactionIDs !== undefined && trackedTransactionIDs.length > baselineSourceIDs.length) {
            // A longer list sharing nothing with a non-empty baseline replaced it, so re-baseline instead of calling it all new.
            const hasReplacedBaseline = baselineSourceIDs.length > 0 && !trackedTransactionIDs.some((transactionID) => baselineIDs.has(transactionID));
            // "Shares nothing" says nothing against an empty baseline, so the count decides: a user adds one row at a time, several at once is the report loading.
            const isHydratingFromEmpty = baselineSourceIDs.length === 0 && trackedTransactionIDs.length > 1;
            if (!hasSettledAfterInitialLoad) {
                setHasSettledAfterInitialLoad(true);
            } else if (!hasReplacedBaseline && !isHydratingFromEmpty) {
                addedIDs = trackedTransactionIDs.filter((transactionID) => !baselineIDs.has(transactionID));
            }
        } else if (diffState.addedIDs.length && trackedTransactionIDs !== undefined) {
            // A reorder or a removal says nothing about what is new, and the read below filters these against the live
            // list anyway, so the latch carries over untouched rather than restarting its window with a new identity.
            addedIDs = diffState.addedIDs;
        }
        setDiffState({reportID, sourceIDs: trackedTransactionIDs, addedIDs});
    }

    // An unloaded report has not settled by definition, so a loaded flag that only catches up after a switch cannot leave the latch set.
    if (!hasOnceLoadedReportActions && hasSettledAfterInitialLoad) {
        setHasSettledAfterInitialLoad(false);
    }

    const activeFlagKeys = pendingNewTransactions?.activeFlagKeys;
    const railTransactions = reportID && activeFlagKeys && transactions?.length ? transactions.filter(({transactionID}) => activeFlagKeys[transactionID]) : EMPTY_TRANSACTIONS;

    let diffTransactions = EMPTY_TRANSACTIONS;
    if (diffState.addedIDs.length && transactions?.length) {
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
        if (isReportVisible === false || !pendingNewTransactions) {
            return;
        }
        const railFlagKeys = pendingNewTransactions.activeFlagKeys;
        const consumedFlagKeys = newTransactions.map(({transactionID}) => railFlagKeys[transactionID]).filter(Boolean);
        const claimedKeys: string[] = [];
        for (const flagKey of [...consumedFlagKeys, ...pendingNewTransactions.expiredFlagKeys]) {
            const sweepKey = `${reportID}:${flagKey}`;
            if (scheduledSweeps.has(sweepKey)) {
                continue;
            }
            scheduledSweeps.add(sweepKey);
            claimedKeys.push(flagKey);
        }
        if (!claimedKeys.length) {
            return;
        }

        // Deliberately uncancelled: a row recycled out of the list has still had its highlight shown, and clearing the timer would leave the flag for a later visit to sweep.
        setTimeout(() => {
            // Released before deleting, so a merge that never lands stays claimable.
            for (const flagKey of claimedKeys) {
                scheduledSweeps.delete(`${reportID}:${flagKey}`);
            }
            deletePendingNewTransactionIDs(reportID, claimedKeys);
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
    }, [isReportVisible, pendingNewTransactions, newTransactions, reportID]);

    // Keyed on the latched set, so a later add with the same count opens its own window instead of inheriting this one.
    const latchedAddedIDs = diffState.addedIDs;
    useEffect(() => {
        if (isReportVisible === false || !latchedAddedIDs.length) {
            return;
        }
        const timer = setTimeout(() => {
            setDiffState((previousDiffState) => (previousDiffState.addedIDs === latchedAddedIDs ? {...previousDiffState, addedIDs: EMPTY_TRANSACTION_IDS} : previousDiffState));
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
        return () => clearTimeout(timer);
    }, [isReportVisible, latchedAddedIDs]);

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
        // Cancelled with the effect, so a frame queued for the outgoing report cannot re-latch the switch reset.
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
