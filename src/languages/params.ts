import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import type {DelegateRole} from '@src/types/onyx/Account';
import type {AllConnectionName, ConnectionName, PolicyConnectionSyncStage, SageIntacctMappingName} from '@src/types/onyx/Policy';
import type {ViolationDataType} from '@src/types/onyx/TransactionViolation';

type MultifactorAuthenticationTranslationParams = {
    authType?: string;
    registered?: boolean;
};

type ZipCodeExampleFormatParams = {
    zipSampleFormat: string;
};

type WelcomeEnterMagicCodeParams = {
    login: string;
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

type ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams = {
    policyName: string;
};

type CreatedReportForUnapprovedTransactionsParams = {
    reportUrl: string;
    reportName: string;
};

type WorkspacesListRouteParams = {
    workspacesListRoute: string;
};

type WorkspaceRouteParams = {
    workspaceRoute: string;
};

type UserSplitParams = {amount: string};

type PaidElsewhereParams = {payer?: string; comment?: string};

type WaitingOnBankAccountParams = {submitterDisplayName: string};

type MovedFromPersonalSpaceParams = {workspaceName?: string; reportName?: string};

type SizeExceededParams = {maxUploadSizeInMB: number};

type ResolutionConstraintsParams = {minHeightInPx: number; minWidthInPx: number; maxHeightInPx: number; maxWidthInPx: number};

type NotAllowedExtensionParams = {allowedExtensions: string[]};

type WeSentYouMagicSignInLinkParams = {login: string; loginType: string};

type StepCounterParams = {step: number; total?: number; text?: string};

type UserIsAlreadyMemberParams = {login: string; name: string};

type ParentNavigationSummaryParams = {reportName?: string; workspaceName?: string};

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
    connectionLink?: string;
    isPersonalCard?: boolean;
    isMarkAsCash?: boolean;
};

type ViolationsTagOutOfPolicyParams = {tagName?: string} | undefined;

type ViolationsProhibitedExpenseParams = {prohibitedExpenseTypes: string | string[]};

type ViolationsTaxOutOfPolicyParams = {taxName?: string} | undefined;

type OptionalParam<T> = Partial<T>;

type LogSizeAndDateParams = {size: number; date: string};

type ChangeFieldParams = {oldValue?: string; newValue: string; fieldName: string};

type UpdatedPolicyCategoryMaxAmountNoReceiptParams = {categoryName: string; oldValue?: string; newValue: string};

type UpdatedPolicyTaxParams = {taxName: string; oldValue?: string | boolean | number; newValue?: string | boolean | number; updatedField?: string};

type UpdatedPolicyTagParams = {tagListName: string; tagName?: string; enabled?: boolean; count?: string};

type UpdatedPolicyTagNameParams = {oldName: string; newName: string; tagListName: string};

type UpdatedPolicyTagFieldParams = {oldValue?: string; newValue: string; tagName: string; tagListName: string; updatedField: string};

type UpdatedPolicyTagListParams = {tagListName: string};

type UpdatedPolicyTagListRequiredParams = {tagListsName: string; isRequired: boolean};

type UpdatePolicyCustomUnitTaxEnabledParams = {newValue: boolean};

type ImportPolicyCustomUnitRatesParams = {customUnitName: string};

type UpdatePolicyCustomUnitDefaultCategoryParams = {customUnitName: string; newValue?: string; oldValue?: string};

type UpdatePolicyCustomUnitParams = {oldValue: string; newValue: string; customUnitName: string; updatedField: string};

type UpdatedPolicyCustomUnitSubRateParams = {customUnitName: string; customUnitRateName: string; customUnitSubRateName: string; oldValue: string; newValue: string; updatedField: string};

type RemovedPolicyCustomUnitSubRateParams = {customUnitName: string; customUnitRateName: string; removedSubRateName: string};

type AddedOrDeletedPolicyReportFieldParams = {fieldType: string; fieldName?: string};

type UpdatedPolicyReportFieldDefaultValueParams = {fieldName?: string; defaultValue?: string};

type UpdatedPolicyApprovalRuleParams = {oldApproverEmail: string; oldApproverName?: string; newApproverEmail: string; newApproverName?: string; field: string; name: string};

type UpdatedPolicyPreventSelfApprovalParams = {oldValue: string; newValue: string};

type UpdatedPolicyOwnershipParams = {oldOwnerEmail: string; oldOwnerName: string; policyName: string};

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

type UpdatedPolicyManualApprovalThresholdParams = {oldLimit: string; newLimit: string};

type UpdatedPolicyReimbursementEnabledParams = {enabled: boolean};

type UpdatedPolicyCustomTaxNameParams = {oldName: string; newName: string};

type UpdatedPolicyCurrencyDefaultTaxParams = {oldName: string; newName: string};

type UpdatedPolicyForeignCurrencyDefaultTaxParams = {oldName: string; newName: string};

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

type MarkReimbursedFromIntegrationParams = {amount: string; currency: string};

type ShareParams = {to: string};

type UnshareParams = {to: string};

type ConnectionNameParams = {
    connectionName: AllConnectionName;
};

