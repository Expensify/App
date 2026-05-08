import {createNavigationContainerRef, StackActions} from '@react-navigation/native';
import type {MultifactorAuthenticationOverlayParamList} from '@libs/Navigation/types';

const INITIAL_SCREEN = 'MFA_Initial' as const;

type MfaOverlayInternalParamList = MultifactorAuthenticationOverlayParamList & Record<typeof INITIAL_SCREEN, undefined>;

const mfaNavigationRef = createNavigationContainerRef<MfaOverlayInternalParamList>();

let pendingNavigation: {screen: string; params?: Record<string, unknown>} | undefined;

function navigate<T extends keyof MultifactorAuthenticationOverlayParamList>(
    screen: T,
    ...args: MultifactorAuthenticationOverlayParamList[T] extends undefined ? [] : [MultifactorAuthenticationOverlayParamList[T]]
) {
    const params = args[0] as Record<string, unknown> | undefined;

    // Navigator is mounted only while the overlay is visible. If a navigation
    // request arrives before mount (e.g. the MFA state machine fires before
    // the overlay finishes its open animation), buffer it and let onReady
    // apply it from the placeholder INITIAL_SCREEN so the slide animation plays.
    if (!mfaNavigationRef.isReady()) {
        pendingNavigation = {screen: screen as string, params};
        return;
    }

    const currentRoute = mfaNavigationRef.getCurrentRoute();
    if (currentRoute?.name === screen) {
        return;
    }

    if (currentRoute?.name === INITIAL_SCREEN) {
        pendingNavigation = {screen: screen as string, params};
        return;
    }

    mfaNavigationRef.dispatch(StackActions.replace(screen as string, params));
}

function applyPendingNavigation() {
    if (!pendingNavigation || !mfaNavigationRef.isReady()) {
        return;
    }

    const {screen, params} = pendingNavigation;
    pendingNavigation = undefined;

    mfaNavigationRef.dispatch(StackActions.push(screen, params));
}

function clearPendingNavigation() {
    pendingNavigation = undefined;
}

export {INITIAL_SCREEN, mfaNavigationRef, navigate, applyPendingNavigation, clearPendingNavigation};
