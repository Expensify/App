import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';

// A share received while signed out is kept out of navigation (see linkingConfig.filter) and parked here instead.
// It opens right after sign-in when the user doesn't have to onboard, or once onboarding finishes when they do.
type PendingShareIntent = 'none' | 'afterSignIn' | 'afterOnboarding';

let pendingShareIntent: PendingShareIntent = 'none';

function setPendingShareIntent() {
    pendingShareIntent = 'afterSignIn';
}

/**
 * Keeps a parked share closed until onboarding finishes, because the user is about to start onboarding.
 */
function holdPendingShareIntentForOnboarding() {
    if (pendingShareIntent !== 'afterSignIn') {
        return;
    }
    pendingShareIntent = 'afterOnboarding';
}

/**
 * Opens a share parked at sign-in, for a user who doesn't have to onboard. A share held for onboarding stays parked.
 */
function openPendingShareIntentAfterSignIn() {
    if (pendingShareIntent !== 'afterSignIn') {
        return;
    }
    pendingShareIntent = 'none';
    Navigation.isNavigationReady().then(() => Navigation.navigate(ROUTES.SHARE_ROOT));
}

/**
 * Opens a parked share once onboarding finishes. Returns whether a share was parked, so the caller can skip its usual
 * post-onboarding destination.
 */
function openPendingShareIntentAfterOnboarding(afterTransition?: () => void): boolean {
    if (pendingShareIntent === 'none') {
        return false;
    }
    pendingShareIntent = 'none';

    // OnboardingGuard sends every navigation back to onboarding until it sees the completed onboarding NVP, and its
    // redirect drops the share modal. The guard reads the NVP through its own connection, so we wait for the same signal.
    const connection = Onyx.connectWithoutView({
        key: ONYXKEYS.NVP_ONBOARDING,
        callback: (onboarding) => {
            if (!onboarding || !hasCompletedGuidedSetupFlowSelector(onboarding)) {
                return;
            }
            Onyx.disconnect(connection);
            Navigation.navigate(ROUTES.SHARE_ROOT, afterTransition ? {afterTransition} : undefined);
        },
    });
    return true;
}

export {setPendingShareIntent, holdPendingShareIntentForOnboarding, openPendingShareIntentAfterSignIn, openPendingShareIntentAfterOnboarding};
