import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import type {DelegateRole} from '@src/types/onyx/Account';
import type {AllConnectionName, ConnectionName, PolicyConnectionSyncStage, SageIntacctMappingName} from '@src/types/onyx/Policy';
import type {ViolationDataType} from '@src/types/onyx/TransactionViolation';

type TagSelectionParams = {
    policyTagListName?: string;
};

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

type BeginningOfChatHistoryDomainRoomParams = {
    domainRoom: string;
};

type BeginningOfChatHistoryAdminRoomParams = {
    workspaceName: string;
};

type BeginningOfChatHistoryAnnounceRoomParams = {
    workspaceName: string;
};

type BeginningOfChatHistoryPolicyExpenseChatParams = {
    workspaceName: string;
    submitterDisplayName: string;
};

type BeginningOfChatHistoryInvoiceRoomParams = {
    invoicePayer: string;
    invoiceReceiver: string;
};

type LearnMoreRouteParams = {
    learnMoreMethodsRoute: string;
    formattedPrice: string;
    hasTeam2025Pricing: boolean;
};

type BeginningOfArchivedRoomParams = {
    reportName: string;
    reportDetailsLink: string;
};

type BeginningOfChatHistoryUserRoomParams = {
    reportName: string;
    reportDetailsLink: string;
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

type DuplicateTransactionParams = {
    isSubmitted: boolean;
};

type RequestCountParams = {
    scanningReceipts: number;
    pendingReceipts: number;
};

type DeleteTransactionParams = {
    amount: string;
    merchant: string;
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

type BusinessBankAccountParams = {
    amount?: string;
    last4Digits?: string;
};

type WorkspaceRouteParams = {
    workspaceRoute: string;
};

type RequestAmountParams = {amount: string};

type ReportFieldParams = {name: string; value: string};

type RequestedAmountMessageParams = {formattedAmount: string; comment?: string};

type SplitAmountParams = {amount: string};

type DidSplitAmountMessageParams = {formattedAmount: string; comment: string};

type UserSplitParams = {amount: string};

type PayerOwesAmountParams = {payer: string; amount: number | string; comment?: string};

type PayerOwesParams = {payer: string};

type CompanyCardFeedNameParams = {feedName: string};

type PayerPaidAmountParams = {payer?: string; amount: number | string};

type ApprovedAmountParams = {amount: number | string};

type ManagerApprovedParams = {manager: string};

type ManagerApprovedAmountParams = {manager: string; amount: number | string};

type PayerPaidParams = {payer: string};

type PayerSettledParams = {amount: number | string};

type CreateExpensesParams = {expensesNumber: number};

type WaitingOnBankAccountParams = {submitterDisplayName: string};

type CanceledRequestParams = {amount: string; submitterDisplayName: string};

type SettledAfterAddedBankAccountParams = {submitterDisplayName: string; amount: string};

type PaidElsewhereParams = {payer?: string} | undefined;

type PaidWithExpensifyParams = {payer?: string} | undefined;

type ThreadRequestReportNameParams = {formattedAmount: string; comment: string};

type ThreadSentMoneyReportNameParams = {formattedAmount: string; comment: string};

type MovedFromPersonalSpaceParams = {workspaceName?: string; reportName?: string};

type SizeExceededParams = {maxUploadSizeInMB: number};

type ResolutionConstraintsParams = {minHeightInPx: number; minWidthInPx: number; maxHeightInPx: number; maxWidthInPx: number};

type NotAllowedExtensionParams = {allowedExtensions: string[]};

type EnterMagicCodeParams = {contactMethod: string};

type TransferParams = {amount: string};

type InstantSummaryParams = {rate: string; minAmount: string};

type BankAccountLastFourParams = {lastFour: string};

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

type FormattedMaxLengthParams = {formattedMaxLength: string};

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

type ElectronicFundsParams = {percentage: string; amount: string};

type LogSizeParams = {size: number};

type LogSizeAndDateParams = {size: number; date: string};

type HeldRequestParams = {comment: string};

type ChangeFieldParams = {oldValue?: string; newValue: string; fieldName: string};

type ChangeReportPolicyParams = {fromPolicyName?: string; toPolicyName: string};

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

type UpdatePolicyCustomUnitTaxEnabledParams = {newValue: boolean};

type UpdatePolicyCustomUnitParams = {oldValue: string; newValue: string; customUnitName: string; updatedField: string};

type AddOrDeletePolicyCustomUnitRateParams = {customUnitName: string; rateName: string};

type UpdatedPolicyCustomUnitRateParams = {customUnitName: string; customUnitRateName: string; oldValue: string; newValue: string; updatedField: string};

type UpdatedPolicyCustomUnitTaxRateExternalIDParams = {customUnitRateName: string; newValue: string; newTaxPercentage: string; oldValue?: string; oldTaxPercentage?: string};

type UpdatedPolicyCustomUnitTaxClaimablePercentageParams = {customUnitRateName: string; newValue: number; oldValue?: number};

type AddedOrDeletedPolicyReportFieldParams = {fieldType: string; fieldName?: string};

type UpdatedPolicyReportFieldDefaultValueParams = {fieldName?: string; defaultValue?: string};

type PolicyAddedReportFieldOptionParams = {fieldName?: string; optionName: string};

type PolicyDisabledReportFieldOptionParams = {fieldName: string; optionName: string; optionEnabled: boolean};

type PolicyDisabledReportFieldAllOptionsParams = {fieldName: string; optionName: string; allEnabled: boolean; toggledOptionsCount?: number};

type AddedPolicyApprovalRuleParams = {approverEmail: string; approverName: string; field: string; name: string};

type UpdatedPolicyApprovalRuleParams = {oldApproverEmail: string; oldApproverName?: string; newApproverEmail: string; newApproverName?: string; field: string; name: string};

type UpdatedPolicyPreventSelfApprovalParams = {oldValue: string; newValue: string};

type UpdatedPolicyFieldWithNewAndOldValueParams = {oldValue: string; newValue: string};

type UpdatedPolicyFieldWithValueParam = {value: boolean};

type UpdatedPolicyFrequencyParams = {oldFrequency: string; newFrequency: string};

type UpdatedPolicyAuditRateParams = {oldAuditRate: number; newAuditRate: number};

type UpdatedPolicyManualApprovalThresholdParams = {oldLimit: string; newLimit: string};

type UpdatedPolicyReimbursementEnabledParams = {enabled: boolean};

type ChangeTypeParams = {oldType: string; newType: string};

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

type IntegrationSyncFailedParams = {label: string; errorMessage: string; linkText?: string; linkURL?: string; workspaceAccountingLink?: string};

type AddEmployeeParams = {email: string; role: string};

type UpdateRoleParams = {email: string; currentRole: string; newRole: string};

type UpdatedCustomFieldParams = {email: string; previousValue: string; newValue: string};

type LeftWorkspaceParams = {nameOrEmail: string};

type RemoveMemberParams = {email: string; role: string};

type DateParams = {date: string};

type FiltersAmountBetweenParams = {greaterThan: string; lessThan: string};

type StatementPageTitleParams = {year: string | number; monthName: string};

type DisconnectPromptParams = {currentIntegration?: ConnectionName} | undefined;

type DisconnectTitleParams = {integration?: ConnectionName} | undefined;

type AmountWithCurrencyParams = {amountWithCurrency: string};

type LowerUpperParams = {lower: string; upper: string};

type CategoryNameParams = {categoryName: string};

type NeedCategoryForExportToIntegrationParams = {connectionName: string};

type TaxAmountParams = {taxAmount: number};

type SecondaryLoginParams = {secondaryLogin: string};

type WorkspaceMembersCountParams = {count: number};

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

type BillingBannerOwnerAmountOwedOverdueParams = {date?: string; purchaseAmountOwed?: string};

type BillingBannerDisputePendingParams = {amountOwed: number; cardEnding: string};

type BillingBannerCardAuthenticationRequiredParams = {cardEnding: string};

type BillingBannerInsufficientFundsParams = {amountOwed: number};

type BillingBannerCardExpiredParams = {amountOwed: number};

type BillingBannerCardOnDisputeParams = {amountOwed: string; cardEnding: string};

type TrialStartedTitleParams = {numOfDays: number};

type EarlyDiscountTitleParams = {discountType: number};

type EarlyDiscountSubtitleParams = {days: number; hours: number; minutes: number; seconds: number};

type CardNextPaymentParams = {nextPaymentDate: string};

type CardEndingParams = {cardNumber: string};

type CardInfoParams = {name: string; expiration: string; currency: string};

type YourPlanPriceParams = {lower: string; upper: string};

type YourPlanPriceValueParams = {price: string};

type SubscriptionSizeParams = {size: number};

type SubscriptionCommitmentParams = {size: number; date: string};

type SubscriptionSettingsSaveUpToParams = {amountWithCurrency: string};

type SubscriptionSettingsSummaryParams = {subscriptionType: string; subscriptionSize: string; autoRenew: string; autoIncrease: string};

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

type DelegateRoleParams = {role: DelegateRole};

type DelegatorParams = {delegator: string};

type VacationDelegateParams = {nameOrEmail: string};

type SubmittedToVacationDelegateParams = {submittedToName: string; vacationDelegateName: string};

type RoleNamesParams = {role: string};

type SpreadSheetColumnParams = {
    name: string;
};

type SpreadFieldNameParams = {
    fieldName: string;
};

type SpreadCategoriesParams = {
    categories: number;
};

type AssignedCardParams = {
    assignee: string;
    link: string;
};

type FeatureNameParams = {
    featureName: string;
    moreFeaturesLink: string;
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

type DemotedFromWorkspaceParams = {
    policyName: string;
    oldRole: string;
};

type IntegrationExportParams = {
    integration: string;
    type?: string;
    exportPageLink?: string;
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

type ImportTagsSuccessfulDescriptionParams = {
    tags: number;
};

type ImportedTagsMessageParams = {
    columnCounts: number;
};

type ImportMembersSuccessfulDescriptionParams = {
    added: number;
    updated: number;
};

type ImportPerDiemRatesSuccessfulDescriptionParams = {
    rates: number;
};

type AuthenticationErrorParams = {
    connectionName: string;
};

type ImportedTypesParams = {
    importedTypes: string[];
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

type FileLimitParams = {
    fileLimit: number;
};

type FileTypeParams = {
    fileType: string;
};

type CompanyCardBankName = {
    bankName: string;
};

type CurrencyCodeParams = {
    currencyCode: string;
};

type WorkspaceLockedPlanTypeParams = {
    count: number;
    annualSubscriptionEndDate: string;
};

type CompanyNameParams = {
    companyName: string;
};

type SignerInfoMessageParams = {
    bankAccountLastFour: string | undefined;
    currency: string | undefined;
};

type CustomUnitRateParams = {
    rate: number;
};

type ChatWithAccountManagerParams = {
    accountManagerDisplayName: string;
};

type EditDestinationSubtitleParams = {
    destination: string;
};

type FlightLayoverParams = {
    layover: string;
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

type CurrencyInputDisabledTextParams = {
    currency: string;
};

type SplitExpenseSubtitleParams = {
    amount: string;
    merchant: string;
};

type SplitExpenseEditTitleParams = {
    amount: string;
    merchant: string;
};

type TotalAmountGreaterOrLessThanOriginalParams = {
    amount: string;
};

type EmployeeInviteMessageParams = {
    name: string;
};

type FlightParams = {
    startDate: string;
    airlineCode: string;
    origin: string;
    destination: string;
    confirmationID?: string;
};

type AirlineParams = {
    airlineCode: string;
    startDate?: string;
    cabinClass?: string;
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

type ContactMethodsRouteParams = {
    contactMethodsRoute: string;
};

type ContactMethodParams = {
    contactMethodRoute: string;
};

type BusinessTaxIDParams = {
    country: string;
};

type BusinessRegistrationNumberParams = {
    country: string;
};

type QBDSetupErrorBodyParams = {
    conciergeLink: string;
};

type EmptyCategoriesSubtitleWithAccountingParams = {
    accountingPageURL: string;
};

type EmptyTagsSubtitleWithAccountingParams = {
    accountingPageURL: string;
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

type EnableContinuousReconciliationParams = {
    connectionName: string;
    accountingAdvancedSettingsLink: string;
};

type WorkspaceUpgradeNoteParams = {
    subscriptionLink: string;
};

type ChangedApproverMessageParams = {managerID: number};

type WorkflowSettingsParam = {workflowSettingLink: string};

type IndividualExpenseRulesSubtitleParams = {
    categoriesPageLink: string;
    tagsPageLink: string;
};

type BillableDefaultDescriptionParams = {
    tagsPageLink: string;
};

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

type DomainPermissionInfoRestrictionParams = {
    domain: string;
};

type SubmittedWithMemoParams = {
    memo?: string;
};

type DependentMultiLevelTagsSubtitleParams = {
    importSpreadsheetLink: string;
};

type PayAndDowngradeDescriptionParams = {
    formattedAmount: string;
};

type WalletAgreementParams = {
    walletAgreementUrl: string;
};

type ErrorODIntegrationParams = {
    oldDotPolicyConnectionsURL: string;
};

type SettlementAccountReconciliationParams = {
    settlementAccountUrl: string;
    lastFourPAN: string;
};

type DisconnectYourBankAccountParams = {
    bankName: string;
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

type FocusModeUpdateParams = {
    priorityModePageUrl: string;
};

export type {
    SettlementAccountReconciliationParams,
    ToggleImportTitleParams,
    ContactMethodsRouteParams,
    ContactMethodParams,
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
    TotalAmountGreaterOrLessThanOriginalParams,
    AuthenticationErrorParams,
    ImportMembersSuccessfulDescriptionParams,
    ImportedTagsMessageParams,
    ImportTagsSuccessfulDescriptionParams,
    MissingPropertyParams,
    InvalidPropertyParams,
    InvalidValueParams,
    ConnectionParams,
    IntegrationExportParams,
    RemovedFromApprovalWorkflowParams,
    DemotedFromWorkspaceParams,
    DefaultAmountParams,
    AutoPayApprovedReportsLimitErrorParams,
    FeatureNameParams,
    FileLimitParams,
    FileTypeParams,
    SpreadSheetColumnParams,
    SpreadFieldNameParams,
    AssignedCardParams,
    SpreadCategoriesParams,
    DelegateRoleParams,
    DelegatorParams,
    VacationDelegateParams,
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
    BillingBannerOwnerAmountOwedOverdueParams,
    BillingBannerDisputePendingParams,
    BillingBannerCardAuthenticationRequiredParams,
    BillingBannerInsufficientFundsParams,
    BillingBannerCardExpiredParams,
    BillingBannerCardOnDisputeParams,
    TrialStartedTitleParams,
    EarlyDiscountTitleParams,
    EarlyDiscountSubtitleParams,
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
    AlreadySignedInParams,
    ApprovedAmountParams,
    BeginningOfChatHistoryAdminRoomParams,
    BeginningOfChatHistoryAnnounceRoomParams,
    BeginningOfChatHistoryPolicyExpenseChatParams,
    BeginningOfChatHistoryInvoiceRoomParams,
    BeginningOfArchivedRoomParams,
    BeginningOfChatHistoryUserRoomParams,
    BeginningOfChatHistoryAnnounceRoomPartTwo,
    BeginningOfChatHistoryDomainRoomParams,
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
    GoBackMessageParams,
    SubmittedToVacationDelegateParams,
    LearnMoreRouteParams,
    HeldRequestParams,
    InstantSummaryParams,
    IssueVirtualCardParams,
    LocalTimeParams,
    LogSizeParams,
    LoggedInAsParams,
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
    PaidElsewhereParams,
    PaidWithExpensifyParams,
    ParentNavigationSummaryParams,
    PaySomeoneParams,
    PayerOwesAmountParams,
    DuplicateTransactionParams,
    PayerOwesParams,
    RoleNamesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    RemovedTheRequestParams,
    MovedFromReportParams,
    RenamedRoomActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsMergedParams,
    ReportPolicyNameParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    RequestAmountParams,
    RequestCountParams,
    DeleteTransactionParams,
    MovedTransactionParams,
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
    ChangeReportPolicyParams,
    ChangeTypeParams,
    ExportedToIntegrationParams,
    AccountOwnerParams,
    IntegrationsMessageParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UnshareParams,
    StripePaidParams,
    RemoveMembersWarningPrompt,
    ApprovalWorkflowErrorParams,
    ConnectionNameParams,
    LastSyncDateParams,
    CustomersOrJobsLabelParams,
    ExportAgainModalDescriptionParams,
    IntegrationSyncFailedParams,
    AddEmployeeParams,
    UpdateRoleParams,
    UpdatedCustomFieldParams,
    LeftWorkspaceParams,
    RemoveMemberParams,
    DateParams,
    FiltersAmountBetweenParams,
    StatementPageTitleParams,
    CompanyCardBankName,
    DisconnectPromptParams,
    DisconnectTitleParams,
    CharacterLengthLimitParams,
    OptionalParam,
    ImportedTypesParams,
    WorkspaceYouMayJoin,
    WorkspaceMemberList,
    ImportPerDiemRatesSuccessfulDescriptionParams,
    CurrencyCodeParams,
    WorkspaceLockedPlanTypeParams,
    CompanyNameParams,
    CustomUnitRateParams,
    ChatWithAccountManagerParams,
    UpdatedPolicyCurrencyParams,
    UpdatedPolicyFrequencyParams,
    UpdatedPolicyCategoryParams,
    UpdatedPolicyCategoryDescriptionHintTypeParams,
    UpdatedPolicyCategoryNameParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyFieldWithNewAndOldValueParams,
    UpdatedPolicyFieldWithValueParam,
    UpdatedPolicyDescriptionParams,
    EditDestinationSubtitleParams,
    FlightLayoverParams,
    WorkEmailResendCodeParams,
    WorkEmailMergingBlockedParams,
    NewWorkspaceNameParams,
    AddedOrDeletedPolicyReportFieldParams,
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
    PolicyExpenseChatNameParams,
    ReceiptPartnersUberSubtitleParams,
    YourPlanPriceValueParams,
    BusinessBankAccountParams,
    NeedCategoryForExportToIntegrationParams,
    UpdatedPolicyAuditRateParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyReimbursementEnabledParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    UpdatePolicyCustomUnitParams,
    AddOrDeletePolicyCustomUnitRateParams,
    AddedPolicyApprovalRuleParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyCategoryGLCodeParams,
    UpdatedPolicyCategoryMaxExpenseAmountParams,
    UpdatedPolicyCategoryExpenseLimitTypeParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    SubscriptionSettingsSummaryParams,
    BankAccountLastFourParams,
    ReviewParams,
    CreateExpensesParams,
    WorkspaceMembersCountParams,
    CurrencyInputDisabledTextParams,
    EmployeeInviteMessageParams,
    FlightParams,
    AirlineParams,
    RailTicketParams,
    TravelTypeParams,
    PhoneErrorRouteParams,
    WorkspacesListRouteParams,
    WorkspaceRouteParams,
    BusinessTaxIDParams,
    QBDSetupErrorBodyParams,
    EmptyCategoriesSubtitleWithAccountingParams,
    EmptyTagsSubtitleWithAccountingParams,
    SettlementAccountInfoParams,
    MergeSuccessDescriptionParams,
    MergeFailureUncreatedAccountDescriptionParams,
    MergeFailureDescriptionGenericParams,
    EnableContinuousReconciliationParams,
    WorkspaceUpgradeNoteParams,
    ChangedApproverMessageParams,
    WorkflowSettingsParam,
    MovedActionParams,
    IndividualExpenseRulesSubtitleParams,
    BillableDefaultDescriptionParams,
    WorkspaceShareNoteParams,
    RulesEnableWorkflowsParams,
    UpgradeSuccessMessageParams,
    DomainPermissionInfoRestrictionParams,
    SubmittedWithMemoParams,
    SignerInfoMessageParams,
    BusinessRegistrationNumberParams,
    DependentMultiLevelTagsSubtitleParams,
    PayAndDowngradeDescriptionParams,
    WalletAgreementParams,
    ErrorODIntegrationParams,
    DisconnectYourBankAccountParams,
    MergeAccountIntoParams,
    NextStepParams,
    ReportFieldParams,
    FocusModeUpdateParams,
    TagSelectionParams,
};
