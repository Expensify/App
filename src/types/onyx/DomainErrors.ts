import type * as OnyxCommon from './OnyxCommon';

/**
 * Basic errors for domain
 */
type GeneralDomainErrors = {
    /**
     * Base errors
     */
    errors: OnyxCommon.Errors;

    /**
     * Errors related to a specific domain vacation delegate
     */
    vacationDelegateErrors?: OnyxCommon.Errors;
};

/**
 * Collection of errors related to domain operations received from the backend
 */
type DomainErrors = {
    /**
     * Errors related to specific domain administrators, keyed by their adminID
     */
    adminErrors?: Record<number, GeneralDomainErrors>;

    /**
     * Errors related to specific domain member, keyed by their ID
     */
    memberErrors?: Record<number, GeneralDomainErrors>;

    /**
     * Errors related to the technical contact email
     */
    technicalContactEmailErrors?: OnyxCommon.Errors;

    /**
     * Errors related to the "use technical contact billing card" setting
     */
    useTechnicalContactBillingCardErrors?: OnyxCommon.Errors;

    /**
     * Errors for the domain itself
     */
    errors: OnyxCommon.Errors;
} & GeneralDomainErrors;

export default DomainErrors;
