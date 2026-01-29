import type {ValueOf} from 'type-fest';
import type {AuthTypeName} from '@components/MultifactorAuthentication/types';
import type CONST from '@src/CONST';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import type {DelegateRole} from '@src/types/onyx/Account';
import type {AllConnectionName, ConnectionName, PolicyConnectionSyncStage, SageIntacctMappingName} from '@src/types/onyx/Policy';
import type {ViolationDataType} from '@src/types/onyx/TransactionViolation';

type MultifactorAuthenticationTranslationParams = {
    authType?: AuthTypeName;
    registered?: boolean;
};

type ZipCodeExampleFormatParams = {
    zipSampleFormat: string;
};

type SignUpNewFaceCodeParams = {
    login: string;
};

type WelcomeEnterMagicCodeParams = {
    login: string;
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

type LearnMoreRouteParams = {
    learnMoreMethodsRoute: string;
    formattedPrice: string;
    hasTeam2025Pricing: boolean;
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

type CreatedReportForUnapprovedTransactionsParams = {
    reportUrl: string;
    reportName: string;
};

type MovedTransactionParams = {
    reportUrl: string;
    reportName?: string;
};

type MovedActionParams = {
    shouldHideMovedReportUrl: boolean;
    movedReportUrl: string;
    newParentReportUrl: string;
    toPolicyName: string;
};

type MovedFromReportParams = {
    reportName: string;
};

type SettleExpensifyCardParams = {
    formattedAmount: string;
};

type PhoneErrorRouteParams = {
    phoneErrorMethodsRoute: string;
};

type WorkspacesListRouteParams = {
    workspacesListRoute: string;
};

type WorkspaceRouteParams = {
    workspaceRoute: string;
};

type RequestAmountParams = {amount: string};

type ReportFieldParams = {name: string; value: string};

type SplitAmountParams = {amount: string};

type UserSplitParams = {amount: string};

type PayerOwesParams = {payer: string};

type ManagerApprovedParams = {manager: string};

type ManagerApprovedAmountParams = {manager: string; amount: number | string};

type PayerPaidParams = {payer: string};

type PaidElsewhereParams = {payer?: string; comment?: string};

type WaitingOnBankAccountParams = {submitterDisplayName: string};

type SettledAfterAddedBankAccountParams = {submitterDisplayName: string; amount: string};

type ThreadRequestReportNameParams = {formattedAmount: string; comment: string};

type ThreadSentMoneyReportNameParams = {formattedAmount: string; comment: string};

type MovedFromPersonalSpaceParams = {workspaceName?: string; reportName?: string};

type SizeExceededParams = {maxUploadSizeInMB: number};

type ResolutionConstraintsParams = {minHeightInPx: number; minWidthInPx: number; maxHeightInPx: number; maxWidthInPx: number};

type NotAllowedExtensionParams = {allowedExtensions: string[]};

type TransferParams = {amount: string};

type NotYouParams = {user: string};

type WeSentYouMagicSignInLinkParams = {login: string; loginType: string};

type ToValidateLoginParams = {primaryLogin: string; secondaryLogin: string};

type NoLongerHaveAccessParams = {primaryLogin: string};

type OurEmailProviderParams = {login: string};

type UntilTimeParams = {time: string};

type StepCounterParams = {step: number; total?: number; text?: string};

type UserIsAlreadyMemberParams = {login: string; name: string};

type NewWorkspaceNameParams = {userName: string; workspaceNumber?: number};

type RoomNameReservedErrorParams = {reservedName: string};

type RenamedRoomActionParams = {oldName: string; newName: string; isExpenseReport: boolean; actorName?: string};

type RoomRenamedToParams = {newName: string};

type OOOEventSummaryFullDayParams = {summary: string; dayCount: number; date: string};

type OOOEventSummaryPartialDayParams = {summary: string; timePeriod: string; date: string};

type ParentNavigationSummaryParams = {reportName?: string; workspaceName?: string};

type SetTheRequestParams = {valueName: string; newValueToDisplay: string};

type SetTheDistanceMerchantParams = {translatedChangedField: string; newMerchant: string; newAmountToDisplay: string};

type RemovedTheRequestParams = {valueName: string; oldValueToDisplay: string};

type UpdatedTheRequestParams = {valueName: string; newValueToDisplay: string; oldValueToDisplay: string};

type UpdatedTheDistanceMerchantParams = {translatedChangedField: string; newMerchant: string; oldMerchant: string; newAmountToDisplay: string; oldAmountToDisplay: string};

type WalletProgramParams = {walletProgram: string};

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

type ViolationsCustomRulesParams = {message: string};

type ViolationsRterParams = {
    brokenBankConnection: boolean;
    isAdmin: boolean;
    isTransactionOlderThan7Days: boolean;
    member?: string;
    rterType?: ValueOf<typeof CONST.RTER_VIOLATION_TYPES>;
    companyCardPageURL?: string;
};

type ViolationsTagOutOfPolicyParams = {tagName?: string} | undefined;

type ViolationsProhibitedExpenseParams = {prohibitedExpenseTypes: string | string[]};

type ViolationsTaxOutOfPolicyParams = {taxName?: string} | undefined;

type PaySomeoneParams = {name?: string} | undefined;

type TaskCreatedActionParams = {title: string};

type OptionalParam<T> = Partial<T>;

type TermsParams = {amount: string};

type LogSizeParams = {size: number};

type LogSizeAndDateParams = {size: number; date: string};

type HeldRequestParams = {comment: string};

type ChangeFieldParams = {oldValue?: string; newValue: string; fieldName: string};

type UpdatedPolicyDescriptionParams = {oldDescription: string; newDescription: string};

type UpdatedPolicyCurrencyParams = {oldCurrency: string; newCurrency: string};

type UpdatedPolicyCategoryParams = {categoryName: string; oldValue?: boolean | string | number; newValue?: boolean | string | number};

type UpdatedPolicyCategoryDescriptionHintTypeParams = {categoryName: string; oldValue?: string; newValue?: string};

type UpdatedPolicyCategoryGLCodeParams = {categoryName: string; oldValue?: string; newValue?: string};

type UpdatedPolicyCategoryMaxExpenseAmountParams = {categoryName: string; oldAmount?: string; newAmount?: string};

type UpdatedPolicyCategoryExpenseLimitTypeParams = {categoryName: string; oldValue?: string; newValue: string};

type UpdatedPolicyCategoryMaxAmountNoReceiptParams = {categoryName: string; oldValue?: string; newValue: string};

type UpdatedPolicyTaxParams = {taxName: string; oldValue?: string | boolean | number; newValue?: string | boolean | number; updatedField?: string};

type UpdatedPolicyTagParams = {tagListName: string; tagName?: string; enabled?: boolean; count?: string};

type UpdatedPolicyTagNameParams = {oldName: string; newName: string; tagListName: string};

type UpdatedPolicyTagFieldParams = {oldValue?: string; newValue: string; tagName: string; tagListName: string; updatedField: string};

type UpdatedPolicyCategoryNameParams = {oldName: string; newName?: string};

type UpdatedPolicyTagListParams = {tagListName: string};

type UpdatedPolicyTagListRequiredParams = {tagListsName: string; isRequired: boolean};

type UpdatePolicyCustomUnitTaxEnabledParams = {newValue: boolean};

type ImportPolicyCustomUnitRatesParams = {customUnitName: string};

type UpdatePolicyCustomUnitDefaultCategoryParams = {customUnitName: string; newValue?: string; oldValue?: string};

type UpdatePolicyCustomUnitParams = {oldValue: string; newValue: string; customUnitName: string; updatedField: string};

type UpdatedPolicyCustomUnitRateParams = {customUnitName: string; customUnitRateName: string; oldValue: string; newValue: string; updatedField: string};

type UpdatedPolicyCustomUnitTaxRateExternalIDParams = {customUnitRateName: string; newValue: string; newTaxPercentage: string; oldValue?: string; oldTaxPercentage?: string};

type UpdatedPolicyCustomUnitTaxClaimablePercentageParams = {customUnitRateName: string; newValue: number; oldValue?: number};

type UpdatedPolicyCustomUnitSubRateParams = {customUnitName: string; customUnitRateName: string; customUnitSubRateName: string; oldValue: string; newValue: string; updatedField: string};

type RemovedPolicyCustomUnitSubRateParams = {customUnitName: string; customUnitRateName: string; removedSubRateName: string};

type AddedOrDeletedPolicyReportFieldParams = {fieldType: string; fieldName?: string};

type UpdatedPolicyCustomUnitRateIndexParams = {customUnitName: string; customUnitRateName: string; oldValue?: number; newValue: number};

type UpdatedPolicyCustomUnitRateEnabledParams = {customUnitName: string; customUnitRateName: string; oldValue: boolean; newValue: boolean};

type UpdatedPolicyReportFieldDefaultValueParams = {fieldName?: string; defaultValue?: string};

type PolicyAddedReportFieldOptionParams = {fieldName?: string; optionName: string};

type PolicyDisabledReportFieldOptionParams = {fieldName: string; optionName: string; optionEnabled: boolean};

type PolicyDisabledReportFieldAllOptionsParams = {fieldName: string; optionName: string; allEnabled: boolean; toggledOptionsCount?: number};

type UpdatedPolicyApprovalRuleParams = {oldApproverEmail: string; oldApproverName?: string; newApproverEmail: string; newApproverName?: string; field: string; name: string};

type UpdatedPolicyPreventSelfApprovalParams = {oldValue: string; newValue: string};

type UpdatedPolicyOwnershipParams = {oldOwnerEmail: string; oldOwnerName: string; policyName: string};

type UpdatedPolicyFieldWithNewAndOldValueParams = {oldValue: string; newValue: string};

type UpdatedPolicyTimeEnabledParams = {enabled?: boolean};

type UpdatedPolicyTimeRateParams = {newRate?: string; oldRate?: string};

type UpdatedPolicyAutoHarvestingParams = {enabled: boolean};

type UpdatedPolicyBudgetNotificationParams = {
    budgetAmount: string;
    budgetFrequency: string;
    budgetName: string;
    budgetTypeForNotificationMessage: string;
    summaryLink?: string;
    thresholdPercentage: number;
    totalSpend: number;
    unsubmittedSpend: number;
    userEmail?: string;
    awaitingApprovalSpend: number;
    approvedReimbursedClosedSpend: number;
};

type UpdatedPolicyReimbursementChoiceParams = {newReimbursementChoice: string; oldReimbursementChoice: string};

type UpdatedPolicyDefaultTitleParams = {newDefaultTitle: string; oldDefaultTitle: string};

type UpdatedPolicyFieldWithValueParams = {value: boolean};

type UpdatedPolicySetAutoJoinParams = {enabled: boolean};

type UpdatedPolicyFrequencyParams = {oldFrequency: string; newFrequency: string};

type UpdatedPolicyAuditRateParams = {oldAuditRate: number; newAuditRate: number};

type UpdatedPolicyManualApprovalThresholdParams = {oldLimit: string; newLimit: string};

type UpdatedPolicyReimbursementEnabledParams = {enabled: boolean};

type UpdatedPolicyReimburserParams = {newReimburser: string; previousReimburser?: string};

type ExportedToIntegrationParams = {label: string; markedManually?: boolean; inProgress?: boolean; lastModified?: string};

type AddBudgetParams = {frequency: string; entityType: string; entityName: string; shared?: string; individual?: string; notificationThreshold?: number};

type AddOrDeletePolicyCustomUnitRateParams = {customUnitName: string; rateName: string};

type UpdatedBudgetParams = {
    entityType: string;
    entityName: string;
    oldFrequency?: string;
    newFrequency?: string;
    oldIndividual?: string;
    newIndividual?: string;
    oldShared?: string;
    newShared?: string;
    oldNotificationThreshold?: number;
    newNotificationThreshold?: number;
};

type DeleteBudgetParams = {
    entityType: string;
    entityName: string;
    frequency?: string;
    individual?: string;
    shared?: string;
    notificationThreshold?: number;
};

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

type ConnectionNameParams = {
    connectionName: AllConnectionName;
};

type LastSyncDateParams = {
    connectionName: string;
    formattedDate: string;
};

type ExportAgainModalDescriptionParams = {
    reportName: string;
    connectionName: ConnectionName;
};

type IntegrationSyncFailedParams = {label: string; errorMessage: string; linkText?: string; linkURL?: string; workspaceAccountingLink?: string};

type UpdateRoleParams = {email: string; currentRole: string; newRole: string};

type UpdatedCustomFieldParams = {email: string; previousValue: string; newValue: string};

type LeftWorkspaceParams = {nameOrEmail: string};

type RemoveMemberParams = {email: string; role: string};

type StatementPageTitleParams = {year: string | number; monthName: string};

type DisconnectPromptParams = {currentIntegration?: ConnectionName} | undefined;

type DisconnectTitleParams = {integration?: ConnectionName} | undefined;

type AmountWithCurrencyParams = {amountWithCurrency: string};

type LowerUpperParams = {lower: string; upper: string};

type CategoryNameParams = {categoryName: string};

type UpdatedPolicyCategoriesParams = {count: number};

type NeedCategoryForExportToIntegrationParams = {connectionName: string};

type TaxAmountParams = {taxAmount: number};

type SecondaryLoginParams = {secondaryLogin: string};

type WorkspaceMembersCountParams = {count: number};

type OwnerOwesAmountParams = {amount: string; email: string};

type WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams = {workspaceOwnerName: string};

type RenamedWorkspaceNameActionParams = {oldName: string; newName: string};

type StatementTitleParams = {year: number | string; monthName: string};

type TrialStartedTitleParams = {numOfDays: number};

type YourPlanPriceParams = {lower: string; upper: string};

type YourPlanPriceValueParams = {price: string};

type SubscriptionSizeParams = {size: number};

type SubscriptionCommitmentParams = {size: number; date: string};

type SubscriptionSettingsSaveUpToParams = {amountWithCurrency: string};

type SubscriptionSettingsSummaryParams = {subscriptionType: string; subscriptionSize: string; autoRenew: string; autoIncrease: string};

type SubscriptionSettingsRenewsOnParams = {date: string};

type SubscriptionSettingsLearnMoreParams = {hasAdminsRoom: boolean};

type UnapproveWithIntegrationWarningParams = {accountingIntegration: string};

type ExportIntegrationSelectedParams = {connectionName: ConnectionName};

type RequiredFieldParams = {fieldName: string};

type IntacctMappingTitleParams = {mappingName: SageIntacctMappingName};

type LastSyncAccountingParams = {relativeDate: string};

type SyncStageNameConnectionsParams = {stage: PolicyConnectionSyncStage};

type DelegateRoleParams = {role: DelegateRole};

type VacationDelegateParams = {nameOrEmail: string};

type SubmittedToVacationDelegateParams = {submittedToName: string; vacationDelegateName: string};

type RoleNamesParams = {role: string};

type RemovedFromApprovalWorkflowParams = {
    submittersNames: string[];
};

type IntegrationExportParams = {
    integration: string;
    type?: string;
    exportPageLink?: string;
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

type WorkspaceYouMayJoin = {
    domain: string;
    email: string;
};

type WorkEmailResendCodeParams = {
    workEmail: string | undefined;
};

type WorkEmailMergingBlockedParams = {
    workEmail: string | undefined;
};

type WorkspaceMemberList = {
    employeeCount: number;
    policyOwner: string;
};

type WorkspaceLockedPlanTypeParams = {
    count: number;
    annualSubscriptionEndDate: string;
};

type SignerInfoMessageParams = {
    bankAccountLastFour: string | undefined;
    currency: string | undefined;
};

type CustomUnitRateParams = {
    rate: number;
};

type SubmitsToParams = {
    name: string;
};

type SettlementDateParams = {
    settlementDate: string;
};

type PolicyExpenseChatNameParams = {
    displayName: string;
};

type ReceiptPartnersUberSubtitleParams = {
    organizationName: string;
};

type ReviewParams = {
    amount: string;
};

type SplitExpenseSubtitleParams = {
    amount: string;
    merchant: string;
};

type SplitExpenseEditTitleParams = {
    amount: string;
    merchant: string;
};

type SplitDateRangeParams = {
    startDate: string;
    endDate: string;
    count: number;
};

type TotalAmountGreaterOrLessThanOriginalParams = {
    amount: string;
};

type RailTicketParams = {
    origin: string;
    destination: string;
    startDate: string;
};

type TravelTypeParams = {
    type: string;
    id?: string;
};

type QBDSetupErrorBodyParams = {
    conciergeLink: string;
};

type SettlementAccountInfoParams = {
    reconciliationAccountSettingsLink: string;
    accountNumber: string;
};

type MergeSuccessDescriptionParams = {
    from: string;
    to: string;
};

type MergeFailureUncreatedAccountDescriptionParams = {
    email: string;
    contactMethodLink: string;
};

type MergeFailureDescriptionGenericParams = {
    email: string;
};

type WorkspaceUpgradeNoteParams = {
    subscriptionLink: string;
};

type WorkflowSettingsParam = {workflowSettingLink: string};

type WorkspaceShareNoteParams = {
    adminsRoomLink: string;
};

type RulesEnableWorkflowsParams = {
    moreFeaturesLink: string;
};

type UpgradeSuccessMessageParams = {
    policyName: string;
    subscriptionLink: string;
};

type SubmittedWithMemoParams = {
    memo?: string;
};

type PayAndDowngradeDescriptionParams = {
    formattedAmount: string;
};

type WalletAgreementParams = {
    walletAgreementUrl: string;
};

type SettlementAccountReconciliationParams = {
    settlementAccountUrl: string;
    lastFourPAN: string;
};

type MergeAccountIntoParams = {
    login: string;
};

type NextStepParams = {
    actor: string;
    actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>;
    eta?: string;
    etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>;
};

type ToggleImportTitleParams = {
    mappingTitle: string;
};

type RoutedDueToDEWParams = {
    to: string;
};

export type {
    SettlementAccountReconciliationParams,
    ToggleImportTitleParams,
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
    SplitDateRangeParams,
    TotalAmountGreaterOrLessThanOriginalParams,
    MissingPropertyParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IntegrationExportParams,
    RemovedFromApprovalWorkflowParams,
    DelegateRoleParams,
    VacationDelegateParams,
    LastSyncAccountingParams,
    SyncStageNameConnectionsParams,
    RequiredFieldParams,
    IntacctMappingTitleParams,
    ExportIntegrationSelectedParams,
    UnapproveWithIntegrationWarningParams,
    YourPlanPriceParams,
    SubscriptionSizeParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSettingsRenewsOnParams,
    TrialStartedTitleParams,
    RemoveMemberPromptParams,
    StatementTitleParams,
    RenamedWorkspaceNameActionParams,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    OwnerOwesAmountParams,
    SecondaryLoginParams,
    TaxAmountParams,
    CategoryNameParams,
    UpdatedPolicyCategoriesParams,
    AmountWithCurrencyParams,
    LowerUpperParams,
    LogSizeAndDateParams,
    BeginningOfChatHistoryAnnounceRoomPartTwo,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    SubmittedToVacationDelegateParams,
    LearnMoreRouteParams,
    HeldRequestParams,
    IssueVirtualCardParams,
    LocalTimeParams,
    LogSizeParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MovedFromPersonalSpaceParams,
    SignUpNewFaceCodeParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OurEmailProviderParams,
    ParentNavigationSummaryParams,
    PaySomeoneParams,
    PayerOwesParams,
    RoleNamesParams,
    PayerPaidParams,
    PaidElsewhereParams,
    RemovedTheRequestParams,
    MovedFromReportParams,
    RenamedRoomActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsMergedParams,
    ReportPolicyNameParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    CreatedReportForUnapprovedTransactionsParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    RequestAmountParams,
    MovedTransactionParams,
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
    ViolationsCustomRulesParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsProhibitedExpenseParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletProgramParams,
    WeSentYouMagicSignInLinkParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    ZipCodeExampleFormatParams,
    ChangeFieldParams,
    ExportedToIntegrationParams,
    IntegrationsMessageParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UpdatedPolicyFieldWithValueParams,
    UnshareParams,
    StripePaidParams,
    RemoveMembersWarningPrompt,
    ConnectionNameParams,
    LastSyncDateParams,
    ExportAgainModalDescriptionParams,
    IntegrationSyncFailedParams,
    UpdateRoleParams,
    UpdatedCustomFieldParams,
    LeftWorkspaceParams,
    RemoveMemberParams,
    StatementPageTitleParams,
    DisconnectPromptParams,
    DisconnectTitleParams,
    OptionalParam,
    WorkspaceYouMayJoin,
    WorkspaceMemberList,
    WorkspaceLockedPlanTypeParams,
    CustomUnitRateParams,
    UpdatedPolicyCurrencyParams,
    UpdatedPolicyFrequencyParams,
    UpdatedPolicyCategoryParams,
    UpdatedPolicyCategoryDescriptionHintTypeParams,
    UpdatedPolicyCategoryNameParams,
    UpdatedPolicyTagListParams,
    UpdatedPolicyTagListRequiredParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyFieldWithNewAndOldValueParams,
    UpdatedPolicyTimeEnabledParams,
    UpdatedPolicyTimeRateParams,
    UpdatedPolicyDescriptionParams,
    WorkEmailResendCodeParams,
    WorkEmailMergingBlockedParams,
    NewWorkspaceNameParams,
    UpdatedPolicyCustomUnitRateParams,
    UpdatedPolicyCustomUnitTaxRateExternalIDParams,
    UpdatedPolicyCustomUnitTaxClaimablePercentageParams,
    UpdatedPolicyTagParams,
    UpdatedPolicyTaxParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    PolicyAddedReportFieldOptionParams,
    PolicyDisabledReportFieldOptionParams,
    PolicyDisabledReportFieldAllOptionsParams,
    SubmitsToParams,
    SettlementDateParams,
    UpdatedPolicyCustomUnitSubRateParams,
    RemovedPolicyCustomUnitSubRateParams,
    PolicyExpenseChatNameParams,
    ReceiptPartnersUberSubtitleParams,
    YourPlanPriceValueParams,
    AddedOrDeletedPolicyReportFieldParams,
    NeedCategoryForExportToIntegrationParams,
    UpdatedPolicyAuditRateParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyReimbursementEnabledParams,
    UpdatedPolicyReimburserParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    ImportPolicyCustomUnitRatesParams,
    UpdatePolicyCustomUnitDefaultCategoryParams,
    UpdatePolicyCustomUnitParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyCategoryGLCodeParams,
    UpdatedPolicyCategoryMaxExpenseAmountParams,
    UpdatedPolicyCategoryExpenseLimitTypeParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    SubscriptionSettingsSummaryParams,
    ReviewParams,
    WorkspaceMembersCountParams,
    RailTicketParams,
    TravelTypeParams,
    PhoneErrorRouteParams,
    WorkspacesListRouteParams,
    WorkspaceRouteParams,
    AddBudgetParams,
    UpdatedBudgetParams,
    DeleteBudgetParams,
    QBDSetupErrorBodyParams,
    AddOrDeletePolicyCustomUnitRateParams,
    SettlementAccountInfoParams,
    MergeSuccessDescriptionParams,
    MergeFailureUncreatedAccountDescriptionParams,
    MergeFailureDescriptionGenericParams,
    WorkspaceUpgradeNoteParams,
    WorkflowSettingsParam,
    MovedActionParams,
    WorkspaceShareNoteParams,
    RulesEnableWorkflowsParams,
    UpgradeSuccessMessageParams,
    SubmittedWithMemoParams,
    SignerInfoMessageParams,
    PayAndDowngradeDescriptionParams,
    WalletAgreementParams,
    SubscriptionSettingsLearnMoreParams,
    MergeAccountIntoParams,
    NextStepParams,
    ReportFieldParams,
    UpdatedPolicyOwnershipParams,
    UpdatedPolicyAutoHarvestingParams,
    UpdatedPolicyBudgetNotificationParams,
    UpdatedPolicyReimbursementChoiceParams,
    UpdatedPolicyDefaultTitleParams,
    UpdatedPolicySetAutoJoinParams,
    RoutedDueToDEWParams,
    UpdatedPolicyCustomUnitRateEnabledParams,
    UpdatedPolicyCustomUnitRateIndexParams,
    MultifactorAuthenticationTranslationParams,
};
