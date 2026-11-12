import type {SearchQueryString} from '@components/Search/types';

type QueueBulkChangeReportPolicyParams = {
    /** Serialized search query describing every report to move, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** The workspace to move the reports to */
    policyID: string;

    /** ID of the bulk action record the backend updates as the moves finish */
    bulkActionID: string;
};

export default QueueBulkChangeReportPolicyParams;
