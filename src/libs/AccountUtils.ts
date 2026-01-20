import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Account} from '@src/types/onyx';

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

export default {isValidateCodeFormSubmitting, isDelegateOnlySubmitter, hasValidateCodeExtendedAccess};
