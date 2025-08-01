import type * as OnyxCommon from './OnyxCommon';

/** Information about vacation delegate */
type VacationDelegate = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Email of the user that set the vacation delegate */
    creator?: string;

    /** Email of the vacation delegate */
    delegate?: string;

    /** Previous delegate for rollback on failure */
    previousDelegate?: string;

    /** Error message */
    errors?: OnyxCommon.Errors;
}>;

export default VacationDelegate;
