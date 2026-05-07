import type * as OnyxCommon from './OnyxCommon';

/** Server side errors from 2FA code validation in domain 2FA settings */
type ValidateDomainTwoFactorCode = {
    /** Errors keyed by microtime */
    errors?: OnyxCommon.Errors;
};

export default ValidateDomainTwoFactorCode;
