import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import type BasePolicyParams from '@userActions/IOU/types/BasePolicyParams';

import type {Beta, Report, Transaction} from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import type {OnyxEntry} from 'react-native-onyx';

/** Rebuilds the receipt file behind a failed upload. Resolves undefined when the file is no longer on the device. */
type ResolveReceiptFile = (source: string, filename: string) => Promise<FileObject | undefined>;

/** What a retry needs that a library cannot read for itself. Nothing is persisted on the error, so the retry is rebuilt from what the failure left in Onyx. */
type ReceiptRetryContext = {
    receiptError: ReceiptError;

    transaction: OnyxEntry<Transaction>;

    iouReport: OnyxEntry<Report>;

    policyParams: BasePolicyParams;

    betas: OnyxEntry<Beta[]>;

    conciergeReportID: string | undefined;

    isSelfTourViewed: boolean;

    isASAPSubmitBetaEnabled: boolean;

    isTrackIntentUser: boolean | undefined;

    delegateAccountID: number | undefined;

    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];

    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];
};

type RetryOutcome = 'dispatched' | 'fileMissing' | 'payloadIncomplete' | 'unsupportedAction' | 'dispatchFailed';

export type {ReceiptRetryContext, ResolveReceiptFile, RetryOutcome};
