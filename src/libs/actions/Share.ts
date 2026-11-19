import Log from '@libs/Log';
import {markOnboardingSettledForNativeShare} from '@libs/Navigation/helpers/shouldParkNativeShare';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {registerSessionCleanupCallback} from '@libs/SessionCleanup';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ShareTempFile} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {FileObject} from '@src/types/utils/Attachment';

import type {NavigationState} from '@react-navigation/native';

import Onyx from 'react-native-onyx';

/**
 * A native share (`share/root`) that has to wait for onboarding. The share extensions stage the file natively and open
 * the app through a plain deep link, and that link can reach JS before it is known whether onboarding comes first: while
 * signed out, or right after sign-in while OpenApp is still loading the account (see shouldParkNativeShare). Such a share
 * is parked here and opened once:
 * - `pending`: parked; opened by useOnboardingFlowRouter as soon as it rules onboarding out.
 * - `deferredUntilOnboardingExit`: onboarding comes first; opened by the onboarding exit on top of the landing screen.
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
let wasShareFlowMounted = false;

function stopWatchingShareFlowPush() {
    stopWatchingNavigationState?.();
    stopWatchingNavigationState = undefined;
}

function setPendingNativeShare() {
    // The link that parked the share is processed again on later DeepLinkHandler runs, so a share that is already
    // parked, deferred or opening must not start over.
    if (pendingNativeShare !== 'none') {
        return;
    }
    pendingNativeShare = 'pending';
}

function clearPendingNativeShare() {
    pendingNativeShare = 'none';
    stopWatchingShareFlowPush();
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

function hasRootRoute(state: NavigationState, name: string): boolean {
    return state.routes.some((route) => route.name === name);
}

function isShareFlowInRootState(): boolean {
    return hasRootRoute(navigationRef.getRootState(), NAVIGATORS.SHARE_MODAL_NAVIGATOR);
}

function isWelcomeModalFocused(): boolean {
    return WELCOME_MODAL_NAVIGATORS.has(navigationRef.getRootState().routes.at(-1)?.name ?? '');
}

function pushShareFlow() {
    Navigation.navigate(ROUTES.SHARE_ROOT, {waitForTransition: true});
}

/**
 * Keeps a share flow that onboarding removes. Onboarding that starts while the share flow is open rebuilds the stack
 * without it (the onboarding redirect drops every dismissible modal), whoever opened the share, and the shared file
 * would be lost with it. Called with every root navigation state: a share flow that was replaced by the onboarding
 * modal is parked for the onboarding exit, which reopens it on top of the landing screen.
 */
function parkShareFlowRemovedByOnboarding(state: NavigationState) {
    const isShareFlowMounted = hasRootRoute(state, NAVIGATORS.SHARE_MODAL_NAVIGATOR);
    const wasRemovedByOnboarding = wasShareFlowMounted && !isShareFlowMounted && state.routes.at(-1)?.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR;
    wasShareFlowMounted = isShareFlowMounted;

    if (!wasRemovedByOnboarding) {
        return;
    }

    stopWatchingShareFlowPush();
    pendingNativeShare = 'deferredUntilOnboardingExit';
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

    stopWatchingShareFlowPush();
    stopWatchingNavigationState = navigationRef.addListener('state', () => {
        // Cleared on sign-out, or parked again for the onboarding exit.
        if (pendingNativeShare !== 'opening') {
            stopWatchingShareFlowPush();
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
 * Opens the Share flow for a parked native share, at most once. Called without options by useOnboardingFlowRouter once
 * it has ruled onboarding out, and with `afterOnboarding` by the onboarding exit once it has navigated to the landing
 * screen. Either call also means a share arriving later in this session no longer has to wait for onboarding.
 *
 * @returns whether a parked share was taken up
 */
function openPendingNativeShare({afterOnboarding = false}: {afterOnboarding?: boolean} = {}): boolean {
    // Onboarding is ruled out the moment it completes, while its modal is still on screen and before its exit has
    // navigated to the landing screen. Leave the share to that exit so the two pushes cannot race.
    if (!afterOnboarding && navigationRef.isReady() && hasRootRoute(navigationRef.getRootState(), NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR)) {
        deferPendingNativeShareUntilOnboardingExit();
        return false;
    }

    markOnboardingSettledForNativeShare();

    // A share deferred by onboarding belongs to the onboarding exit alone: the router re-evaluates as soon as onboarding
    // completes, before the exit has navigated to the landing screen.
    const shouldOpenShare = pendingNativeShare === 'pending' || (afterOnboarding && pendingNativeShare === 'deferredUntilOnboardingExit');
    if (!shouldOpenShare) {
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

registerSessionCleanupCallback(() => {
    clearPendingNativeShare();
    wasShareFlowMounted = false;
});

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
    parkShareFlowRemovedByOnboarding,
};
