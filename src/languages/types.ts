import type {OnyxEntry} from 'react-native-onyx';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import type {PolicyConnectionSyncStage, Unit} from '@src/types/onyx/Policy';
import type en from './en';

type AddressLineParams = {
    lineNumber: number;
};

type ZipCodeExampleFormatParams = {
    zipSampleFormat: string;
};

type LoggedInAsParams = {
    email: string;
};

type SignUpNewFaceCodeParams = {
    login: string;
};

type WelcomeEnterMagicCodeParams = {
    login: string;
};

type AlreadySignedInParams = {
    email: string;
};

type CommonSelectedParams = {
    selectedNumber: number;
};

type GoBackMessageParams = {
    provider: string;
};

type LocalTimeParams = {
    user: string;
    time: string;
};

type EditActionParams = {
    action: OnyxInputOrEntry<ReportAction>;
};

type DeleteActionParams = {
    action: OnyxInputOrEntry<ReportAction>;
};

type DeleteConfirmationParams = {
    action: OnyxInputOrEntry<ReportAction>;
};

type BeginningOfChatHistoryDomainRoomPartOneParams = {
    domainRoom: string;
};

type BeginningOfChatHistoryAdminRoomPartOneParams = {
    workspaceName: string;
};

type BeginningOfChatHistoryAnnounceRoomPartOneParams = {
    workspaceName: string;
};

type BeginningOfChatHistoryAnnounceRoomPartTwo = {
    workspaceName: string;
};

type WelcomeToRoomParams = {
    roomName: string;
};

type UsePlusButtonParams = {
    additionalText: string;
};

type ReportArchiveReasonsClosedParams = {
    displayName: string;
};

type ReportArchiveReasonsMergedParams = {
    displayName: string;
    oldDisplayName: string;
};

type ReportArchiveReasonsRemovedFromPolicyParams = {
    displayName: string;
    policyName: string;
    shouldUseYou?: boolean;
};

type ReportArchiveReasonsPolicyDeletedParams = {
    policyName: string;
};

type SettleExpensifyCardParams = {
    formattedAmount: string;
};

type RequestAmountParams = {amount: string};

type RequestedAmountMessageParams = {formattedAmount: string; comment?: string};

type SplitAmountParams = {amount: string};

type DidSplitAmountMessageParams = {formattedAmount: string; comment: string};

type UserSplitParams = {amount: string};

type PayerOwesAmountParams = {payer: string; amount: number | string; comment?: string};

type PayerOwesParams = {payer: string};

type PayerPaidAmountParams = {payer?: string; amount: number | string};

type ApprovedAmountParams = {amount: number | string};

type ManagerApprovedParams = {manager: string};

type ManagerApprovedAmountParams = {manager: string; amount: number | string};

type PayerPaidParams = {payer: string};

type PayerSettledParams = {amount: number | string};

type WaitingOnBankAccountParams = {submitterDisplayName: string};

type CanceledRequestParams = {amount: string; submitterDisplayName: string};

type AdminCanceledRequestParams = {manager: string; amount: string};

type SettledAfterAddedBankAccountParams = {submitterDisplayName: string; amount: string};

type PaidElsewhereWithAmountParams = {payer?: string; amount: string};

type PaidWithExpensifyWithAmountParams = {payer?: string; amount: string};

type ThreadRequestReportNameParams = {formattedAmount: string; comment: string};

type ThreadSentMoneyReportNameParams = {formattedAmount: string; comment: string};

type SizeExceededParams = {maxUploadSizeInMB: number};

type ResolutionConstraintsParams = {minHeightInPx: number; minWidthInPx: number; maxHeightInPx: number; maxWidthInPx: number};

type NotAllowedExtensionParams = {allowedExtensions: string[]};

type EnterMagicCodeParams = {contactMethod: string};

type TransferParams = {amount: string};

type InstantSummaryParams = {rate: string; minAmount: string};

