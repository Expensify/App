import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import type {DelegateRole} from '@src/types/onyx/Account';
import type {AllConnectionName, ConnectionName, PolicyConnectionSyncStage, SageIntacctMappingName} from '@src/types/onyx/Policy';
import type {ViolationDataType} from '@src/types/onyx/TransactionViolation';

type EditActionParams = {
    action: OnyxInputOrEntry<ReportAction>;
};

type DeleteActionParams = {
    action: OnyxInputOrEntry<ReportAction>;
};

type DeleteConfirmationParams = {
    action: OnyxInputOrEntry<ReportAction>;
};

type ReportArchiveReasonsClosedParams = {
    displayName: string;
};

type ReportArchiveReasonsMergedParams = {
    displayName: string;
    oldDisplayName: string;
};

type ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams = {
    policyName: string;
};

type ReportArchiveReasonsRemovedFromPolicyParams = {
    displayName: string;
    policyName: string;
    shouldUseYou?: boolean;
};

type CreatedReportForUnapprovedTransactionsParams = {
    reportUrl: string;
    reportName: string;
    reportID: string;
    isReportDeleted: boolean;
};

type PaidElsewhereParams = {payer?: string; comment?: string};

type MovedFromPersonalSpaceParams = {workspaceName?: string; reportName?: string};

type ResolutionConstraintsParams = {minHeightInPx: number; minWidthInPx: number; maxHeightInPx: number; maxWidthInPx: number};

type SizeExceededParams = {maxUploadSizeInMB: number};

type NotAllowedExtensionParams = {allowedExtensions: string[]};

type StepCounterParams = {step: number; total?: number; text?: string};

type UserIsAlreadyMemberParams = {login: string; name: string};

type ParentNavigationSummaryParams = {reportName?: string; workspaceName?: string};

type UpdatedTheRequestParams = {valueName: string; newValueToDisplay: string; oldValueToDisplay: string};

type UpdatedTheDistanceMerchantParams = {translatedChangedField: string; newMerchant: string; oldMerchant: string; newAmountToDisplay: string; oldAmountToDisplay: string};

type ViolationsMissingTagParams = {tagName?: string} | undefined;

type ViolationsModifiedAmountParams = {type?: ViolationDataType; displayPercentVariance?: number};

type ViolationsIncreasedDistanceParams = {formattedRouteDistance?: string};

type OptionalParam<T> = Partial<T>;

type LogSizeAndDateParams = {size: number; date: string};

type ChangeFieldParams = {oldValue?: string; newValue: string; fieldName: string};

type UpdatedPolicyCategoryMaxAmountNoReceiptParams = {categoryName: string; oldValue?: string; newValue: string};

type UpdatePolicyCustomUnitDefaultCategoryParams = {customUnitName: string; newValue?: string; oldValue?: string};

type UpdatePolicyCustomUnitParams = {oldValue: string; newValue: string; customUnitName: string; updatedField: string};

type AddedOrDeletedPolicyReportFieldParams = {fieldType: string; fieldName?: string; defaultValue?: string};

type UpdatedPolicyApprovalRuleParams = {oldApproverEmail: string; oldApproverName?: string; newApproverEmail: string; newApproverName?: string; field: string; name: string};

type UpdatedPolicyManualApprovalThresholdParams = {oldLimit: string; newLimit: string};

type UpdatedPolicyCustomTaxNameParams = {oldName: string; newName: string};

type UpdatedPolicyCurrencyDefaultTaxParams = {oldName: string; newName: string};

type UpdatedPolicyForeignCurrencyDefaultTaxParams = {oldName: string; newName: string};

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

type UnsupportedFormulaValueErrorParams = {
    value: string;
};

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

type LowerUpperParams = {lower: string; upper: string};

type YourPlanPriceParams = {lower: string; upper: string};

type ExportIntegrationSelectedParams = {connectionName: ConnectionName};

type IntacctMappingTitleParams = {mappingName: SageIntacctMappingName};

type SyncStageNameConnectionsParams = {stage: PolicyConnectionSyncStage};

type DelegateRoleParams = {role: DelegateRole};

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

type WorkspaceLockedPlanTypeParams = {
    count: number;
    annualSubscriptionEndDate: string;
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
    SyncStageNameConnectionsParams,
    IntacctMappingTitleParams,
    ExportIntegrationSelectedParams,
    YourPlanPriceParams,
    LowerUpperParams,
    LogSizeAndDateParams,
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
    UserIsAlreadyMemberParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    ViolationsIncreasedDistanceParams,
    ChangeFieldParams,
    ExportedToIntegrationParams,
    IntegrationsMessageParams,
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UnshareParams,
    UnsupportedFormulaValueErrorParams,
    ConnectionNameParams,
    ExportAgainModalDescriptionParams,
    UpdateRoleParams,
    RemoveMemberParams,
    StatementPageTitleParams,
    DisconnectPromptParams,
    DisconnectTitleParams,
    OptionalParam,
    WorkspaceLockedPlanTypeParams,
    AddedOrDeletedPolicyReportFieldParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyCustomTaxNameParams,
    UpdatedPolicyCurrencyDefaultTaxParams,
    UpdatedPolicyForeignCurrencyDefaultTaxParams,
    UpdatePolicyCustomUnitDefaultCategoryParams,
    UpdatePolicyCustomUnitParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    AddBudgetParams,
    UpdatedBudgetParams,
    DeleteBudgetParams,
    AddOrDeletePolicyCustomUnitRateParams,
};
