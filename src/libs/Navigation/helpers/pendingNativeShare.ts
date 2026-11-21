import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {registerSessionCleanupCallback} from '@libs/SessionCleanup';
import {didUserLogInDuringSession} from '@libs/SessionUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

import type {NavigationState} from '@react-navigation/native';

/**
 * A native share (`share/root`) whose link reached JS before it is known whether onboarding comes first. It is parked in
 * memory and opened once:
 * - `waitingForOnboardingCheck`: opened by useOnboardingFlowRouter once it rules onboarding out.
 * - `waitingForOnboardingExit`: opened by the onboarding exit, on top of the landing screen.
 * - `opening`: pushed; consumed once ShareModalNavigator is in the root state.
 */
type NativeShareStatus = 'none' | 'waitingForOnboardingCheck' | 'waitingForOnboardingExit' | 'opening';

/** Root modals a navigation guard redirects the share push into, or blocks it behind, until the user dismisses them. */
const WELCOME_MODAL_NAVIGATORS = new Set<string>([NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR, NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR]);

/** One push plus one retry per welcome modal the guards can chain; anything beyond that is a loop, not a modal. */
const MAX_SHARE_FLOW_PUSH_ATTEMPTS = 3;

let nativeShareStatus: NativeShareStatus = 'none';
let stopWatchingNavigationState: (() => void) | undefined;

/** Whether onboarding has been ruled out, or has finished, for the current session. */
let isOnboardingSettled = false;

/**
 * Whether a share that arrives now has to wait: nobody is signed in, or the user signed in during this session and
 * onboarding is not settled yet (HybridApp hands the link over only after sign-in).
 */
function shouldParkNativeShare(isAuthenticated: boolean): boolean {
    return !isAuthenticated || (didUserLogInDuringSession() && !isOnboardingSettled);
}

function stopWatchingShareFlowPush() {
    stopWatchingNavigationState?.();
    stopWatchingNavigationState = undefined;
}

function setPendingNativeShare() {
    // DeepLinkHandler processes the same link again on later runs; an existing share must not start over.
    if (nativeShareStatus !== 'none') {
        return;
    }
    nativeShareStatus = 'waitingForOnboardingCheck';
}

function clearPendingNativeShare() {
    nativeShareStatus = 'none';
    stopWatchingShareFlowPush();
}

/** Keeps a pending share parked until onboarding exits, so it opens on top of the landing screen. */
function deferPendingNativeShareUntilOnboardingExit() {
    if (nativeShareStatus !== 'waitingForOnboardingCheck') {
        return;
    }
    nativeShareStatus = 'waitingForOnboardingExit';
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

/** Called by OnboardingGuard when its redirect is about to drop the share flow: keep the share for the onboarding exit. */
function keepNativeShareForOnboardingExit() {
    stopWatchingShareFlowPush();
    nativeShareStatus = 'waitingForOnboardingExit';
}

/**
 * Pushes the share flow and consumes the intent only once ShareModalNavigator is in the root state. If a welcome-modal
 * guard redirects or blocks the push, it is retried when that modal closes.
 */
function openShareFlowOnceAccepted() {
    nativeShareStatus = 'opening';
    let attempts = 1;
    let shouldRetryAfterWelcomeModal = isWelcomeModalFocused();

    stopWatchingShareFlowPush();
    stopWatchingNavigationState = navigationRef.addListener('state', () => {
        // Cleared on sign-out, or parked again for the onboarding exit.
        if (nativeShareStatus !== 'opening') {
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
 * Opens the Share flow for a parked native share, at most once. useOnboardingFlowRouter calls it once onboarding is ruled
 * out; the onboarding exit calls it with `afterOnboarding` after navigating to the landing screen.
 *
 * @returns whether a parked share was taken up
 */
function openPendingNativeShare({afterOnboarding = false}: {afterOnboarding?: boolean} = {}): boolean {
    // Onboarding just completed but its modal is still on screen: leave the share to the onboarding exit.
    if (!afterOnboarding && navigationRef.isReady() && hasRootRoute(navigationRef.getRootState(), NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR)) {
        deferPendingNativeShareUntilOnboardingExit();
        return false;
    }

    isOnboardingSettled = true;

    // A deferred share belongs to the onboarding exit alone.
    const shouldOpenShare = nativeShareStatus === 'waitingForOnboardingCheck' || (afterOnboarding && nativeShareStatus === 'waitingForOnboardingExit');
    if (!shouldOpenShare) {
        return false;
    }

    // Before the container is ready there is no state to watch; Navigation.navigate replays the push once it is.
    if (!navigationRef.isReady()) {
        nativeShareStatus = 'none';
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
    isOnboardingSettled = false;
});

export {shouldParkNativeShare, setPendingNativeShare, clearPendingNativeShare, deferPendingNativeShareUntilOnboardingExit, openPendingNativeShare, keepNativeShareForOnboardingExit};
