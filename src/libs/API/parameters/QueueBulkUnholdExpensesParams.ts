import type {SearchQueryString} from '@components/Search/types';

type QueueBulkUnholdExpensesParams = {
    /** Serialized search query describing every expense to unhold, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** ID of the bulk action record the backend updates as each expense comes off hold */
    bulkActionID: string;

    /** Comma-separated expenses the user deselected after "Select all" */
    excludedTransactionIDList: string;
};

export default QueueBulkUnholdExpensesParams;
