import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type TwoFactorAuthStep = ValueOf<typeof CONST.TWO_FACTOR_AUTH_STEPS> | '';

type Account = {
    /** Whether SAML is enabled for the current account */
    isSAMLEnabled?: boolean;

    /** Whether SAML is required for the current account */
    isSAMLRequired?: boolean;

    /** Is this account having trouble receiving emails? */
    hasEmailDeliveryFailure?: boolean;

    /** URL to the assigned guide's appointment booking calendar */
    guideCalendarLink?: string;

    /** User recovery codes for setting up 2-FA */
    recoveryCodes?: string;

    /** Secret key to enable 2FA within the authenticator app */
    twoFactorAuthSecretKey?: string;

    /** Whether this account has 2FA enabled or not */
    requiresTwoFactorAuth?: boolean;

    /** Whether the account is validated */
    validated?: boolean;

    /** The primaryLogin associated with the account */
    primaryLogin?: string;

    /** The message to be displayed when code requested */
    message?: string;

    /** Accounts that are on a domain with an Approved Accountant */
    doesDomainHaveApprovedAccountant?: boolean;

    /** Form that is being loaded */
    loadingForm?: ValueOf<typeof CONST.FORMS>;

    /** Whether the user forgot their password */
    forgotPassword?: boolean;

    /** Whether the account exists */
    accountExists?: boolean;

    /** Is the account / domain under domain control? */
    domainControlled?: boolean;

    /** Whether the validation code has expired */
    validateCodeExpired?: boolean;

    /** Whether a sign is loading */
    isLoading?: boolean;

    errors?: OnyxCommon.Errors | null;
    success?: string;
    codesAreCopied?: boolean;
    twoFactorAuthStep?: TwoFactorAuthStep;
};

export default Account;
export type {TwoFactorAuthStep};
