import type CONST from '@src/CONST';
import type PrefixedRecord from '@src/types/utils/PrefixedRecord';
import type * as OnyxCommon from './OnyxCommon';
import type SecurityGroup from './SecurityGroup';
import type {BaseVacationDelegate} from './VacationDelegate';

/** Model of domain data */
type Domain = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether the domain is validated */
    validated: boolean;

    /** Account ID associated with the domain */
    accountID: number;

    /** Email address for the domain */
    email: string;

    /** Validation code for the domain */
    validateCode?: string;

    /** Whether domain validation is pending */
    isValidationPending?: boolean;

    /** Whether domain validation has succeeded */
    hasValidationSucceeded?: boolean;

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

    /** ID of the default security group for the domain */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    domain_defaultSecurityGroupID: string;
}> &
    PrefixedRecord<typeof CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX, number> &
    PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, DomainSecurityGroup> &
    PrefixedRecord<typeof CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX, BaseVacationDelegate>;

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

/** Model of Security Group data */
type DomainSecurityGroup = SecurityGroup & {
    /**
     * A map of member account IDs
     * Key: The accountID of the member
     */
    shared: Record<string, 'read' | null>;
};

export {type SamlMetadata, type DomainSecurityGroup};

export default Domain;
