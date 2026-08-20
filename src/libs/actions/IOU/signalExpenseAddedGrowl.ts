import {mergeExpenseAddedGrowlTransactionIDs} from '@userActions/Transaction';

import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

/**
 * Signals the "Expense added" growl for a newly-created transaction.
 */
function signalExpenseAddedGrowl(transactionID: string | undefined, dataType: SearchDataTypes) {
    if (!transactionID) {
        return;
    }
    mergeExpenseAddedGrowlTransactionIDs({[transactionID]: dataType});
}

export default signalExpenseAddedGrowl;
