import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type Unit = 'mi' | 'km';

type Rate = OnyxCommon.OnyxValueWithOfflineFeedback<{
    name?: string;
    rate?: number;
    currency?: string;
    customUnitRateID?: string;
    errors?: OnyxCommon.Errors;
    enabled?: boolean;
}>;

type Attributes = {
    unit: Unit;
};

type CustomUnit = OnyxCommon.OnyxValueWithOfflineFeedback<{
    name: string;
    customUnitID: string;
    attributes: Attributes;
    rates: Record<string, Rate>;
    defaultCategory?: string;
    enabled?: boolean;
    errors?: OnyxCommon.Errors;
}>;

type DisabledFields = {
    defaultBillable?: boolean;
    reimbursable?: boolean;
};

type TaxRate = {
    /** Name of the a tax rate. */
    name: string;

    /** The value of the tax rate as percentage. */
    value: string;

    /** The code associated with the tax rate. */
    code: string;

    /** This contains the tax name and tax value as one name */
    modifiedName: string;

    /** Indicates if the tax rate is disabled. */
    isDisabled?: boolean;
};

type TaxRates = Record<string, TaxRate>;

type TaxRatesWithDefault = {
    /** Name of the tax */
    name: string;

    /** Default policy tax code */
    defaultExternalID: string;

    /** Default value of taxes */
    defaultValue: string;

    /** Default foreign policy tax code */
    foreignTaxDefault: string;

    /** List of tax names and values */
    taxes: TaxRates;
};

type ConnectionLastSync = {
    successfulDate?: string;
    errorDate?: string;
    isSuccessful: boolean;
    source: 'DIRECT' | 'EXPENSIFYWEB' | 'EXPENSIFYAPI' | 'AUTOSYNC' | 'AUTOAPPROVE';
};

type Account = {
    glCode?: string;
    name: string;
    currency: string;
    id: string;
};

type Employee = {
    id: string;
    firstName?: string;
    lastName?: string;
    name: string;
    email: string;
};

type Vendor = {
    id: string;
    name: string;
    currency: string;
    email: string;
};

type TaxCode = {
    totalTaxRateVal: string;
    simpleName: string;
    taxCodeRef: string;
    taxRateRefs: Record<string, string>;
    name: string;
};

/**
 * Data imported from QuickBooks Online.
 */
type QBOConnectionData = {
    country: string;
    edition: string;
    homeCurrency: string;
    isMultiCurrencyEnabled: boolean;

    journalEntryAccounts: Account[];
    bankAccounts: Account[];
    creditCards: Account[];
    accountsReceivable: Account[];
    accountsPayable: Account[];
    otherCurrentAssetAccounts: Account[];

    taxCodes: TaxCode[];
    employees: Employee[];
    vendors: Vendor[];
};

type IntegrationEntityMap = 'NONE' | 'DEFAULT' | 'TAG' | 'REPORT_FIELD';

/**
 * User configuration for the QuickBooks Online accounting integration.
 */
type QBOConnectionConfig = {
    realmId: string;
    companyName: string;
    autoSync: {
        jobID: string;
        enabled: boolean;
    };
    syncPeople: boolean;
    syncItems: boolean;
    markChecksToBePrinted: boolean;
    reimbursableExpensesExportDestination: IntegrationEntityMap;
    nonReimbursableExpensesExportDestination: IntegrationEntityMap;

    reimbursableExpensesAccount?: string;
    nonReimbursableExpensesAccount?: string;
    autoCreateVendor: boolean;
    hasChosenAutoSyncOption: boolean;
    syncClasses: IntegrationEntityMap;
    syncCustomers: IntegrationEntityMap;
    syncLocations: IntegrationEntityMap;
    exportDate: string;
    lastConfigurationTime: number;
    syncTax: boolean;
    enableNewCategories: boolean;
    export: {
        exporter: string;
    };
};
type Connection<ConnectionData, ConnectionConfig> = {
    lastSync?: ConnectionLastSync;
    data: ConnectionData;
    config: ConnectionConfig;
};

type Connections = {
    quickbooksOnline: Connection<QBOConnectionData, QBOConnectionConfig>;
};

type AutoReportingOffset = number | ValueOf<typeof CONST.POLICY.AUTO_REPORTING_OFFSET>;

type PendingJoinRequestPolicy = {
    isJoinRequestPending: boolean;
    policyDetailsForNonMembers: Record<
        string,
        OnyxCommon.OnyxValueWithOfflineFeedback<{
            name: string;
            ownerAccountID: number;
            ownerEmail: string;
            type: ValueOf<typeof CONST.POLICY.TYPE>;
            avatar?: string;
        }>
    >;
};

