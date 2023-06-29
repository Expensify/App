import * as CommonTypes from './common';

type Account = CommonTypes.BaseState & {
    /** URL to the assigned guide's appointment booking calendar */
    guideCalendarLink: string;

    /** User recovery codes for setting up 2-FA */
    recoveryCodes?: string;

    /** Secret key to enable 2FA within the authenticator app */
    twoFactorAuthSecretKey?: string;

    /** Whether or not two factor authentication is required */
    requiresTwoFactorAuth: boolean;

    /** Whether the account is validated */
    validated: boolean;

    /** The primaryLogin associated with the account */
    primaryLogin: string;

    /** The message to be displayed when code requested */
    message?: string;

    /** Accounts that are on a domain with an Approved Accountant */
    doesDomainHaveApprovedAccountant?: boolean;
};

export default Account;
