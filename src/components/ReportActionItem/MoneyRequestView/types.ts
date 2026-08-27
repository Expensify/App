import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type MoneyRequestViewProps = {
    /** The report currently being looked at */
    transactionThreadReport?: OnyxEntry<OnyxTypes.Report>;

    parentReportID?: string;

    /** Policy that the report belongs to */
    expensePolicy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether we should display the animated banner above the component */
    shouldShowAnimatedBackground: boolean;

    /** Whether we should show Money Request with disabled all fields */
    readonly?: boolean;

    /** whether this report is from review duplicates */
    isFromReviewDuplicates?: boolean;

    /** Updated transaction to show in duplicate & merge transaction flow  */
    updatedTransaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Merge transaction ID to show in merge transaction flow */
    mergeTransactionID?: string;
};

export type {MoneyRequestViewProps};
