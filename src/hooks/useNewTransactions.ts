import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import CONST from '@src/CONST';
import type {PendingNewTransactions} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';

import {useEffect, useRef, useState} from 'react';

const EMPTY_TRANSACTIONS: Transaction[] = [];

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
    const scheduledForDeletionIDs = useRef<Set<string>>(new Set());
    const [highlightedDiffTransactionIDs, setHighlightedDiffTransactionIDs] = useState<Set<string>>(() => new Set());
    const [diffState, setDiffState] = useState<{source: Transaction[] | undefined; added: Transaction[]}>({source: undefined, added: EMPTY_TRANSACTIONS});
    const trackedTransactions = hasOnceLoadedReportActions ? transactions : undefined;
    const baselineSource = diffState.source;
    const hasSameTransactionIDs =
        trackedTransactions !== undefined &&
        baselineSource !== undefined &&
        trackedTransactions.length === baselineSource.length &&
        trackedTransactions.every((transaction, index) => transaction.transactionID === baselineSource.at(index)?.transactionID);
    if (trackedTransactions !== baselineSource && !hasSameTransactionIDs) {
        const prevSource = baselineSource;
        let added = EMPTY_TRANSACTIONS;
        if (prevSource !== undefined && trackedTransactions !== undefined && trackedTransactions.length > prevSource.length) {
            if (hasSettledAfterInitialLoad) {
                added = trackedTransactions.filter((transaction) => !prevSource.some((prevTransaction) => prevTransaction.transactionID === transaction.transactionID));
            } else {
                setHasSettledAfterInitialLoad(true);
            }
        }
        setDiffState({source: trackedTransactions, added});
    }

    const activePendingTransactionIDs = pendingNewTransactions ? Object.keys(pendingNewTransactions.activeIDs) : [];
    const railSet = new Set(activePendingTransactionIDs);
    const railTransactions =
        reportID && activePendingTransactionIDs.length && transactions?.length ? transactions.filter(({transactionID}) => railSet.has(transactionID)) : EMPTY_TRANSACTIONS;

    const diffTransactions = highlightedDiffTransactionIDs.size ? diffState.added.filter(({transactionID}) => !highlightedDiffTransactionIDs.has(transactionID)) : diffState.added;

    let newTransactions = railTransactions;
    if (!railTransactions.length) {
        newTransactions = diffTransactions.length ? diffTransactions : EMPTY_TRANSACTIONS;
    } else {
        const extraDiff = diffTransactions.filter(({transactionID}) => !railSet.has(transactionID));
        newTransactions = extraDiff.length ? [...railTransactions, ...extraDiff] : railTransactions;
    }

    useEffect(() => {
        if (isReportVisible === false || !pendingNewTransactions) {
            return;
        }
        const {activeIDs, expiredIDs} = pendingNewTransactions;
        const consumedIDs = newTransactions.filter(({transactionID}) => activeIDs[transactionID]).map(({transactionID}) => transactionID);
        const idsToDelete = [...consumedIDs, ...expiredIDs].filter((transactionID) => !scheduledForDeletionIDs.current.has(transactionID));
        if (!idsToDelete.length) {
            return;
        }
        for (const transactionID of idsToDelete) {
            scheduledForDeletionIDs.current.add(transactionID);
        }

        setTimeout(() => {
            deletePendingNewTransactionIDs(reportID, idsToDelete);
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
    }, [isReportVisible, pendingNewTransactions, newTransactions, reportID]);

    useEffect(() => {
        if (isReportVisible === false) {
            return;
        }
        const diffIDsToExpire = diffState.added.filter(({transactionID}) => !highlightedDiffTransactionIDs.has(transactionID)).map(({transactionID}) => transactionID);
        if (!diffIDsToExpire.length) {
            return;
        }
        const timer = setTimeout(() => {
            setHighlightedDiffTransactionIDs((prev) => {
                const next = new Set(prev);
                for (const transactionID of diffIDsToExpire) {
                    next.add(transactionID);
                }
                return next;
            });
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
        return () => clearTimeout(timer);
    }, [isReportVisible, diffState, highlightedDiffTransactionIDs]);

    useEffect(() => {
        if (!hasOnceLoadedReportActions || hasSettledAfterInitialLoad) {
            return;
        }
        new Promise<void>((resolve) => {
            resolve();
        }).then(() => {
            requestAnimationFrame(() => {
                setHasSettledAfterInitialLoad(true);
            });
        });
    }, [hasOnceLoadedReportActions, hasSettledAfterInitialLoad]);

    return newTransactions;
}

export default useNewTransactions;
