import type * as OnyxCommon from './OnyxCommon';

/**
 * Basic errors for domain admins
 */
type GeneralDomainAdminErrors = {
    /**
     * Base pending actions
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
    adminErrors?: Record<number, GeneralDomainAdminErrors>;

    /**
     * Errors related to the technical contact email
     */
    technicalContactEmailErrors?: OnyxCommon.Errors;

    /**
     * Errors related to the "use technical contact billing card" setting
     */
    useTechnicalContactBillingCardErrors?: OnyxCommon.Errors;
};

export default DomainErrors;
