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

    /** When the backend clears the vacation delegate, as a UTC datetime (yyyy-MM-dd HH:mm:ss). No value means it never clears. */
    clearAfter?: string;

    /** Previous clearAfter for rollback on failure */
    previousClearAfter?: string;

    /** Workspaces the delegate is missing from, captured from the 305 response. Client-only. */
    policyDiff?: VacationDelegatePolicyDiff;

    /**
     * Delegate picked but not yet saved, because the 305 response left them waiting on the missing workspaces step.
     * Kept apart from `delegate` so an abandoned step never makes an unsaved pick read as saved. Client-only.
     */
    pendingDelegate?: string;

    /** Clear after datetime picked with `pendingDelegate`, so the missing workspaces step can send it again. Client-only. */
    pendingClearAfter?: string;
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