type NotYouParams = {user: string};

type DateShouldBeBeforeParams = {dateString: string};

type DateShouldBeAfterParams = {dateString: string};

type WeSentYouMagicSignInLinkParams = {login: string; loginType: string};

type ToValidateLoginParams = {primaryLogin: string; secondaryLogin: string};

type NoLongerHaveAccessParams = {primaryLogin: string};

type OurEmailProviderParams = {login: string};

type ConfirmThatParams = {login: string};

type UntilTimeParams = {time: string};

type StepCounterParams = {step: number; total?: number; text?: string};

type UserIsAlreadyMemberParams = {login: string; name: string};

type GoToRoomParams = {roomName: string};

type WelcomeNoteParams = {workspaceName: string};

type RoomNameReservedErrorParams = {reservedName: string};

type RenamedRoomActionParams = {oldName: string; newName: string};

type RoomRenamedToParams = {newName: string};

type OOOEventSummaryFullDayParams = {summary: string; dayCount: number; date: string};

type OOOEventSummaryPartialDayParams = {summary: string; timePeriod: string; date: string};

type ParentNavigationSummaryParams = {reportName?: string; workspaceName?: string};

type SetTheRequestParams = {valueName: string; newValueToDisplay: string};

type SetTheDistanceParams = {newDistanceToDisplay: string; newAmountToDisplay: string};

type SyncStageNameParams = {stage: PolicyConnectionSyncStage};

type RemovedTheRequestParams = {valueName: string; oldValueToDisplay: string};

type UpdatedTheRequestParams = {valueName: string; newValueToDisplay: string; oldValueToDisplay: string};

type UpdatedTheDistanceParams = {newDistanceToDisplay: string; oldDistanceToDisplay: string; newAmountToDisplay: string; oldAmountToDisplay: string};

type FormattedMaxLengthParams = {formattedMaxLength: string};

type WalletProgramParams = {walletProgram: string};

type ViolationsAutoReportedRejectedExpenseParams = {rejectedBy: string; rejectReason: string};

type ViolationsCashExpenseWithNoReceiptParams = {formattedLimit?: string};

type ViolationsConversionSurchargeParams = {surcharge?: number};

type ViolationsInvoiceMarkupParams = {invoiceMarkup?: number};

type ViolationsMaxAgeParams = {maxAge: number};

type ViolationsMissingTagParams = {tagName?: string};

type ViolationsOverAutoApprovalLimitParams = {formattedLimit?: string};

type ViolationsOverCategoryLimitParams = {formattedLimit?: string};

type ViolationsOverLimitParams = {formattedLimit?: string};

type ViolationsPerDayLimitParams = {formattedLimit?: string};

type ViolationsReceiptRequiredParams = {formattedLimit?: string; category?: string};

type ViolationsRterParams = {
    brokenBankConnection: boolean;
    isAdmin: boolean;
    email?: string;
    isTransactionOlderThan7Days: boolean;
    member?: string;
};

type ViolationsTagOutOfPolicyParams = {tagName?: string};

type ViolationsTaxOutOfPolicyParams = {taxName?: string};

type PaySomeoneParams = {name?: string};

type TaskCreatedActionParams = {title: string};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationBaseValue = string | string[] | ((...args: any[]) => string) | ((...args: any[]) => PluralFormPhrase);

type TranslationBase = {[key: string]: TranslationBaseValue | TranslationBase};

/* Flat Translation Object types */
// Flattens an object and returns concatenations of all the keys of nested objects
type FlattenObject<TObject, TPrefix extends string = ''> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [TKey in keyof TObject]: TObject[TKey] extends (...args: any[]) => any
        ? `${TPrefix}${TKey & string}`
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          TObject[TKey] extends any[]
          ? `${TPrefix}${TKey & string}`
          : // eslint-disable-next-line @typescript-eslint/ban-types
            TObject[TKey] extends object
            ? FlattenObject<TObject[TKey], `${TPrefix}${TKey & string}.`>
            : `${TPrefix}${TKey & string}`;
}[keyof TObject];

