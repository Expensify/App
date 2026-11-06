import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {registerSessionCleanupCallback} from '@libs/SessionCleanup';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ShareTempFile} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

/**
 * A native share (`share/root`) that arrived while the user was signed out. The share extensions stage the file natively
 * and open the app through a plain deep link, so a signed-out share has to be handed over to the signed-in app once it
 * is known whether onboarding will open first:
 * - `pending`: captured; opened by useOnboardingFlowRouter as soon as it decides onboarding is not needed.
 * - `deferredUntilOnboardingExit`: the user needs onboarding; opened by the onboarding exit on top of the landing screen.
 * - `opening`: the share flow has been pushed; consumed once ShareModalNavigator is actually in the root state.
 * Kept in memory on purpose: the staged file does not survive a process restart, and the intent must never replay for
 * the next account that signs in (it is cleared on sign-out below).
 *
 * This is separate from `setDeepLinkToOpenAfterOnboarding`: that parks a route inside the report deep-link replay and
 * opens it instead of the post-onboarding landing, and only an onboarding exit consumes it. The share is a modal that
 * belongs on top of whatever screen the user lands on, it must also open for accounts that never go through onboarding,
 * and parking it before the replay keeps it off the replay's timing (a share replayed before OpenApp lands is evicted
 * by the onboarding redirect).
 */
type PendingNativeShare = 'none' | 'pending' | 'deferredUntilOnboardingExit' | 'opening';

/** Root modals a navigation guard redirects the share push into, or blocks it behind, until the user dismisses them. */
const WELCOME_MODAL_NAVIGATORS = new Set<string>([NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR, NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR]);

/** One push plus one retry per welcome modal the guards can chain; anything beyond that is a loop, not a modal. */
const MAX_SHARE_FLOW_PUSH_ATTEMPTS = 3;

let pendingNativeShare: PendingNativeShare = 'none';
let stopWatchingNavigationState: (() => void) | undefined;

function setPendingNativeShare() {
    pendingNativeShare = 'pending';
}

function clearPendingNativeShare() {
    pendingNativeShare = 'none';
    stopWatchingNavigationState?.();
    stopWatchingNavigationState = undefined;
}

/**
 * Keeps a pending share parked until onboarding exits, so it lands on top of the post-onboarding screen instead of
 * racing the onboarding modal (which would tear it down) or replacing the landing destination onboarding chose.
 */
function deferPendingNativeShareUntilOnboardingExit() {
    if (pendingNativeShare !== 'pending') {
        return;
    }
    pendingNativeShare = 'deferredUntilOnboardingExit';
}

function isShareFlowInRootState(): boolean {
    return navigationRef.getRootState().routes.some((route) => route.name === NAVIGATORS.SHARE_MODAL_NAVIGATOR);
}

function isWelcomeModalFocused(): boolean {
    return WELCOME_MODAL_NAVIGATORS.has(navigationRef.getRootState().routes.at(-1)?.name ?? '');
}

function pushShareFlow() {
    Navigation.navigate(ROUTES.SHARE_ROOT, {waitForTransition: true});
}

/**
 * Pushes the share flow and consumes the intent only once ShareModalNavigator is actually in the root state. A navigation
 * guard can redirect the push into the migrated-user or Submit-plan welcome modal, or block it while one is open; the
 * intent then stays parked and the push is retried when that modal closes, so the staged file is not silently lost.
 */
function openShareFlowOnceAccepted() {
    pendingNativeShare = 'opening';
    let attempts = 1;
    let shouldRetryAfterWelcomeModal = isWelcomeModalFocused();

    stopWatchingNavigationState?.();
    stopWatchingNavigationState = navigationRef.addListener('state', () => {
        // Cleared on sign-out, or re-parked by a newer share that will be opened on its own.
        if (pendingNativeShare !== 'opening') {
            stopWatchingNavigationState?.();
            stopWatchingNavigationState = undefined;
            return;
        }

        if (isShareFlowInRootState()) {
            clearPendingNativeShare();
            return;
        }

        if (isWelcomeModalFocused()) {
            shouldRetryAfterWelcomeModal = true;
            return;
        }

        // An unrelated state change while the push is still in flight (e.g. the landing screen it waits for).
        if (!shouldRetryAfterWelcomeModal) {
            return;
        }

        shouldRetryAfterWelcomeModal = false;
        if (attempts >= MAX_SHARE_FLOW_PUSH_ATTEMPTS) {
            Log.hmmm('[Share] Giving up on a pending native share that navigation guards kept redirecting');
            clearPendingNativeShare();
            return;
        }
        attempts++;
        pushShareFlow();
    });

    pushShareFlow();
}

/**
 * Opens the Share flow for a parked native share, at most once. The plain call takes only a share that was never
 * deferred; `afterOnboarding` takes only a share deferred by onboarding, so the two consumers cannot race each other.
 *
 * @returns whether a parked share was taken up
 */
function openPendingNativeShare({afterOnboarding = false}: {afterOnboarding?: boolean} = {}): boolean {
    const consumableState: PendingNativeShare = afterOnboarding ? 'deferredUntilOnboardingExit' : 'pending';
    if (pendingNativeShare !== consumableState) {
        return false;
    }

    // Before the container is ready there is no state to watch; Navigation.navigate replays the push once it is.
    if (!navigationRef.isReady()) {
        pendingNativeShare = 'none';
        pushShareFlow();
        return true;
    }

    // The share flow re-reads the staged file on mount, so a second instance would only duplicate the modal.
    if (isShareFlowInRootState()) {
        clearPendingNativeShare();
        return true;
    }

    openShareFlowOnceAccepted();
    return true;
}

registerSessionCleanupCallback(clearPendingNativeShare);

/**
Function for clearing old saved data before at the start of share-extension flow
 */
function clearShareData() {
    Onyx.multiSet({
        [ONYXKEYS.SHARE_TEMP_FILE]: null,
        [ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS]: null,
        // Also clear any file validated in a previous share session. Otherwise a HEIC/`image/*` share
        // could reuse the previous session's validated file (which ShareDetailsPage uploads) during the
        // window before the new async validation overwrites VALIDATED_FILE_OBJECT.
        [ONYXKEYS.VALIDATED_FILE_OBJECT]: null,
    });
}

/**
Function storing natively shared file's properties for processing across share-extension screens

function addTempShareFile(file: ShareTempFile) {
 * @param file shared file's object with additional props
 */
function addTempShareFile(file: ShareTempFile) {
    Onyx.merge(ONYXKEYS.SHARE_TEMP_FILE, file);
}

/**
 * Stores a previously validated file object in Onyx for further use.
 *
 * @param file Array of validated file objects to be saved
 */
function addValidatedShareFile(file: FileObject[]) {
    Onyx.set(ONYXKEYS.VALIDATED_FILE_OBJECT, file.at(0));
}

/**
Function storing selected user's details for the duration of share-extension flow, if account doesn't exist

 * @param user selected user's details
 */
function saveUnknownUserDetails(user: Participant) {
    Onyx.merge(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS, user);
}

/**
 * Function to clear the unknown user details
 */
function clearUnknownUserDetails() {
    Onyx.merge(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS, null);
}

export {
    addTempShareFile,
    saveUnknownUserDetails,
    clearShareData,
    addValidatedShareFile,
    clearUnknownUserDetails,
    setPendingNativeShare,
    clearPendingNativeShare,
    deferPendingNativeShareUntilOnboardingExit,
    openPendingNativeShare,
};
