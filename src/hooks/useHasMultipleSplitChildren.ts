import {getChildTransactions} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * Counts split children the same way `initSplitExpense` does (unreported children included), so the split indicator
 * is shown only when the split flow will open the existing splits instead of starting a new split.
 */
function selectHasMultipleSplitChildren(transactions: OnyxCollection<Transaction>, originalTransactionID: string | undefined): boolean {
    if (!originalTransactionID) {
        return false;
    }
    return getChildTransactions(transactions, originalTransactionID).length > 1;
}

/**
 * Returns whether the split that `originalTransactionID` belongs to still has more than one child.
 * The selector keeps the consumer from re-rendering unless the boolean result changes.
 */
function useHasMultipleSplitChildren(originalTransactionID: string | undefined): boolean {
    const hasMultipleSelector = (transactions: OnyxCollection<Transaction>) => selectHasMultipleSplitChildren(transactions, originalTransactionID);
    const [hasMultiple] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: hasMultipleSelector,
    });

    return !!hasMultiple;
}

export default useHasMultipleSplitChildren;
