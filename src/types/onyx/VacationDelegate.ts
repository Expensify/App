import type * as OnyxCommon from './OnyxCommon';

/** Workspaces the vacation delegate is missing from, captured from a SetVacationDelegate 305 response */
type VacationDelegatePolicyDiff = {
    /** Policy IDs the current user administers, but the delegate is not a member of */
    adminPolicies: string[];

    /** Policy IDs the current user is a non-admin member of, but the delegate is not a member of */
    nonAdminPolicies: string[];
};

/** Base vacation delegate information */
type BaseVacationDelegate = {
    /** Email of the user that set the vacation delegate */
    creator?: string;

    /** Email of the vacation delegate */
    delegate?: string;

    /** Array of emails for users that the current user is delegating for */
    delegatorFor?: string[];

    /** Previous delegate for rollback on failure */
    previousDelegate?: string;

    /** Workspaces the delegate is missing from, captured from the 305 response. Client-only. */
    policyDiff?: VacationDelegatePolicyDiff;
};

/** Information about vacation delegate with offline feedback */
type VacationDelegate = OnyxCommon.OnyxValueWithOfflineFeedback<
    BaseVacationDelegate & {
        /** Error message */
        errors?: OnyxCommon.Errors;
    }
>;

export default VacationDelegate;
export type {BaseVacationDelegate, VacationDelegatePolicyDiff};
