type StepCounterParams = {step: number; total?: number; text?: string};

type ParentNavigationSummaryParams = {reportName?: string; workspaceName?: string};

type ChangeFieldParams = {oldValue?: string; newValue: string; fieldName: string};

type ExportedToIntegrationParams = {label: string; markedManually?: boolean; inProgress?: boolean; lastModified?: string};

type ViolationsInactiveVendorParams = {isSupplier?: boolean};

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

export type {
    ParentNavigationSummaryParams,
    StepCounterParams,
    ViolationsInactiveVendorParams,
    ChangeFieldParams,
    ExportedToIntegrationParams,
    IntegrationsMessageParams,
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UnshareParams,
};
