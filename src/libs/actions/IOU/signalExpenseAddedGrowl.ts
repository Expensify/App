import {mergeExpenseAddedGrowlTransactionIDs} from '@userActions/Transaction';

import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

/**
 * Queues the "Expense added" growl (toast) for a newly-created transaction. Signal whenever the flow leaves the
 * user somewhere other than the expense's report - the growl suppresses itself if they end up on that report.
 */
function signalExpenseAddedGrowl(transactionID: string | undefined, dataType: SearchDataTypes) {
    if (!transactionID) {
        return;
    }
    mergeExpenseAddedGrowlTransactionIDs({[transactionID]: dataType});
}

export default signalExpenseAddedGrowl;
