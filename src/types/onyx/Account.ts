import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type DismissedReferralBanners from './DismissedReferralBanners';
import type * as OnyxCommon from './OnyxCommon';

/** Two factor authentication steps */
type TwoFactorAuthStep = ValueOf<typeof CONST.TWO_FACTOR_AUTH_STEPS> | '';

/** The role of the delegate */
type DelegateRole = ValueOf<typeof CONST.DELEGATE_ROLE>;

/** Model of delegate */
type Delegate = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The email of the delegate */
    email: string;

    /** The role of the delegate */
    role?: DelegateRole;

    /** Whether the user validation code was sent */
    validateCodeSent?: boolean;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    /** Whether the user is loading */
    isLoading?: boolean;

    /** The accountID of a delegate when they aren't in the personalDetails. */
    optimisticAccountID?: number;
}>;

/** Model of delegated access data */
type DelegatedAccess = {
    /** The users that can access your account as a delegate */
    delegates?: Delegate[];

    /** The the users you can access as a delegate */
    delegators?: Delegate[];

    /** The email of original user when they are acting as a delegate for another account */
    delegate?: string;

    /** Authentication failure errors when disconnecting as a copilot */
    errorFields?: OnyxCommon.ErrorFields;
};

/** Model of user account */
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

    /** Whether this account needs 2FA setup before it can be used. eg: 2FA is required when Xero integration is enabled */
    needsTwoFactorAuthSetup?: boolean;

    /** Whether the account is validated */
    validated?: boolean;

    /** The primaryLogin associated with the account */
    primaryLogin?: string;

    /** The message to be displayed when code requested */
    message?: string;

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

    /** Authentication failure errors */
    errors?: OnyxCommon.Errors | null;

    /** Authentication success message */
    success?: string;

    /** Whether the two factor authentication codes were copied */
    codesAreCopied?: boolean;

    /** Current two factor authentication step */
    twoFactorAuthStep?: TwoFactorAuthStep;

    /** Referral banners that the user dismissed */
    dismissedReferralBanners?: DismissedReferralBanners;

    /** Indicates whether the user is an approved accountant */
    isApprovedAccountant?: boolean;

    /** Indicates whether the user is a client of an approved accountant */
    isApprovedAccountantClient?: boolean;

    /** Indicates whether the user can downgrade current subscription plan */
    canDowngrade?: boolean;

    /** Indicates whether the user can downgrade current subscription plan */
    isEligibleForRefund?: boolean;

    /** Indicates whether the user has at least one previous purchase */
    hasPurchases?: boolean;

    /** The users you can access as delegate and the users who can access your account as a delegate */
    delegatedAccess?: DelegatedAccess;
};

export default Account;
export type {TwoFactorAuthStep, DelegateRole, DelegatedAccess, Delegate};
