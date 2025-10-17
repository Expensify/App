/** Model of domain data */
type Domain = {
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

    /** Whether domain validation is pending */
    isValidationPending?: boolean;

    /** Whether validation code is currently loading */
    isValidateCodeLoading?: boolean;
};

export default Domain;
