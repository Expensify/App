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

    /** Outlives the discarded request, so it is the source of truth for the payload. */
    transaction: OnyxEntry<Transaction>;

    /** The money request report the failed expense sits on. Passing it back keeps the retry on the same report. */
    iouReport: OnyxEntry<Report>;

    policyParams: BasePolicyParams;

    betas: OnyxEntry<Beta[]>;

    /** Concierge's chat is looked up from this, for the onboarding side effects `requestMoney` performs. */
    conciergeReportID: string | undefined;

    isSelfTourViewed: boolean;

    isASAPSubmitBetaEnabled: boolean;

    isTrackIntentUser: boolean | undefined;

    delegateAccountID: number | undefined;

    /** From React context, so it cannot be read outside a component. */
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];

    /** From React context, so it cannot be read outside a component. */
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];
};

/** Only `dispatched` means a request went out. */
type RetryOutcome = 'dispatched' | 'fileMissing' | 'payloadIncomplete' | 'unsupportedAction' | 'dispatchFailed';

export type {ReceiptRetryContext, ResolveReceiptFile, RetryOutcome};
