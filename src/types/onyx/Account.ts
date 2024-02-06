import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type TwoFactorAuthStep = ValueOf<typeof CONST.TWO_FACTOR_AUTH_STEPS> | '';

type DismissedReferralBanners = {
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST]?: boolean;
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]?: boolean;
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY]?: boolean;
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]?: boolean;
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]?: boolean;
};

type Account = {
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

    /** The active policy ID. Initiating a SmartScan will create an expense on this policy by default. */
    activePolicyID?: string;

    errors?: OnyxCommon.Errors | null;
    success?: string;
    codesAreCopied?: boolean;
    twoFactorAuthStep?: TwoFactorAuthStep;
    dismissedReferralBanners?: DismissedReferralBanners;
};

export default Account;
export type {TwoFactorAuthStep, DismissedReferralBanners};
