import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import type {DelegateRole} from '@src/types/onyx/Account';
import type {AllConnectionName, ConnectionName, PolicyConnectionSyncStage, SageIntacctMappingName, Unit} from '@src/types/onyx/Policy';
import type {ViolationDataType} from '@src/types/onyx/TransactionViolation';

type AddressLineParams = {
    lineNumber: number;
};

type CharacterLimitParams = {
    limit: number | string;
};

type AssigneeParams = {
    assignee: string;
};

type CharacterLengthLimitParams = {
    limit: number;
    length: number;
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

type ReportPolicyNameParams = {
    policyName: string;
};

type ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams = {
    policyName: string;
};

type RequestCountParams = {
    scanningReceipts: number;
    pendingReceipts: number;
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

type CompanyCardFeedNameParams = {feedName: string};

type PayerPaidAmountParams = {payer?: string; amount: number | string};

type ApprovedAmountParams = {amount: number | string};

type ForwardedAmountParams = {amount: number | string};

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

type SetTheDistanceMerchantParams = {translatedChangedField: string; newMerchant: string; newAmountToDisplay: string};

type RemovedTheRequestParams = {valueName: string; oldValueToDisplay: string};

type UpdatedTheRequestParams = {valueName: string; newValueToDisplay: string; oldValueToDisplay: string};

type UpdatedTheDistanceMerchantParams = {translatedChangedField: string; newMerchant: string; oldMerchant: string; newAmountToDisplay: string; oldAmountToDisplay: string};

type FormattedMaxLengthParams = {formattedMaxLength: string};

type WalletProgramParams = {walletProgram: string};

type ViolationsAutoReportedRejectedExpenseParams = {rejectedBy: string; rejectReason: string};

type ViolationsCashExpenseWithNoReceiptParams = {formattedLimit?: string} | undefined;

type ViolationsConversionSurchargeParams = {surcharge: number};

type ViolationsInvoiceMarkupParams = {invoiceMarkup: number};

type ViolationsMaxAgeParams = {maxAge: number};

type ViolationsMissingTagParams = {tagName?: string} | undefined;

type ViolationsModifiedAmountParams = {type?: ViolationDataType; displayPercentVariance?: number};

type ViolationsOverAutoApprovalLimitParams = {formattedLimit: string};

type ViolationsOverCategoryLimitParams = {formattedLimit: string};

type ViolationsOverLimitParams = {formattedLimit: string};

type ViolationsPerDayLimitParams = {formattedLimit: string};

type ViolationsReceiptRequiredParams = {formattedLimit?: string; category?: string};

type ViolationsRterParams = {
    brokenBankConnection: boolean;
    isAdmin: boolean;
    email?: string;
    isTransactionOlderThan7Days: boolean;
    member?: string;
};

type ViolationsTagOutOfPolicyParams = {tagName?: string} | undefined;

type ViolationsTaxOutOfPolicyParams = {taxName?: string} | undefined;

type PaySomeoneParams = {name?: string} | undefined;

type TaskCreatedActionParams = {title: string};

type OptionalParam<T> = Partial<T>;

type TermsParams = {amount: string};

type ElectronicFundsParams = {percentage: string; amount: string};

type LogSizeParams = {size: number};

type LogSizeAndDateParams = {size: number; date: string};

type HeldRequestParams = {comment: string};

type ReimbursementRateParams = {unit: Unit};

type ChangeFieldParams = {oldValue?: string; newValue: string; fieldName: string};

type ChangePolicyParams = {fromPolicy: string; toPolicy: string};

type ChangeTypeParams = {oldType: string; newType: string};

type DelegateSubmitParams = {delegateUser: string; originalManager: string};

type AccountOwnerParams = {accountOwnerEmail: string};

type ExportedToIntegrationParams = {label: string; markedManually?: boolean; inProgress?: boolean; lastModified?: string};

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

type UnapprovedParams = {amount: string};

type RemoveMembersWarningPrompt = {
    memberName: string;
    ownerName: string;
};

type RemoveMemberPromptParams = {
    memberName: string;
};

type IssueVirtualCardParams = {
    assignee: string;
    link: string;
};

type ApprovalWorkflowErrorParams = {
    name1: string;
    name2: string;
};

type ConnectionNameParams = {
    connectionName: AllConnectionName;
};

type LastSyncDateParams = {
    connectionName: string;
    formattedDate: string;
};

type CustomersOrJobsLabelParams = {
    importFields: string[];
    importType: string;
};

type ExportAgainModalDescriptionParams = {
    reportName: string;
    connectionName: ConnectionName;
};

type IntegrationSyncFailedParams = {label: string; errorMessage: string};

type AddEmployeeParams = {email: string; role: string};

type UpdateRoleParams = {email: string; currentRole: string; newRole: string};

type RemoveMemberParams = {email: string; role: string};

type DateParams = {date: string};

type FiltersAmountBetweenParams = {greaterThan: string; lessThan: string};

type StatementPageTitleParams = {year: string | number; monthName: string};

type DisconnectPromptParams = {currentIntegration?: ConnectionName} | undefined;

type DisconnectTitleParams = {integration?: ConnectionName} | undefined;

type AmountWithCurrencyParams = {amountWithCurrency: string};

type LowerUpperParams = {lower: string; upper: string};

type CategoryNameParams = {categoryName: string};

type TaxAmountParams = {taxAmount: number};

type SecondaryLoginParams = {secondaryLogin: string};

type OwnerOwesAmountParams = {amount: string; email: string};

type ChangeOwnerSubscriptionParams = {usersCount: number; finalCount: number};

type ChangeOwnerDuplicateSubscriptionParams = {email: string; workspaceName: string};

type ChangeOwnerHasFailedSettlementsParams = {email: string};

type ActionsAreCurrentlyRestricted = {workspaceName: string};

type WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams = {workspaceOwnerName: string};

type RenamedWorkspaceNameActionParams = {oldName: string; newName: string};

type StatementTitleParams = {year: number | string; monthName: string};

type BadgeFreeTrialParams = {numOfDays: number};

type BillingBannerSubtitleWithDateParams = {date: string};

type BillingBannerDisputePendingParams = {amountOwed: number; cardEnding: string};

type BillingBannerCardAuthenticationRequiredParams = {cardEnding: string};

type BillingBannerInsufficientFundsParams = {amountOwed: number};

type BillingBannerCardExpiredParams = {amountOwed: number};

type BillingBannerCardOnDisputeParams = {amountOwed: string; cardEnding: string};

type TrialStartedTitleParams = {numOfDays: number};

type CardNextPaymentParams = {nextPaymentDate: string};

type CardEndingParams = {cardNumber: string};

type CardInfoParams = {name: string; expiration: string; currency: string};

type YourPlanPriceParams = {lower: string; upper: string};

type SubscriptionSizeParams = {size: number};

type SubscriptionCommitmentParams = {size: number; date: string};

type SubscriptionSettingsSaveUpToParams = {amountWithCurrency: string};

type SubscriptionSettingsRenewsOnParams = {date: string};

type UnapproveWithIntegrationWarningParams = {accountingIntegration: string};

type IncorrectZipFormatParams = {zipFormat?: string} | undefined;

type ExportIntegrationSelectedParams = {connectionName: ConnectionName};

type DefaultVendorDescriptionParams = {isReimbursable: boolean};

type RequiredFieldParams = {fieldName: string};

type ImportFieldParams = {importField: string};

type IntacctMappingTitleParams = {mappingName: SageIntacctMappingName};

type LastSyncAccountingParams = {relativeDate: string};

type SyncStageNameConnectionsParams = {stage: PolicyConnectionSyncStage};

type ReconciliationWorksParams = {lastFourPAN: string};

type DelegateRoleParams = {role: DelegateRole};

type DelegatorParams = {delegator: string};

type RoleNamesParams = {role: string};

type AssignCardParams = {
    assignee: string;
    feed: string;
};

type SpreadSheetColumnParams = {
    name: string;
};

type SpreadFieldNameParams = {
    fieldName: string;
};

type SpreadCategoriesParams = {
    categories: number;
};

type AssignedYouCardParams = {
    assigner: string;
};

type FeatureNameParams = {
    featureName: string;
};

type AutoPayApprovedReportsLimitErrorParams = {
    currency?: string;
};

type DefaultAmountParams = {
    defaultAmount: string;
};

type RemovedFromApprovalWorkflowParams = {
    submittersNames: string[];
};

type IntegrationExportParams = {
    integration: string;
    type?: string;
};

type ConnectionParams = {
    connection: string;
};

type MissingPropertyParams = {
    propertyName: string;
};

type InvalidPropertyParams = {
    propertyName: string;
    expectedType: string;
};

type InvalidValueParams = {
    expectedValues: string;
};

type ImportTagsSuccessfullDescriptionParams = {
    tags: number;
};

type ImportedTagsMessageParams = {
    columnCounts: number;
};

type ImportMembersSuccessfullDescriptionParams = {
    members: number;
};

type AuthenticationErrorParams = {
    connectionName: string;
};

type ImportedTypesParams = {
    importedTypes: string[];
};

export type {
    AuthenticationErrorParams,
    ImportMembersSuccessfullDescriptionParams,
    ImportedTagsMessageParams,
    ImportTagsSuccessfullDescriptionParams,
    MissingPropertyParams,
    InvalidPropertyParams,
    InvalidValueParams,
    ConnectionParams,
    IntegrationExportParams,
    RemovedFromApprovalWorkflowParams,
    DefaultAmountParams,
    AutoPayApprovedReportsLimitErrorParams,
    FeatureNameParams,
    SpreadSheetColumnParams,
    SpreadFieldNameParams,
    AssignedYouCardParams,
    SpreadCategoriesParams,
    DelegateRoleParams,
    DelegatorParams,
    ReconciliationWorksParams,
    LastSyncAccountingParams,
    SyncStageNameConnectionsParams,
    RequiredFieldParams,
    IntacctMappingTitleParams,
    ImportFieldParams,
    AssigneeParams,
    DefaultVendorDescriptionParams,
    ExportIntegrationSelectedParams,
    UnapproveWithIntegrationWarningParams,
    IncorrectZipFormatParams,
    CardNextPaymentParams,
    CardEndingParams,
    CardInfoParams,
    YourPlanPriceParams,
    SubscriptionSizeParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSettingsRenewsOnParams,
    BadgeFreeTrialParams,
    BillingBannerSubtitleWithDateParams,
    BillingBannerDisputePendingParams,
    BillingBannerCardAuthenticationRequiredParams,
    BillingBannerInsufficientFundsParams,
    BillingBannerCardExpiredParams,
    BillingBannerCardOnDisputeParams,
    TrialStartedTitleParams,
    RemoveMemberPromptParams,
    StatementTitleParams,
    RenamedWorkspaceNameActionParams,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    ActionsAreCurrentlyRestricted,
    ChangeOwnerHasFailedSettlementsParams,
    OwnerOwesAmountParams,
    ChangeOwnerDuplicateSubscriptionParams,
    ChangeOwnerSubscriptionParams,
    SecondaryLoginParams,
    TaxAmountParams,
    CategoryNameParams,
    AmountWithCurrencyParams,
    LowerUpperParams,
    LogSizeAndDateParams,
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
    ConfirmThatParams,
    CompanyCardFeedNameParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DidSplitAmountMessageParams,
    EditActionParams,
    ElectronicFundsParams,
    EnterMagicCodeParams,
    FormattedMaxLengthParams,
    ForwardedAmountParams,
    GoBackMessageParams,
    GoToRoomParams,
    HeldRequestParams,
    InstantSummaryParams,
    IssueVirtualCardParams,
    LocalTimeParams,
    LogSizeParams,
    LoggedInAsParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    SignUpNewFaceCodeParams,
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
    RoleNamesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    ReimbursementRateParams,
    RemovedTheRequestParams,
    RenamedRoomActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsMergedParams,
    ReportPolicyNameParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    RequestAmountParams,
    RequestCountParams,
    RequestedAmountMessageParams,
    ResolutionConstraintsParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    SetTheDistanceMerchantParams,
    SetTheRequestParams,
    SettleExpensifyCardParams,
    SettledAfterAddedBankAccountParams,
    SizeExceededParams,
    SplitAmountParams,
    StepCounterParams,
    TaskCreatedActionParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    ToValidateLoginParams,
    TransferParams,
    UntilTimeParams,
    UpdatedTheDistanceMerchantParams,
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
    ViolationsModifiedAmountParams,
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
    ChangeFieldParams,
    ChangePolicyParams,
    ChangeTypeParams,
    ExportedToIntegrationParams,
    DelegateSubmitParams,
    AccountOwnerParams,
    IntegrationsMessageParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UnshareParams,
    StripePaidParams,
    UnapprovedParams,
    RemoveMembersWarningPrompt,
    ApprovalWorkflowErrorParams,
    ConnectionNameParams,
    LastSyncDateParams,
    CustomersOrJobsLabelParams,
    ExportAgainModalDescriptionParams,
    IntegrationSyncFailedParams,
    AddEmployeeParams,
    UpdateRoleParams,
    RemoveMemberParams,
    DateParams,
    FiltersAmountBetweenParams,
    StatementPageTitleParams,
    DisconnectPromptParams,
    DisconnectTitleParams,
    CharacterLengthLimitParams,
    OptionalParam,
    AssignCardParams,
    ImportedTypesParams,
};
