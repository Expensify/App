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

        /** Whether the user validation code was re-sent */
        validateCodeResent?: boolean;

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

    /// All of the fields/attributes after this comment are currently being migrated from the User model into this Account model
    /// Please do not use any of it until the list of action tasks in the table at https://github.com/Expensify/App/issues/59277#issuecomment-2818283478 is fully completed

    /** Whether or not the user is subscribed to news updates */
    isSubscribedToNewsletter?: boolean;

    /** Whether we should use the staging version of the secure API server */
    shouldUseStagingServer?: boolean;

    /** Whether or not the user is on a public domain email account or not */
    isFromPublicDomain?: boolean;

    /** Whether or not the user uses expensify card */
    isUsingExpensifyCard?: boolean;

    /** Whether Expensify Card approval flow is ongoing - checking loginList for private domains */
    isCheckingDomain?: boolean;

    /** Whether or not the user has lounge access */
    hasLoungeAccess?: boolean;

    /** error associated with adding a secondary login */
    error?: string;

    /** Whether the user is an Expensify Guide */
    isGuide?: boolean;

    /** Whether the debug mode is currently enabled */
    isDebugModeEnabled?: boolean;

    /** If user has accesible policies on a private domain */
    hasAccessibleDomainPolicies?: boolean;
};

export default Account;
export type {DelegateRole, DelegatedAccess, Delegate};
