import type {SearchQueryString} from '@components/Search/types';

import type CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';

type QueueBulkMarkAsExportedParams = {
    /** Serialized search query describing every report to mark as exported, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** The accounting connection to scope the bulk action to, since the button is per-integration and must never mix connections */
    connectionName: ConnectionName;

    /** Set only when connectionName is QBO and the connection is its Intuit Enterprise Suite variant, since that shares connectionName with regular QBO and the backend otherwise can't tell them apart */
    qboIntegrationAlias?: typeof CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE;
};

export default QueueBulkMarkAsExportedParams;
