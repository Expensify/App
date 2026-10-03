import type {SearchQueryString} from '@components/Search/types';

type QueueBulkHoldExpensesParams = {
    /** Serialized search query describing every expense to hold, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** Why the expenses are being held */
    comment: string;

    /** ID of the bulk action record the backend updates as the holds finish */
    bulkActionID: string;

    /** Comma-separated expenses the user deselected after "Select all" */
    excludedTransactionIDList: string;
};

export default QueueBulkHoldExpensesParams;