type Policy = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** The ID of the policy */
        id: string;

        /** The name of the policy */
        name: string;

        /** The current user's role in the policy */
        role: ValueOf<typeof CONST.POLICY.ROLE>;

        /** The policy type */
        type: ValueOf<typeof CONST.POLICY.TYPE>;

        /** The email of the policy owner */
        owner: string;

        /** The accountID of the policy owner */
        ownerAccountID?: number;

        /** The output currency for the policy */
        outputCurrency: string;

        /** The URL for the policy avatar */
        avatar?: string;
        avatarURL?: string;

        /** Error objects keyed by field name containing errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;

        /** A list of errors keyed by microtime */
        errors?: OnyxCommon.Errors;

        /** Whether this policy was loaded from a policy summary, or loaded completely with all of its values */
        isFromFullPolicy?: boolean;

        /** When this policy was last modified */
        lastModified?: string;

        /** The custom units data for this policy */
        customUnits?: Record<string, CustomUnit>;

        /** Whether policy expense chats can be created and used on this policy. Enabled manually by CQ/JS snippet. Always true for free policies. */
        isPolicyExpenseChatEnabled: boolean;

        /** Whether the auto reporting is enabled */
        autoReporting?: boolean;

        /** The scheduled submit frequency set up on this policy */
        autoReportingFrequency?: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

        /** Whether the scheduled submit is enabled */
        harvesting?: {
            enabled: boolean;
        };

        /** @deprecated Whether the scheduled submit is enabled */
        isPreventSelfApprovalEnabled?: boolean;

        /** Whether the self approval or submitting is enabled */
        preventSelfApproval?: boolean;

        /** When the monthly scheduled submit should happen */
        autoReportingOffset?: AutoReportingOffset;

        /** The accountID of manager who the employee submits their expenses to on paid policies */
        submitsTo?: number;

        /** The employee list of the policy */
        employeeList?: [];

        /** The reimbursement choice for policy */
        reimbursementChoice?: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;

        /** The maximum report total allowed to trigger auto reimbursement. */
        autoReimbursementLimit?: number;

        /** Whether to leave the calling account as an admin on the policy */
        makeMeAdmin?: boolean;

        /** Original file name which is used for the policy avatar */
        originalFileName?: string;

        /** Alert message for the policy */
        alertMessage?: string;

        /** Informative messages about which policy members were added with primary logins when invited with their secondary login */
        primaryLoginsInvited?: Record<string, string>;

        /** Whether policy is updating */
        isPolicyUpdating?: boolean;

        /** The approver of the policy */
        approver?: string;

        /** The approval mode set up on this policy */
        approvalMode?: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>;

        /** Whether the auto approval is enabled */
        isAutoApprovalEnabled?: boolean;

        /** Whether transactions should be billable by default */
        defaultBillable?: boolean;

        /** The workspace description */
        description?: string;

        /** List of field names that are disabled */
        disabledFields?: DisabledFields;

        /** Whether new transactions need to be tagged */
        requiresTag?: boolean;

        /** Whether new transactions need to be categorized */
        requiresCategory?: boolean;

        /** Whether the workspace has multiple levels of tags enabled */
        hasMultipleTagLists?: boolean;

        /**
         * Whether or not the policy has tax tracking enabled
         *
         * @deprecated - use tax.trackingEnabled instead
         */
        isTaxTrackingEnabled?: boolean;

        /** Whether or not the policy has tax tracking enabled */
        tax?: {
            trackingEnabled: boolean;
        };

        /** Collection of tax rates attached to a policy */
        taxRates?: TaxRatesWithDefault;

        /** Email of the reimburser when reimbursement is set direct */
        reimburserEmail?: string;

        /** AccountID of the reimburser when reimbursement is set direct */
        reimburserAccountID?: number;

        /** ReportID of the admins room for this workspace */
        chatReportIDAdmins?: number;

        /** ReportID of the announce room for this workspace */
        chatReportIDAnnounce?: number;

        /** All the integration connections attached to the policy */
        connections?: Connections;

        /** Whether the Categories feature is enabled */
        areCategoriesEnabled?: boolean;

        /** Whether the Tags feature is enabled */
        areTagsEnabled?: boolean;

        /** Whether the Distance Rates feature is enabled */
        areDistanceRatesEnabled?: boolean;

        /** Whether the workflows feature is enabled */
        areWorkflowsEnabled?: boolean;

        /** Whether the Report Fields feature is enabled */
        areReportFieldsEnabled?: boolean;

        /** Whether the Connections feature is enabled */
        areConnectionsEnabled?: boolean;
    } & Partial<PendingJoinRequestPolicy>,
    'generalSettings' | 'addWorkspaceRoom'
>;

export default Policy;

export type {Unit, CustomUnit, Attributes, Rate, TaxRate, TaxRates, TaxRatesWithDefault, PendingJoinRequestPolicy};