type ExportAgainModalDescriptionParams = {
    reportName: string;
    connectionName: ConnectionName;
};

type UpdateRoleParams = {email: string; currentRole: string; newRole: string};

type RemoveMemberParams = {email: string; role: string};

type StatementPageTitleParams = {year: string | number; monthName: string};

type DisconnectPromptParams = {currentIntegration?: ConnectionName} | undefined;

type DisconnectTitleParams = {integration?: ConnectionName} | undefined;

type AmountWithCurrencyParams = {amountWithCurrency: string};

type LowerUpperParams = {lower: string; upper: string};

type UpdatedPolicyCategoriesParams = {count: number};

type WorkspaceMembersCountParams = {count: number};

type WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams = {workspaceOwnerName: string};

type YourPlanPriceParams = {lower: string; upper: string};

type YourPlanPriceValueParams = {price: string};

type ExportIntegrationSelectedParams = {connectionName: ConnectionName};

type IntacctMappingTitleParams = {mappingName: SageIntacctMappingName};

type SyncStageNameConnectionsParams = {stage: PolicyConnectionSyncStage};

type DelegateRoleParams = {role: DelegateRole};

type VacationDelegateParams = {nameOrEmail: string};

type RemovedFromApprovalWorkflowParams = {
    submittersNames: string[];
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

type CustomUnitRateParams = {
    rate: number;
};

type WorkspaceUpgradeNoteParams = {
    subscriptionLink: string;
};

type WorkflowSettingsParam = {workflowSettingLink: string};

type WorkspaceShareNoteParams = {
    adminsRoomLink: string;
};

type UpgradeSuccessMessageParams = {
    policyName: string;
    subscriptionLink: string;
};

type WalletAgreementParams = {
    walletAgreementUrl: string;
};

type NextStepParams = {
    actor: string;
    actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>;
    eta?: string;
    etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>;
};

type ConciergeBrokenCardConnectionParams = {
    cardName: string;
    connectionLink?: string;
};

export type {
    MissingPropertyParams,
    InvalidPropertyParams,
    InvalidValueParams,
    RemovedFromApprovalWorkflowParams,
    DelegateRoleParams,
    VacationDelegateParams,
    SyncStageNameConnectionsParams,
    IntacctMappingTitleParams,
    ExportIntegrationSelectedParams,
    YourPlanPriceParams,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    UpdatedPolicyCategoriesParams,
    AmountWithCurrencyParams,
    LowerUpperParams,
    LogSizeAndDateParams,
    BeginningOfChatHistoryAnnounceRoomPartTwo,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    MovedFromPersonalSpaceParams,
    NotAllowedExtensionParams,
    ParentNavigationSummaryParams,
    PaidElsewhereParams,
    ConciergeBrokenCardConnectionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    CreatedReportForUnapprovedTransactionsParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ResolutionConstraintsParams,
    SizeExceededParams,
    StepCounterParams,
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
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UnshareParams,
    ConnectionNameParams,
    ExportAgainModalDescriptionParams,
    UpdateRoleParams,
    RemoveMemberParams,
    StatementPageTitleParams,
    DisconnectPromptParams,
    DisconnectTitleParams,
    OptionalParam,
    WorkspaceYouMayJoin,
    WorkspaceMemberList,
    WorkspaceLockedPlanTypeParams,
    CustomUnitRateParams,
    UpdatedPolicyTagListParams,
    UpdatedPolicyTagListRequiredParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyTimeEnabledParams,
    UpdatedPolicyTimeRateParams,
    WorkEmailResendCodeParams,
    WorkEmailMergingBlockedParams,
    UpdatedPolicyTagParams,
    UpdatedPolicyTaxParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    RemovedPolicyCustomUnitSubRateParams,
    UpdatedPolicyCustomUnitSubRateParams,
    YourPlanPriceValueParams,
    AddedOrDeletedPolicyReportFieldParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyReimbursementEnabledParams,
    UpdatedPolicyCustomTaxNameParams,
    UpdatedPolicyCurrencyDefaultTaxParams,
    UpdatedPolicyForeignCurrencyDefaultTaxParams,
    UpdatedPolicyReimburserParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    ImportPolicyCustomUnitRatesParams,
    UpdatePolicyCustomUnitDefaultCategoryParams,
    UpdatePolicyCustomUnitParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    WorkspaceMembersCountParams,
    WorkspacesListRouteParams,
    WorkspaceRouteParams,
    AddBudgetParams,
    UpdatedBudgetParams,
    DeleteBudgetParams,
    AddOrDeletePolicyCustomUnitRateParams,
    WorkspaceUpgradeNoteParams,
    WorkflowSettingsParam,
    WorkspaceShareNoteParams,
    UpgradeSuccessMessageParams,
    WalletAgreementParams,
    NextStepParams,
    UpdatedPolicyOwnershipParams,
    UpdatedPolicyAutoHarvestingParams,
    UpdatedPolicyBudgetNotificationParams,
    UpdatedPolicyReimbursementChoiceParams,
    UpdatedPolicyDefaultTitleParams,
    MultifactorAuthenticationTranslationParams,
};
