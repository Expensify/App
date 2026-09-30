import type {SearchQueryString} from '@components/Search/types';

type QueueBulkSubmitReportsParams = {
    /** Serialized search query describing every report to submit, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** ID of the bulk action record the backend updates as the submissions finish */
    bulkActionID: string;
};

export default QueueBulkSubmitReportsParams;
