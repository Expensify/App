import {ReportAction} from '../types/onyx';
import en from './en';

type AddressLineParams = {
    lineNumber: number;
};

type CharacterLimitParams = {
    limit: number;
};

type MaxParticipantsReachedParams = {
    count: number;
};

type ZipCodeExampleFormatParams = {
    zipSampleFormat: string;
};

type LoggedInAsParams = {
    email: string;
};

type NewFaceEnterMagicCodeParams = {
    login: string;
};

type WelcomeEnterMagicCodeParams = {
    login: string;
};

type AlreadySignedInParams = {
    email: string;
};

type GoBackMessageParams = {
    provider: string;
};

type LocalTimeParams = {
    user: string;
    time: string;
};

type EditActionParams = {
    action: ReportAction | null;
};

type DeleteActionParams = {
    action: ReportAction | null;
};

type DeleteConfirmationParams = {
    action: ReportAction | null;
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
};

type ReportArchiveReasonsPolicyDeletedParams = {
    policyName: string;
};

type RequestCountParams = {
    count: number;
    scanningReceipts: number;
};

type SettleExpensifyCardParams = {
    formattedAmount: string;
};

type RequestAmountParams = {amount: number};

type RequestedAmountMessageParams = {formattedAmount: string; comment: string};

type SplitAmountParams = {amount: number};

type DidSplitAmountMessageParams = {formattedAmount: string; comment: string};

type AmountEachParams = {amount: number};

type PayerOwesAmountParams = {payer: string; amount: number};

type PayerOwesParams = {payer: string};

type PayerPaidAmountParams = {payer: string; amount: number};

type ManagerApprovedParams = {manager: string};

type PayerPaidParams = {payer: string};

type PayerSettledParams = {amount: number};

type WaitingOnBankAccountParams = {submitterDisplayName: string};

type SettledAfterAddedBankAccountParams = {submitterDisplayName: string; amount: string};

type PaidElsewhereWithAmountParams = {payer: string; amount: string};

type PaidWithExpensifyWithAmountParams = {payer: string; amount: string};

type ThreadRequestReportNameParams = {formattedAmount: string; comment: string};

type ThreadSentMoneyReportNameParams = {formattedAmount: string; comment: string};

type SizeExceededParams = {maxUploadSizeInMB: number};

type ResolutionConstraintsParams = {minHeightInPx: number; minWidthInPx: number; maxHeightInPx: number; maxWidthInPx: number};

type NotAllowedExtensionParams = {allowedExtensions: string[]};

type EnterMagicCodeParams = {contactMethod: string};

type TransferParams = {amount: string};

type InstantSummaryParams = {rate: number; minAmount: number};

type NotYouParams = {user: string};

type DateShouldBeBeforeParams = {dateString: string};

type DateShouldBeAfterParams = {dateString: string};

type IncorrectZipFormatParams = {zipFormat?: string};

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

type ParentNavigationSummaryParams = {rootReportName: string; workspaceName: string};

type SetTheRequestParams = {valueName: string; newValueToDisplay: string};

type SetTheDistanceParams = {newDistanceToDisplay: string; newAmountToDisplay: string};

type RemovedTheRequestParams = {valueName: string; oldValueToDisplay: string};

type UpdatedTheRequestParams = {valueName: string; newValueToDisplay: string; oldValueToDisplay: string};

type UpdatedTheDistanceParams = {newDistanceToDisplay: string; oldDistanceToDisplay: string; newAmountToDisplay: string; oldAmountToDisplay: string};

type FormattedMaxLengthParams = {formattedMaxLength: string};

type TagSelectionParams = {tagName: string};

type WalletProgramParams = {walletProgram: string};

/* Translation Object types */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationBaseValue = string | string[] | ((...args: any[]) => string);

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

// Retrieves a type for a given key path (calculated from the type above)
type TranslateType<TObject, TPath extends string> = TPath extends keyof TObject
    ? TObject[TPath]
    : TPath extends `${infer TKey}.${infer TRest}`
    ? TKey extends keyof TObject
        ? TranslateType<TObject[TKey], TRest>
        : never
    : never;

type EnglishTranslation = typeof en;

type TranslationPaths = FlattenObject<EnglishTranslation>;

type TranslationFlatObject = {
    [TKey in TranslationPaths]: TranslateType<EnglishTranslation, TKey>;
};

export type {
    TranslationBase,
    EnglishTranslation,
    TranslationFlatObject,
    AddressLineParams,
    CharacterLimitParams,
    MaxParticipantsReachedParams,
    ZipCodeExampleFormatParams,
    LoggedInAsParams,
    NewFaceEnterMagicCodeParams,
    WelcomeEnterMagicCodeParams,
    AlreadySignedInParams,
    GoBackMessageParams,
    LocalTimeParams,
    EditActionParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    BeginningOfChatHistoryDomainRoomPartOneParams,
    BeginningOfChatHistoryAdminRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartTwo,
    WelcomeToRoomParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ReportArchiveReasonsPolicyDeletedParams,
    RequestCountParams,
    SettleExpensifyCardParams,
    RequestAmountParams,
    RequestedAmountMessageParams,
    SplitAmountParams,
    DidSplitAmountMessageParams,
    AmountEachParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    ManagerApprovedParams,
    PayerSettledParams,
    WaitingOnBankAccountParams,
    SettledAfterAddedBankAccountParams,
    PaidElsewhereWithAmountParams,
    PaidWithExpensifyWithAmountParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    SizeExceededParams,
    ResolutionConstraintsParams,
    NotAllowedExtensionParams,
    EnterMagicCodeParams,
    TransferParams,
    InstantSummaryParams,
    NotYouParams,
    DateShouldBeBeforeParams,
    DateShouldBeAfterParams,
    IncorrectZipFormatParams,
    WeSentYouMagicSignInLinkParams,
    ToValidateLoginParams,
    NoLongerHaveAccessParams,
    OurEmailProviderParams,
    ConfirmThatParams,
    UntilTimeParams,
    StepCounterParams,
    UserIsAlreadyMemberParams,
    GoToRoomParams,
    WelcomeNoteParams,
    RoomNameReservedErrorParams,
    RenamedRoomActionParams,
    RoomRenamedToParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    ParentNavigationSummaryParams,
    SetTheRequestParams,
    UpdatedTheRequestParams,
    RemovedTheRequestParams,
    FormattedMaxLengthParams,
    TagSelectionParams,
    SetTheDistanceParams,
    UpdatedTheDistanceParams,
    WalletProgramParams,
};
