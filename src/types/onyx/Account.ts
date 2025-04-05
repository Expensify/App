import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type DismissedReferralBanners from './DismissedReferralBanners';
import type * as OnyxCommon from './OnyxCommon';

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

    /** Whether the user is loading */
    isLoading?: boolean;

    /** The accountID of a delegate when they aren't in the personalDetails. */
    optimisticAccountID?: number;
}>;

/** Delegate errors */
type DelegateErrors = {
    /** Errors while adding a delegate keyed by email */
    addDelegate?: Record<string, OnyxCommon.Errors>;

    /** Errors while updating a delegate's role keyed by email */
    updateDelegateRole?: Record<string, OnyxCommon.Errors>;

    /** Errors while removing a delegate keyed by email */
    removeDelegate?: Record<string, OnyxCommon.Errors>;

    /** Errors while connecting as a delegate keyed by email */
    connect?: Record<string, OnyxCommon.Errors>;

    /** Errors while disconnecting as a delegate. No email needed here. */
    disconnect?: OnyxCommon.Errors;
};

/** Model of delegated access data */
type DelegatedAccess = {
    /** The users that can access your account as a delegate */
    delegates?: Delegate[];

    /** The the users you can access as a delegate */
    delegators?: Delegate[];

    /** The email of original user when they are acting as a delegate for another account */
    delegate?: string;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: DelegateErrors;
};

/** Model of SMS delivery failure status */
type SMSDeliveryFailureStatus = {
    /** Whether the account is having trouble receiving SMS */
    hasSMSDeliveryFailure: boolean;

    /** The message associated with the SMS delivery failure */
    message: string;

    /** Indicates whether the SMS delivery failure status has been reset by an API call */
    isReset?: boolean;

    /** Whether a sign is loading */
    isLoading?: boolean;
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

    /** The Report ID of the admins room */
    adminsRoomReportID?: string;

    /** The Account ID of the account manager */
    accountManagerAccountID?: string;

    /** The Report ID of the account manager */
    accountManagerReportID?: string;

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

    /** Errors related to specific account fields */
    errorFields?: OnyxCommon.ErrorFields;

    /** Authentication success message */
    success?: string;

    /** Whether the two factor authentication codes were copied */
    codesAreCopied?: boolean;

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

    /** Indicates SMS delivery failure status and associated information */
    smsDeliveryFailureStatus?: SMSDeliveryFailureStatus;

    /** The guide details of the account */
    guideDetails?: {
        /** The email of the guide details */
        email: string;
        /** The calendar link of the guide details */
        calendarLink: string;
    };

    /** Model of the getValidateCodeForAccountMerge API call */
    getValidateCodeForAccountMerge?: {
        /** Whether the validation code was sent */
        isLoading?: boolean;

        /** Whether the user validation code was sent */
        validateCodeSent?: boolean;

        /** Errors while requesting the validation code */
        errors: OnyxCommon.Errors;
    };

    /** Model of the mergeWithValidateCode API call */
    mergeWithValidateCode?: {
        /** Whether the API call is loading */
        isLoading?: boolean;

        /** Whether the account was merged successfully */
        isAccountMerged?: boolean;

        /** Errors while merging the account */
        errors: OnyxCommon.Errors;
    };
};

export default Account;
export type {DelegateRole, DelegatedAccess, Delegate};