type PluralFormPhrase = {
    zero: string;
    one: string;
    other: string;
    two?: string;
    few?: string;
    many?: string;
};

type TranslationPhraseRecord = Record<string, string | number | boolean | null | OnyxEntry<ReportAction> | undefined>;
type TranslationPhraseArg = number | string | undefined | TranslationPhraseRecord;
type TranslationPhraseFunction = (...args: TranslationPhraseArg[]) => string;
type PluralTranslationPhraseFunction = (count: number, record: TranslationPhraseRecord) => PluralFormPhrase;

type PhraseParameters<T> = T extends PluralTranslationPhraseFunction ? [number, TranslationPhraseRecord] : T extends TranslationPhraseFunction ? Parameters<T> : TranslationPhraseArg[];

type TranslateType<TObject, K extends keyof TObject> = TObject[K] extends PluralTranslationPhraseFunction
    ? PluralTranslationPhraseFunction
    : TObject[K] extends TranslationPhraseFunction
      ? TranslationPhraseFunction
      : string;

type CharacterLimitParams = {
    length: number;
    limit: number;
};

type PolicyNameParams = {
    policyName: string;
};

type CategoryNameParams = {
    categoryName: string;
};

type SecondaryLoginParams = {
    secondaryLogin: string;
};

type TaxAmountParams = {
    taxAmount: number;
};

type EmailAmountParams = {
    email: string;
    amount: number;
};

type UsersCountParams = {
    usersCount: number;
    finalCount: number;
};

type EmailWorkspaceParams = {
    email: string;
    workspaceName: string;
};

type WorkspaceNameParams = {
    workspaceName: string;
};

type WorkspaceOwnerNameParams = {
    workspaceOwnerName: string;
};

type YearMonthParams = {
    year: number;
    monthName: string;
};

type NextPaymentDateParams = {
    nextPaymentDate: string;
};

type CardNumberParams = {
    cardNumber: string;
};

type CardInfoParams = {
    name: string;
    expiration: string;
    currency: string;
};

type PriceRangeParams = {
    lower: string;
    upper: string;
};

type ActiveMembersParams = {
    size: number;
};

type CommitmentParams = {
    size: number;
    date: string;
};

type AmountWithCurrency = {
    amountWithCurrency: number;
};

type DateParams = {
    date: string;
};

type RequestCountParams = {
    scanningReceipts: number;
    pendingReceipts: number;
};

type EnglishTranslation = typeof en;

type TranslationPaths = FlattenObject<EnglishTranslation>;

type TranslationFlatObject = {
    [TKey in Extract<TranslationPaths, string>]: TranslateType<EnglishTranslation, any>;
};

type TermsParams = {amount: string};

type ElectronicFundsParams = {percentage: string; amount: string};

type LogSizeParams = {size: number};

type HeldRequestParams = {comment: string};

type ReimbursementRateParams = {unit: Unit};

type ConfirmHoldExpenseParams = {transactionCount: number};

type ChangeFieldParams = {oldValue?: string; newValue: string; fieldName: string};

type ChangePolicyParams = {fromPolicy: string; toPolicy: string};

type ChangeTypeParams = {oldType: string; newType: string};

type DelegateSubmitParams = {delegateUser: string; originalManager: string};

type ExportedToIntegrationParams = {label: string};

type ForwardedParams = {amount: string; currency: string};

type IntegrationsMessageParams = {
    label: string;
    result: {
        code?: number;
        messages?: string[];
        title?: string;
        link?: {
            url: string;
            text: string;
        };
    };
};

type MarkedReimbursedParams = {amount: string; currency: string};

type MarkReimbursedFromIntegrationParams = {amount: string; currency: string};

type ShareParams = {to: string};

type UnshareParams = {to: string};

