import {deletePendingNewTransactionIDs} from '@libs/actions/IOU/PendingNewTransactions';

import CONST from '@src/CONST';
import type {PendingNewTransactions} from '@src/selectors/ReportMetaData';
import type {Transaction} from '@src/types/onyx';
import type {PendingNewTransactionFlag} from '@src/types/onyx/ReportMetadata';

import {useEffect, useRef, useState} from 'react';

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_TRANSACTION_IDS: string[] = [];

type DiffState = {
    /** Which report the baseline belongs to; a switch under the same mounted consumer resets the latch as a fresh mount would. */
    reportID: string | undefined;
    /** Baseline transaction-ID sequence the next growth is diffed against. */
    sourceIDs: string[] | undefined;
    /** IDs of diff-detected adds currently eligible to highlight. */
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
    const [highlightedDiffTransactionIDs, setHighlightedDiffTransactionIDs] = useState<Set<string>>(() => new Set());
    const [diffState, setDiffState] = useState<DiffState>(() => ({reportID, sourceIDs: undefined, addedIDs: EMPTY_TRANSACTION_IDS}));
    const trackedTransactionIDs = hasOnceLoadedReportActions && transactions ? transactions.map(({transactionID}) => transactionID) : undefined;
    const baselineSourceIDs = diffState.sourceIDs;
    const isReportSwitch = reportID !== diffState.reportID;
    const hasSameTransactionIDs =
        trackedTransactionIDs !== undefined &&
        baselineSourceIDs !== undefined &&
        trackedTransactionIDs.length === baselineSourceIDs.length &&
        trackedTransactionIDs.every((transactionID, index) => transactionID === baselineSourceIDs.at(index));
    const isBaselineAdvance = trackedTransactionIDs !== baselineSourceIDs && !hasSameTransactionIDs;
    if (isReportSwitch || isBaselineAdvance) {
        let addedIDs = EMPTY_TRANSACTION_IDS;
        if (!isReportSwitch && baselineSourceIDs !== undefined && trackedTransactionIDs !== undefined && trackedTransactionIDs.length > baselineSourceIDs.length) {
            if (hasSettledAfterInitialLoad) {
                const baselineSet = new Set(baselineSourceIDs);
                addedIDs = trackedTransactionIDs.filter((transactionID) => !baselineSet.has(transactionID));
            } else {
                setHasSettledAfterInitialLoad(true);
            }
        }
        setDiffState({reportID, sourceIDs: trackedTransactionIDs, addedIDs});
        if (isReportSwitch) {
            if (hasSettledAfterInitialLoad !== !!hasOnceLoadedReportActions) {
                setHasSettledAfterInitialLoad(!!hasOnceLoadedReportActions);
            }
            if (highlightedDiffTransactionIDs.size) {
                setHighlightedDiffTransactionIDs(new Set());
            }
        } else if (highlightedDiffTransactionIDs.size) {
            // A tx removed from the report leaves the suppression set, so a later re-add can highlight again.
            const presentIDs = new Set(trackedTransactionIDs);
            const prunedIDs = new Set([...highlightedDiffTransactionIDs].filter((transactionID) => presentIDs.has(transactionID)));
            if (prunedIDs.size !== highlightedDiffTransactionIDs.size) {
                setHighlightedDiffTransactionIDs(prunedIDs);
            }
        }
    }

    const activeFlags = pendingNewTransactions?.activeFlags;
    const railTransactions = reportID && activeFlags && transactions?.length ? transactions.filter(({transactionID}) => activeFlags[transactionID]) : EMPTY_TRANSACTIONS;

    let diffTransactions = EMPTY_TRANSACTIONS;
    if (diffState.addedIDs.length && transactions?.length) {
        const eligibleAddedIDs = new Set(diffState.addedIDs.filter((transactionID) => !highlightedDiffTransactionIDs.has(transactionID)));
        diffTransactions = eligibleAddedIDs.size ? transactions.filter(({transactionID}) => eligibleAddedIDs.has(transactionID)) : EMPTY_TRANSACTIONS;
    }

    let newTransactions = railTransactions;
    if (!railTransactions.length) {
        newTransactions = diffTransactions.length ? diffTransactions : EMPTY_TRANSACTIONS;
    } else {
        const extraDiff = diffTransactions.filter(({transactionID}) => !activeFlags?.[transactionID]);
        newTransactions = extraDiff.length ? [...railTransactions, ...extraDiff] : railTransactions;
    }

    useEffect(() => {
        if (isReportVisible === false || !pendingNewTransactions) {
            return;
        }
        const railFlags = pendingNewTransactions.activeFlags;
        const consumedFlags = newTransactions
            .filter(({transactionID}) => railFlags[transactionID])
            .map(({transactionID}): [string, PendingNewTransactionFlag] => [transactionID, railFlags[transactionID]]);
        const claimedKeys: string[] = [];
        const flagsToClear: Record<string, PendingNewTransactionFlag> = {};
        for (const [transactionID, flaggedAt] of [...consumedFlags, ...Object.entries(pendingNewTransactions.expiredFlags)]) {
            const flagKey = `${reportID}:${transactionID}:${String(flaggedAt)}`;
            if (scheduledSweeps.current.has(flagKey)) {
                continue;
            }
            scheduledSweeps.current.add(flagKey);
            claimedKeys.push(flagKey);
            flagsToClear[transactionID] = flaggedAt;
        }
        if (!claimedKeys.length) {
            return;
        }

        setTimeout(() => {
            for (const flagKey of claimedKeys) {
                scheduledSweeps.current.delete(flagKey);
            }
            deletePendingNewTransactionIDs(reportID, flagsToClear);
        }, CONST.PENDING_TRANSACTION_DELETION_DELAY);
    }, [isReportVisible, pendingNewTransactions, newTransactions, reportID]);

    useEffect(() => {
        if (isReportVisible === false) {
            return;
        }
        const diffIDsToExpire = diffState.addedIDs.filter((transactionID) => !highlightedDiffTransactionIDs.has(transactionID));
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
