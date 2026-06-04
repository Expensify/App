import type * as OnyxCommon from './OnyxCommon';

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
};

/** Information about vacation delegate with offline feedback */
type VacationDelegate = OnyxCommon.OnyxValueWithOfflineFeedback<
    BaseVacationDelegate & {
        /** Error message */
        errors?: OnyxCommon.Errors;
    }
>;

export default VacationDelegate;
export type {BaseVacationDelegate};
