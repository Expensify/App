import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';

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

type ReportArchiveReasonsRemovedFromPolicyParams = {
    displayName: string;
    policyName: string;
    shouldUseYou?: boolean;
};

type ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams = {
    policyName: string;
};

type ResolutionConstraintsParams = {minHeightInPx: number; minWidthInPx: number; maxHeightInPx: number; maxWidthInPx: number};

type SizeExceededParams = {maxUploadSizeInMB: number};

type NotAllowedExtensionParams = {allowedExtensions: string[]};

type StepCounterParams = {step: number; total?: number; text?: string};

type ParentNavigationSummaryParams = {reportName?: string; workspaceName?: string};

type ViolationsIncreasedDistanceParams = {formattedRouteDistance?: string};

type ChangeFieldParams = {oldValue?: string; newValue: string; fieldName: string};

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

type MarkReimbursedFromIntegrationParams = {amount: string; currency: string};

type ShareParams = {to: string};

type UnsupportedFormulaValueErrorParams = {
    value: string;
};

type UnshareParams = {to: string};

type RemovedFromApprovalWorkflowParams = {
    submittersNames: string[];
};

type WorkspaceLockedPlanTypeParams = {
    count: number;
    annualSubscriptionEndDate: string;
};

export type {
    RemovedFromApprovalWorkflowParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    ParentNavigationSummaryParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    NotAllowedExtensionParams,
    ResolutionConstraintsParams,
    SizeExceededParams,
    StepCounterParams,
    ViolationsIncreasedDistanceParams,
    ChangeFieldParams,
    ExportedToIntegrationParams,
    IntegrationsMessageParams,
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UnshareParams,
    UnsupportedFormulaValueErrorParams,
    WorkspaceLockedPlanTypeParams,
};
