import {createNavigationContainerRef, StackActions} from '@react-navigation/native';
import type {MultifactorAuthenticationOverlayParamList} from '@libs/Navigation/types';

const INITIAL_SCREEN = 'MFA_Initial' as const;

type MfaOverlayInternalParamList = MultifactorAuthenticationOverlayParamList & Record<typeof INITIAL_SCREEN, undefined>;

const mfaNavigationRef = createNavigationContainerRef<MfaOverlayInternalParamList>();

let pendingNavigation: {screen: string; params?: Record<string, unknown>} | undefined;
// True once the placeholder INITIAL_SCREEN has laid out at least once. On iOS
// native-stack, INITIAL.onLayout fires synchronously on mount — before
// process() reaches navigate() — so the buffer is empty when applyPending runs
// and the buffered push never fires. With this flag, navigate() pushes
// directly when INITIAL is already laid out.
let hasInitialLaidOut = false;

function navigate<T extends keyof MultifactorAuthenticationOverlayParamList>(
    screen: T,
    ...args: MultifactorAuthenticationOverlayParamList[T] extends undefined ? [] : [MultifactorAuthenticationOverlayParamList[T]]
) {
    const params = args[0] as Record<string, unknown> | undefined;

    // Navigator mounts only while the overlay is visible. Buffer the request
    // until the placeholder INITIAL_SCREEN lays out and triggers the push.
    if (!mfaNavigationRef.isReady()) {
        pendingNavigation = {screen: screen as string, params};
        return;
    }

    const currentRoute = mfaNavigationRef.getCurrentRoute();
    if (currentRoute?.name === screen) {
        return;
    }

    if (currentRoute?.name === INITIAL_SCREEN) {
        if (hasInitialLaidOut) {
            mfaNavigationRef.dispatch(StackActions.push(screen as string, params));
            return;
        }
        pendingNavigation = {screen: screen as string, params};
        return;
    }

    mfaNavigationRef.dispatch(StackActions.replace(screen as string, params));
}

function applyPendingNavigation() {
    hasInitialLaidOut = true;
    if (!pendingNavigation || !mfaNavigationRef.isReady()) {
        return;
    }

    const {screen, params} = pendingNavigation;
    pendingNavigation = undefined;

    mfaNavigationRef.dispatch(StackActions.push(screen, params));
}

function clearPendingNavigation() {
    pendingNavigation = undefined;
    hasInitialLaidOut = false;
}

export {INITIAL_SCREEN, mfaNavigationRef, navigate, applyPendingNavigation, clearPendingNavigation};
export type {MfaOverlayInternalParamList};
