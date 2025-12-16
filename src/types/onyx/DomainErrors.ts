import type * as OnyxCommon from './OnyxCommon';

/**
 * Collection of errors related to domain operations received from the backend
 */
type DomainErrors = {
    /**
     * Errors related to specific domain administrators, keyed by their adminID
     */
    // eslint-disable-next-line jsdoc/require-jsdoc
    adminErrors?: Record<number, {errors: OnyxCommon.Errors}>;
};

export default DomainErrors;
