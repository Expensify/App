import type {SearchQueryString} from '@components/Search/types';

import type {ConnectionName} from '@src/types/onyx/Policy';

type QueueBulkMarkAsExportedParams = {
    /** Serialized search query describing every report to mark as exported, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** The accounting connection to scope the bulk action to, since the button is per-integration and must never mix connections */
    connectionName: ConnectionName;
};

export default QueueBulkMarkAsExportedParams;
