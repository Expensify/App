import CONST from '@src/CONST';
import type {Account} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const isValidateCodeFormSubmitting = (account: OnyxEntry<Account>) =>
    !!account?.isLoading && account.loadingForm === (account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM);

function isDelegateOnlySubmitter(account: OnyxEntry<Account>): boolean {
    const delegateEmail = account?.delegatedAccess?.delegate;
    const delegateRole = account?.delegatedAccess?.delegates?.find((delegate) => delegate.email === delegateEmail)?.role;

    return delegateRole === CONST.DELEGATE_ROLE.SUBMITTER;
}

/**
 * Check if the current user has validateCodeExtendedAccess
 *
 * This is a UX optimization to avoid asking for validation codes when the user
 * has recently provided one.
 * The backend performs an authoritative validation check using server-side time.
 *
 * @return true if the user has extended access, false otherwise
 */
/**
 * Whether the required-2FA overlay should be shown for the current account state.
 */
function shouldShowRequire2FAPage(account: OnyxEntry<Account>, hasCompletedGuidedSetupFlow: boolean): boolean {
    return (!!account?.needsTwoFactorAuthSetup && !account?.requiresTwoFactorAuth) || (!!account?.twoFactorAuthSetupInProgress && !hasCompletedGuidedSetupFlow);
}

/**
 * Whether the user is in the forced 2FA setup flow during incomplete onboarding
 * (domain-migration / required-2FA-before-onboarding scenario).
 */
function isForced2FAOnboardingSetup(account: OnyxEntry<Account>, hasCompletedGuidedSetupFlow: boolean): boolean {
    return !!account?.requiresTwoFactorAuth && !!account?.twoFactorAuthSetupInProgress && !hasCompletedGuidedSetupFlow;
}

function hasValidateCodeExtendedAccess(account: OnyxEntry<Account>): boolean {
    const extendedAccessTimestamp = account?.validateCodeExtendedAccessExpires;
    if (extendedAccessTimestamp) {
        // Convert timestamp from microseconds to milliseconds and compare with current time
        const extendedAccessExpiration = parseInt(extendedAccessTimestamp.toString(), 10) / 1000;
        if (Date.now() <= extendedAccessExpiration) {
            return true;
        }
    }

    return false;
}

export default {isValidateCodeFormSubmitting, isDelegateOnlySubmitter, shouldShowRequire2FAPage, isForced2FAOnboardingSetup, hasValidateCodeExtendedAccess};
