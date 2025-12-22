import type * as OnyxCommon from './OnyxCommon';

/**
 * Collection of errors related to domain operations received from the backend
 */
type DomainErrors = {
    /**
     * Errors related to the technical contact email
     */
    technicalContactEmailErrors?: OnyxCommon.Errors;

    /**
     * Errors related to the "use technical contact billing card" setting
     */
    useTechnicalContactBillingCardErrors?: OnyxCommon.Errors;

    /**
     * Errors related to the 2FA toggle
     */
    twoFactorAuthRequiredErrors?: OnyxCommon.Errors;
};

export default DomainErrors;
