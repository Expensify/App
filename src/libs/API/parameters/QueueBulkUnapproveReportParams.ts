import type {SearchQueryString} from '@components/Search/types';

type QueueBulkUnapproveReportParams = {
    /** Serialized search query describing every report to unapprove, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** ID of the bulk action record the backend updates as each report is unapproved */
    bulkActionID: string;
};

export default QueueBulkUnapproveReportParams;
