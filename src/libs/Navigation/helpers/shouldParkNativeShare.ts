import {registerSessionCleanupCallback} from '@libs/SessionCleanup';
import {didUserLogInDuringSession} from '@libs/SessionUtils';

/** Whether onboarding has been ruled out, or has finished, for the current session. */
let isOnboardingSettled = false;

function markOnboardingSettledForNativeShare() {
    isOnboardingSettled = true;
}

/**
 * Whether a native share (`share/root`) that arrives now has to be parked instead of opening straight away:
 * - nobody is signed in, or
 * - the user signed in during this session and it is not known yet whether onboarding comes first.
 *
 * Being signed in is not enough on its own. HybridApp hands the share link to JS only once the user is signed in, while
 * OpenApp is still loading the account, and a share opened then is torn down as soon as onboarding starts. A session
 * that was already signed in at startup has its onboarding status on disk, so its shares open straight away.
 */
function shouldParkNativeShare(isAuthenticated: boolean): boolean {
    return !isAuthenticated || (didUserLogInDuringSession() && !isOnboardingSettled);
}

registerSessionCleanupCallback(() => {
    isOnboardingSettled = false;
});

export default shouldParkNativeShare;
export {markOnboardingSettledForNativeShare};
