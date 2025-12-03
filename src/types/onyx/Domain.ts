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

    /** Whether setting SAML enabled/disabled setting is in progress */
    isSamlEnabledLoading?: boolean;

    /** Whether setting SAML enabled/disabled setting has failed and why */
    samlEnabledError?: OnyxCommon.Errors;

    /** Whether setting SAML required setting is in progress */
    isSamlRequiredLoading?: boolean;

    /** Whether setting SAML required setting has failed and why */
    samlRequiredError?: OnyxCommon.Errors;
}>;

/** Model of SAML metadata */
type SamlMetadata = {
    /**
     * The format of the name identifier to be used in SAML assertions
     * Common formats include 'emailAddress' for email addresses or 'persistent' for persistent pseudonymous identifiers.
     */
    nameFormat?: string;

    /**
     * The unique identifier for the SAML entity (typically a URI)
     * It is used to identify the issuer of a SAML request or the intended recipient of a SAML response.
     */
    entityID?: string;

    /** The URL to which users should be redirected for SAML-based authentication (SAML login endpoint) */
    urlLogin?: string;

    /**
     * The URL to which users can be redirected for logging out (SAML logout endpoint)
     * This is used to initiate the single logout process.
     */
    urlLogout?: string;

    /**
     * SAML metadata of the service provider
     * This metadata includes keys and endpoints needed to establish the service provider in a SAML exchange.
     */
    metaService?: string;

    /**
     * SAML metadata of the identity provider
     * This metadata includes keys and endpoints necessary for the identity provider to participate in SAML exchanges.
     */
    metaIdentity?: string;

    /** Whether the SAML metadata is currently being fetched */
    isLoading?: boolean;

    /** Whether fetching the SAML metadata has failed and why */
    errors: OnyxCommon.Errors;

    /** Whether setting SAML metadata failed and why */
    samlMetadataError: OnyxCommon.Errors;
};

export {type SamlMetadata};

export default Domain;
