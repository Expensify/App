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

    /** Whether domain validation is pending or has failed */
    validationPendingStatus?: 'pending' | 'error';

    /** Whether domain validation is pending */
    domainValidationError?: OnyxCommon.Errors;

    /** Whether validation code is currently loading or has failed */
    validateCodeLoadingStatus?: 'loading' | 'error';
}>;

export default Domain;