type StripePaidParams = {amount: string; currency: string};

type UnapprovedParams = {amount: string; currency: string};
type RemoveMembersWarningPrompt = {
    memberName: string;
    ownerName: string;
};

export type {
    AddressLineParams,
    AdminCanceledRequestParams,
    AlreadySignedInParams,
    ApprovedAmountParams,
    BeginningOfChatHistoryAdminRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartTwo,
    BeginningOfChatHistoryDomainRoomPartOneParams,
    CanceledRequestParams,
    CharacterLimitParams,
    CommonSelectedParams,
    ConfirmHoldExpenseParams,
    ConfirmThatParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DidSplitAmountMessageParams,
    EditActionParams,
    ElectronicFundsParams,
    EnglishTranslation,
    EnterMagicCodeParams,
    FormattedMaxLengthParams,
    GoBackMessageParams,
    GoToRoomParams,
    HeldRequestParams,
    InstantSummaryParams,
    LocalTimeParams,
    LogSizeParams,
    LoggedInAsParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OurEmailProviderParams,
    PaidElsewhereWithAmountParams,
    PaidWithExpensifyWithAmountParams,
    ParentNavigationSummaryParams,
    PaySomeoneParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    PluralFormPhrase,
    PluralTranslationPhraseFunction,
    PhraseParameters,
    ReimbursementRateParams,
    RemovedTheRequestParams,
    RenamedRoomActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsPolicyDeletedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    RequestAmountParams,
    RequestCountParams,
    RequestedAmountMessageParams,
    ResolutionConstraintsParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    SetTheDistanceParams,
    SetTheRequestParams,
    SettleExpensifyCardParams,
    SettledAfterAddedBankAccountParams,
    SignUpNewFaceCodeParams,
    SizeExceededParams,
    SplitAmountParams,
    StepCounterParams,
    SyncStageNameParams,
    TaskCreatedActionParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    ToValidateLoginParams,
    TransferParams,
    TranslateType,
    TranslationBase,
    TranslationFlatObject,
    TranslationPaths,
    TranslationPhraseArg,
    TranslationPhraseFunction,
    TranslationPhraseRecord,
    UntilTimeParams,
    UpdatedTheDistanceParams,
    UpdatedTheRequestParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    ViolationsAutoReportedRejectedExpenseParams,
    ViolationsCashExpenseWithNoReceiptParams,
    ViolationsConversionSurchargeParams,
    ViolationsInvoiceMarkupParams,
    ViolationsMaxAgeParams,
    ViolationsMissingTagParams,
    ViolationsOverAutoApprovalLimitParams,
    ViolationsOverCategoryLimitParams,
    ViolationsOverLimitParams,
    ViolationsPerDayLimitParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletProgramParams,
    WeSentYouMagicSignInLinkParams,
    WelcomeEnterMagicCodeParams,
    WelcomeNoteParams,
    WelcomeToRoomParams,
    ZipCodeExampleFormatParams,

    // Newly added types
    PolicyNameParams,
    CategoryNameParams,
    TaxAmountParams,
    EmailAmountParams,
    UsersCountParams,
    EmailWorkspaceParams,
    WorkspaceNameParams,
    WorkspaceOwnerNameParams,
    YearMonthParams,
    NextPaymentDateParams,
    CardNumberParams,
    CardInfoParams,
    PriceRangeParams,
    ActiveMembersParams,
    CommitmentParams,
    AmountWithCurrency as AmountSavedParams,
    DateParams,
    TranslationBaseValue,
    SecondaryLoginParams,
    ChangeFieldParams,
    ChangePolicyParams,
    ChangeTypeParams,
    ExportedToIntegrationParams,
    DelegateSubmitParams,
    ForwardedParams,
    IntegrationsMessageParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UnshareParams,
    StripePaidParams,
    UnapprovedParams,
    RemoveMembersWarningPrompt,
};
