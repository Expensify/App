import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import type BasePolicyParams from '@userActions/IOU/types/BasePolicyParams';

import type {Report, Rule, Transaction} from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type ResolveReceiptFile = (source: string, filename: string) => Promise<FileObject | undefined>;

/** The error stores nothing to resend, so the retry is rebuilt from these values. */
type ReceiptRetryContext = {
    receiptError: ReceiptError;

    transaction: OnyxEntry<Transaction>;

    iouReport: OnyxEntry<Report>;

    iouActionID: string | undefined;

    transactionThreadReportID: string | undefined;

    policyParams: BasePolicyParams;

    isVendorMatchingBetaEnabled: boolean | undefined;

    /** Used by `shouldCreateNewMoneyRequestReport`, so an empty collection can make the retry create a second report. */
    rules: OnyxCollection<Rule>;

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
