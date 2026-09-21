/**
 * The report list's selection gestures, so a click writes the selection and moves the range session together.
 * Splitting them is how the two drift: a selection the session never saw is one a later shift+click cannot narrow.
 */
import useShiftRangeSelection from '@hooks/useShiftRangeSelection';

import {isSelectableReportTransaction} from '@libs/MoneyRequestReportUtils';
import {applyShiftRangeBatchToKeySet} from '@libs/shiftRangeSelection';

import type * as OnyxTypes from '@src/types/onyx';

import {useEffect, useRef} from 'react';

type ReportTransactionShiftRangeParams = {
    /** Dropping the session with it, since the list is reused for the next report and a transaction can be on both */
    reportID: string | undefined;

    /** In the order they render, which is the order a range spans */
    transactions: OnyxTypes.Transaction[];

    selectedTransactionIDs: string[];

    setSelectedTransactions: (transactionIDs: string[]) => void;

    /** Clearing goes through its own action rather than an empty write, so the hook takes it to own both branches */
    clearSelectedTransactions: (shouldClearIDs: true) => void;
};

type ReportTransactionShiftRange = {
    /** Extends a range when the click carried Shift, and toggles the one row otherwise */
    toggleTransaction: (transactionID: string, shiftKey?: boolean) => void;

    /** Toggles a whole group, and records it as the block the next shift+click may narrow */
    toggleGroup: (groupTransactionIDs: string[]) => void;

    /** Select All, and the clear that a second press means */
    toggleAll: (selectableTransactionIDs: string[]) => void;
};

function useReportTransactionShiftRange({
    reportID,
    transactions,
    selectedTransactionIDs,
    setSelectedTransactions,
    clearSelectedTransactions,
}: ReportTransactionShiftRangeParams): ReportTransactionShiftRange {
    // The engine asks this per row while resolving an anchor, so the lookup has to be constant time.
    const selectedTransactionIDsSet = new Set(selectedTransactionIDs);
    const transactionsByID = new Map(transactions.map((transaction) => [transaction.transactionID, transaction]));

    // The list this session last wrote, which is how a write from anywhere else is told apart from its own.
    const lastWrittenSelectionRef = useRef<string[] | null>(null);
    const writeSelection = (transactionIDs: string[]) => {
        lastWrittenSelectionRef.current = transactionIDs;
        setSelectedTransactions(transactionIDs);
    };

    const rangeApi = useShiftRangeSelection<OnyxTypes.Transaction>({
        items: transactions,
        getItemKey: (transaction) => transaction.transactionID ?? null,
        isItemSelected: (transaction) => selectedTransactionIDsSet.has(transaction.transactionID),
        // The rows the checkbox disables, so a range cannot check what a click cannot.
        isDisabledItem: (transaction) => !isSelectableReportTransaction(transaction),
        onApplyRange: (batch) => writeSelection(applyShiftRangeBatchToKeySet(batch, selectedTransactionIDs, (transaction) => transaction.transactionID)),
    });

    useEffect(() => {
        rangeApi.clearAnchor();
    }, [reportID, rangeApi]);

    // A selection the session did not write is one it cannot narrow, since the rows it painted are no longer what the list shows.
    const endSessionIfSelectionCameFromElsewhere = () => {
        if (lastWrittenSelectionRef.current === selectedTransactionIDs) {
            return;
        }
        lastWrittenSelectionRef.current = selectedTransactionIDs;
        rangeApi.clearAnchor();
    };

    const toggleTransaction = (transactionID: string, shiftKey?: boolean) => {
        endSessionIfSelectionCameFromElsewhere();
        const item = transactionsByID.get(transactionID);
        if (item && rangeApi.applyShiftClick(item, shiftKey)) {
            return;
        }
        writeSelection(selectedTransactionIDsSet.has(transactionID) ? selectedTransactionIDs.filter((id) => id !== transactionID) : [...selectedTransactionIDs, transactionID]);
        if (item) {
            rangeApi.notifyAnchor(item);
        }
    };

    const toggleGroup = (groupTransactionIDs: string[]) => {
        endSessionIfSelectionCameFromElsewhere();
        // A group with no row to act on writes nothing and seeds nothing, so the session it would replace is still the truth.
        if (groupTransactionIDs.length === 0) {
            return;
        }
        const groupTransactionIDSet = new Set(groupTransactionIDs);
        const anySelected = groupTransactionIDs.some((id) => selectedTransactionIDsSet.has(id));
        writeSelection(anySelected ? selectedTransactionIDs.filter((id) => !groupTransactionIDSet.has(id)) : [...selectedTransactionIDs, ...groupTransactionIDs]);
        if (anySelected) {
            // Deselecting paints no block, so reset instead of leaving a stale span to collapse.
            rangeApi.clearAnchor();
            return;
        }
        // Just this block: seeding the whole selection would span unrelated rows and deselect them.
        rangeApi.seedRangeFromSelection(groupTransactionIDs);
    };

    const toggleAll = (selectableTransactionIDs: string[]) => {
        endSessionIfSelectionCameFromElsewhere();
        if (selectedTransactionIDs.length !== 0) {
            clearSelectedTransactions(true);
            lastWrittenSelectionRef.current = null;
            rangeApi.clearAnchor();
            return;
        }
        writeSelection(selectableTransactionIDs);
        // A full-list block, so the next shift+click collapses the selection onto the span it lands in.
        rangeApi.seedFullRange();
    };

    return {toggleTransaction, toggleGroup, toggleAll};
}

export default useReportTransactionShiftRange;
