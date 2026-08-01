import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import CONST from '@src/CONST';
import type {PendingNewTransactions} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';

import {useEffect, useRef, useState} from 'react';

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_TRANSACTION_IDS: string[] = [];

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
    const scheduledSweeps = useRef<Set<string>>(new Set());
    const [diffState, setDiffState] = useState<DiffState>(() => ({reportID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS}));
    const trackedTransactionIDs = hasOnceLoadedReportActions && transactions ? transactions.map(({transactionID}) => transactionID) : undefined;
    const baselineSourceIDs = diffState.sourceIDs;
    const isReportSwitch = reportID !== diffState.reportID;
    const hasSameTransactionIDs =
        trackedTransactionIDs !== undefined &&
        baselineSourceIDs !== undefined &&
        trackedTransactionIDs.length === baselineSourceIDs.length &&
        trackedTransactionIDs.every((transactionID, index) => transactionID === baselineSourceIDs.at(index));
    if (isReportSwitch) {
        // The list in hand can still be the outgoing report's, so let the incoming report's own list set the baseline.
        setDiffState({reportID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS});
        if (hasSettledAfterInitialLoad !== !!hasOnceLoadedReportActions) {
            setHasSettledAfterInitialLoad(!!hasOnceLoadedReportActions);
        }
    } else if (trackedTransactionIDs !== baselineSourceIDs && !hasSameTransactionIDs) {
        let addedIDs = EMPTY_TRANSACTION_IDS;
        if (baselineSourceIDs !== undefined && trackedTransactionIDs !== undefined && trackedTransactionIDs.length > baselineSourceIDs.length) {
            const baselineSet = new Set(baselineSourceIDs);
            // A longer list sharing nothing with a non-empty baseline replaced it, so re-baseline instead of calling it all new.
            const hasReplacedBaseline = baselineSet.size > 0 && !trackedTransactionIDs.some((transactionID) => baselineSet.has(transactionID));
            if (!hasSettledAfterInitialLoad) {
                setHasSettledAfterInitialLoad(true);
            } else if (!hasReplacedBaseline) {
                addedIDs = trackedTransactionIDs.filter((transactionID) => !baselineSet.has(transactionID));
            }
        }
        setDiffState({reportID, sourceIDs: trackedTransactionIDs, addedIDs});
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
            if (scheduledSweeps.current.has(sweepKey)) {
                continue;
            }
            scheduledSweeps.current.add(sweepKey);
            claimedKeys.push(flagKey);
        }
        if (!claimedKeys.length) {
            return;
        }

        setTimeout(() => {
            deletePendingNewTransactionIDs(reportID, claimedKeys);
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
    }, [isReportVisible, pendingNewTransactions, newTransactions, reportID]);

    // Stop offering diff-detected adds once their window elapses, so a row remount can't replay one.
    const addedDiffCount = diffState.addedIDs.length;
    useEffect(() => {
        if (isReportVisible === false || !addedDiffCount) {
            return;
        }
        const timer = setTimeout(() => {
            setDiffState((previousDiffState) => (previousDiffState.addedIDs.length ? {...previousDiffState, addedIDs: EMPTY_TRANSACTION_IDS} : previousDiffState));
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
        return () => clearTimeout(timer);
    }, [isReportVisible, addedDiffCount]);

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
