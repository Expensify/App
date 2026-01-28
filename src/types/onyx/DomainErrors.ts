import type * as OnyxCommon from './OnyxCommon';

/**
 * Basic errors for domain members
 */
type GeneralDomainMemberErrors = {
    /**
     * Base errors
     */
    errors: OnyxCommon.Errors;
};

/**
 * Collection of errors related to domain operations received from the backend
 */
type DomainErrors = {
    /**
     * Errors related to specific domain administrators, keyed by their adminID
     */
    adminErrors?: Record<number, GeneralDomainMemberErrors>;

    /**
     * Errors related to the technical contact email
     */
    technicalContactEmailErrors?: OnyxCommon.Errors;

    /**
     * Errors related to the "use technical contact billing card" setting
     */
    useTechnicalContactBillingCardErrors?: OnyxCommon.Errors;

    /**
     * Errors related to specific domain member, keyed by their accountID. memberErrors are keyed with user email, NOT accountID
     */
    memberErrors?: Record<string | number, GeneralDomainMemberErrors>;

    /**
     * Errors for the domain itself
     */
    errors: OnyxCommon.Errors;

    /**
     * Errors related to the 2FA toggle
     */
    twoFactorAuthRequiredErrors?: OnyxCommon.Errors;
};

export default DomainErrors;
