import type {SearchQueryString} from '@components/Search/types';

type QueueBulkRejectExpensesParams = {
    /** Serialized search query describing every expense to reject, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** Why the expenses are being rejected */
    comment: string;

    /** ID of the bulk action record the backend updates as the rejections finish */
    bulkActionID: string;

    /** Comma-separated expenses the user deselected after "Select all" */
    excludedTransactionIDList: string;
};

export default QueueBulkRejectExpensesParams;
