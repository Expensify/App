import type {SearchQueryString} from '@components/Search/types';

type QueueBulkPayReportsParams = {
    /** Serialized search query describing every report to pay, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;
};

export default QueueBulkPayReportsParams;
