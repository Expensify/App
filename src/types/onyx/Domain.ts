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

    /** Whether domain validation is pending */
    isValidationPending?: boolean;

    /** Errors that occurred when validating the domain */
    domainValidationError?: OnyxCommon.Errors;

    /** Whether validation code is currently being fetched */
    isValidateCodeLoading?: boolean;

    /** Errors that occurred when fetching validation code */
    validateCodeError?: OnyxCommon.Errors;

    /** Domain-related settings */
    settings: {
        /** Whether setting SAML enabled/disabled setting is in progress */
        isSamlEnabledLoading?: boolean;

        /** Whether setting SAML enabled/disabled setting has failed and why */
        samlEnabledError?: OnyxCommon.Errors;

        /** Whether setting SAML required setting is in progress */
        isSamlRequiredLoading?: boolean;

        /** Whether setting SAML required setting has failed and why */
        samlRequiredError?: OnyxCommon.Errors;

        /** Whether the SCIM token is currently being fetched */
        isScimTokenLoading: boolean;

        /** Whether fetching the SCIM token has failed and why */
        scimTokenError: OnyxCommon.Errors;
    };
}>;

/** Model of SAML metadata */
type SamlMetadata = {
    /** ... */
    nameFormat?: string;

    /** */
    entityID?: string;

    /** */
    urlLogin?: string;

    /** */
    urlLogout?: string;

    /** */
    metaService?: string;

    /** */
    metaIdentity?: string;

    /** Whether the SAML metadata is currently being fetched */
    isLoading?: boolean;
};

export {type SamlMetadata};

export default Domain;
