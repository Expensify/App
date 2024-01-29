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
    pendingAction?: string;
};

type Attributes = {
    unit: Unit;
};

type CustomUnit = {
    name: string;
    customUnitID: string;
    attributes: Attributes;
    rates: Record<string, Rate>;
    pendingAction?: string;
    errors?: OnyxCommon.Errors;
};

type DisabledFields = {
    defaultBillable?: boolean;
    reimbursable?: boolean;
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

    /** Whether chat rooms can be created and used on this policy. Enabled manually by CQ/JS snippet. Always true for free policies. */
    areChatRoomsEnabled: boolean;

    /** Whether policy expense chats can be created and used on this policy. Enabled manually by CQ/JS snippet. Always true for free policies. */
    isPolicyExpenseChatEnabled: boolean;

    /** Whether the auto reporting is enabled */
    autoReporting?: boolean;

    /** The scheduled submit frequency set up on the this policy */
    autoReportingFrequency?: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

    /** Whether the scheduled submit is enabled */
    isHarvestingEnabled?: boolean;

    /** Whether the scheduled submit is enabled */
    isPreventSelfApprovalEnabled?: boolean;

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
    pendingFields?: Record<string, unknown>;

    /** Original file name which is used for the policy avatar */
    originalFileName?: string;

    /** Alert message for the policy */
    alertMessage?: string;

    /** Informative messages about which policy members were added with primary logins when invited with their secondary login */
    primaryLoginsInvited?: Record<string, string>;

    /** The approval mode set up on this policy */
    approvalMode?: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>;

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

    /** When tax tracking is enabled */
    isTaxTrackingEnabled?: boolean;
};

export default Policy;

export type {Unit, CustomUnit};
