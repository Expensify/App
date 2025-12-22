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
     * Errors for members
     */
    memberErrors?: Record<
        number,
        {
            /**
             * General member errors
             */
            errors: OnyxCommon.Errors;
        }
    >;
};

export default DomainErrors;
