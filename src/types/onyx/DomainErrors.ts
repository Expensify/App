import type * as OnyxCommon from './OnyxCommon';

/**
 * Collection of errors related to domain operations received from the backend
 */
type DomainErrors = {
    /**
     * Errors related to specific domain administrators, keyed by their adminID
     */
    adminErrors?: Record<
        number,
        {
            /**
             *
             */
            errors: OnyxCommon.Errors;
        }
    >;

    /**
     * Errors related to the technical contact email
     */
    technicalContactEmailErrors?: OnyxCommon.Errors;
};

export default DomainErrors;
