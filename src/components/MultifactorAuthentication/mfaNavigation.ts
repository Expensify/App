import {createNavigationContainerRef, StackActions} from '@react-navigation/native';
import type {MultifactorAuthenticationModalNavigatorParamList} from '@libs/Navigation/types';

const MFA_INITIAL_SCREEN = 'MFA_Initial' as const;

type MultifactorAuthenticationModalNavigatorInternalParamList = MultifactorAuthenticationModalNavigatorParamList & Record<typeof MFA_INITIAL_SCREEN, undefined>;

const mfaNavigationRef = createNavigationContainerRef<MultifactorAuthenticationModalNavigatorInternalParamList>();

let pendingNavigation: {screen: string; params?: Record<string, unknown>} | undefined;
// True once the placeholder MFA_INITIAL_SCREEN has laid out at least once. On iOS
// native-stack, INITIAL.onLayout fires synchronously on mount — before
// process() reaches navigate() — so the buffer is empty when
// handleInitialScreenLayout runs and the buffered push never fires. With this
// flag, navigate() pushes directly when INITIAL is already laid out.
let hasInitialLaidOut = false;

function navigate<T extends keyof MultifactorAuthenticationModalNavigatorParamList>(
    screen: T,
    ...args: MultifactorAuthenticationModalNavigatorParamList[T] extends undefined ? [] : [MultifactorAuthenticationModalNavigatorParamList[T]]
) {
    const params: Record<string, unknown> | undefined = args[0];

    // Navigator mounts only while the overlay is visible. Buffer the request
    // until the placeholder MFA_INITIAL_SCREEN lays out and triggers the push.
    if (!mfaNavigationRef.isReady()) {
        pendingNavigation = {screen: screen as string, params};
        return;
    }

    const currentRoute = mfaNavigationRef.getCurrentRoute();
    if (currentRoute?.name === screen) {
        return;
    }

    if (currentRoute?.name === MFA_INITIAL_SCREEN) {
        if (hasInitialLaidOut) {
            mfaNavigationRef.dispatch(StackActions.push(screen as string, params));
            return;
        }
        pendingNavigation = {screen: screen as string, params};
        return;
    }

    mfaNavigationRef.dispatch(StackActions.replace(screen as string, params));
}

function handleInitialScreenLayout() {
    hasInitialLaidOut = true;
    if (!pendingNavigation || !mfaNavigationRef.isReady()) {
        return;
    }

    const {screen, params} = pendingNavigation;
    pendingNavigation = undefined;

    mfaNavigationRef.dispatch(StackActions.push(screen, params));
}

function resetMfaNavigation() {
    pendingNavigation = undefined;
    hasInitialLaidOut = false;
}

export {MFA_INITIAL_SCREEN, mfaNavigationRef, navigate, handleInitialScreenLayout, resetMfaNavigation};
export type {MultifactorAuthenticationModalNavigatorInternalParamList};
