import type {SearchQueryString} from '@components/Search/types';

type QueueBulkApproveReportsParams = {
    /** Serialized search query describing every report to approve, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;
};

export default QueueBulkApproveReportsParams;
