import type CONST from '@src/CONST';

import type * as OnyxCommon from './OnyxCommon';

/** Workspace member custom field key types */
type CustomFieldType = keyof typeof CONST.CUSTOM_FIELD_KEYS;

/** Model of policy employee */
type PolicyEmployee = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Role of the user in the policy */
        role?: string;

        /** Custom field 1 of the member in the policy */
        employeeUserID?: string;

        /** Custom field 2 of the member in the policy */
        employeePayrollID?: string;

        email?: string;

        /** Determines if this employee should approve a report. If report total > approvalLimit, next approver will be 'overLimitForwardsTo', otherwise 'forwardsTo'. Set to null to clear. */
        approvalLimit?: number | null;

        /** Email of the user this user forwards all approved reports to (when report total under 'approvalLimit' or when 'overLimitForwardsTo' is not set) */
        forwardsTo?: string;

        /** Email of the user this user submits all reports to */
        submitsTo?: string;

        /** Email of the user this user forwards all reports to when the report total is over the 'approvalLimit' */
        overLimitForwardsTo?: string;

        /** Whether the member holds an active Expensify Card on this workspace, which blocks removing them from it */
        hasActiveExpensifyCard?: boolean;

        /** Whether the member is based in an office. When absent, the workspace default applies. */
        hasOfficeWorkArrangement?: boolean;

        /**
         * The office the member is assigned to, keyed in the workspace's officeLocations, or CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID
         * for the company address. When absent, or when its office was deleted, the workspace's primary office applies.
         */
        officeID?: string;

        /**
         * Errors from api calls on the specific user
         * {<timestamp>: 'error message', <timestamp2>: 'error message 2'}
         */
        errors?: OnyxCommon.Errors;

        /** Errors from api calls that changed a specific setting of the member, such as which categories they can use */
        errorFields?: OnyxCommon.ErrorFields<'categoryVisibility'>;
    },
    'categoryVisibility'
>;

/** Record of policy employees, indexed by their email */
type PolicyEmployeeList = Record<string, PolicyEmployee>;

export default PolicyEmployee;
export type {PolicyEmployeeList, CustomFieldType};
