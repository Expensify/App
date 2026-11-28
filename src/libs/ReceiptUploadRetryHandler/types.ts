import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import type BasePolicyParams from '@userActions/IOU/types/BasePolicyParams';

import type {IntroSelected, Report, Rule, Transaction, TransactionViolations} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
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

    isSelfTourViewed: boolean;

    isASAPSubmitBetaEnabled: boolean;

    isTrackIntentUser: boolean | undefined;

    delegateAccountID: number | undefined;

    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];

    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];

    transactionReport: OnyxEntry<Report>;

    transactionThreadReport: OnyxEntry<Report>;

    transactionViolations: OnyxEntry<TransactionViolations>;

    currentUserPersonalDetails: CurrentUserPersonalDetails;

    introSelected: OnyxEntry<IntroSelected>;
};

/** The retry context plus the data that is only read when the retry is dispatched, not while rendering. */
type ReceiptRetryDispatchContext = ReceiptRetryContext & {
    personalDetailsByLogins: PersonalDetailsByLogin;

    /** Read when Try again is pressed, so the receipt view does not subscribe to the Concierge chat on every expense row. */
    conciergeChat: OnyxEntry<Report>;
};

type RetryOutcome = 'dispatched' | 'fileMissing' | 'payloadIncomplete' | 'unsupportedAction' | 'dispatchFailed';

export type {ReceiptRetryContext, ReceiptRetryDispatchContext, ResolveReceiptFile, RetryOutcome};
