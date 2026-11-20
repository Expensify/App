import type {SearchQueryString} from '@components/Search/types';

import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type QueueBulkPayReportsParams = {
    /** Serialized search query describing every report to pay, so the backend can page through all matches instead of relying on a client-side list */
    jsonQuery: SearchQueryString;

    /** ID of the bulk action record the backend updates as the payments finish */
    bulkActionID: string;

    /** Pays the reports through a bank account instead of marking them as paid when set */
    paymentType?: PaymentMethodType;

    /** The bank account picked to pay with, when it isn't the workspace bank account */
    bankAccountID?: number;
};

export default QueueBulkPayReportsParams;
