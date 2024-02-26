import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type Unit = 'mi' | 'km';

type Rate = {
    name?: string;
    rate?: number;
    currency?: string;
    customUnitRateID?: string;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    enabled?: boolean;
};

type Attributes = {
    unit: Unit;
};

type CustomUnit = {
    name: string;
    customUnitID: string;
    attributes: Attributes;
    rates: Record<string, Rate>;
    defaultCategory?: string;
    enabled?: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
};

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

// These types are for the Integration connections for a policy (eg. Quickbooks, Xero, etc).
// This data is not yet used in the codebase which is why it is given a very generic type, but the data is being put into Onyx for future use.
// Once the data is being used, these types should be defined appropriately.
type ConnectionLastSync = Record<string, unknown>;
type ConnectionData = Record<string, unknown>;
type ConnectionConfig = Record<string, unknown>;
type Connection = {
    lastSync?: ConnectionLastSync;
    data: ConnectionData;
    config: ConnectionConfig;
};

type AutoReportingOffset = number | ValueOf<typeof CONST.POLICY.AUTO_REPORTING_OFFSET>;

type Policy = {
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

    /** Error objects keyed by field name containing errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    /** Indicates the type of change made to the policy that hasn't been synced with the server yet  */
    pendingAction?: OnyxCommon.PendingAction;

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

    /** @deprecated Whether the self approval or submitting is enabled */
    isPreventSelfApprovalEnabled?: boolean;

    /** Whether the self approval or submitting is enabled */
    preventSelfApprovalEnabled?: boolean;

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

    /** Pending fields for the policy */
    pendingFields?: Record<string, OnyxCommon.PendingAction>;

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

    /** ReportID of the admins room for this workspace */
    chatReportIDAdmins?: number;

    /** ReportID of the announce room for this workspace */
    chatReportIDAnnounce?: number;

    /** All the integration connections attached to the policy */
    connections?: Record<string, Connection>;
};

export default Policy;

export type {Unit, CustomUnit, Attributes, Rate, TaxRate, TaxRates, TaxRatesWithDefault};
