import type * as OnyxCommon from './OnyxCommon';

/** Model of domain data */
type Domain = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether the domain is validated */
    validated: boolean;

    /** Account ID associated with the domain */
    accountID: number;

    /** Email address for the domain */
    email: string;

    /** Validation code for the domain */
    validateCode: string;

    /** Whether domain creation is pending */
    isCreationPending?: boolean;

    /** Whether domain validation is in progress */
    isValidationPending?: boolean;

    /** Errors that occurred when validating the domain */
    domainValidationError?: OnyxCommon.Errors;

    /** Whether validation code is currently being fetched */
    isValidateCodeLoading?: boolean;

    /** Errors that occurred when fetching validation code */
    validateCodeError?: OnyxCommon.Errors;
}>;

export default Domain;
