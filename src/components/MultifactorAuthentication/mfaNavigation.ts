import type {MultifactorAuthenticationModalNavigatorParamList} from '@libs/Navigation/types';

import SCREENS from '@src/SCREENS';

import {createNavigationContainerRef, StackActions} from '@react-navigation/native';

/**
 * Internal placeholder used only as a mount-time buffer inside this module.
 *
 * Intentionally NOT exported on `MultifactorAuthenticationModalNavigatorParamList`
 * and NOT added to `SCREENS.ts`: doing so would leak an implementation detail
 * and let external callers `navigate('MFA_Initial')`, which we don't want.
 */
const MFA_INITIAL_SCREEN = 'MFA_Initial' as const;

type MultifactorAuthenticationModalNavigatorInternalParamList = MultifactorAuthenticationModalNavigatorParamList & Record<typeof MFA_INITIAL_SCREEN, undefined>;

const mfaNavigationRef = createNavigationContainerRef<MultifactorAuthenticationModalNavigatorInternalParamList>();

// Screens that live inside this independent overlay navigator. REVOKE and AUTHORIZE_TRANSACTION are intentionally excluded: they
// render in the main RHP modal stack, not this tree.
const MFA_OVERLAY_SCREENS = new Set<string>([
    MFA_INITIAL_SCREEN,
    SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE,
    SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT,
    SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS,
    SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_FAILURE,
]);

let pendingNavigation: {screen: string; params?: Record<string, unknown>} | undefined;

/**
 * True once the placeholder MFA_INITIAL_SCREEN has laid out at least once.
 *
 * On iOS native-stack, INITIAL.onLayout fires synchronously on mount — before
 * `process()` reaches `navigate()` — so the buffer is empty when
 * `handleInitialScreenLayout` runs and the buffered push never fires. With
 * this flag, `navigate()` pushes directly when INITIAL is already laid out.
 */
let hasInitialLaidOut = false;

function navigate<T extends keyof MultifactorAuthenticationModalNavigatorParamList>(
    screen: T,
    ...args: MultifactorAuthenticationModalNavigatorParamList[T] extends undefined ? [] : [MultifactorAuthenticationModalNavigatorParamList[T]]
) {
    const params: Record<string, unknown> | undefined = args[0];

    // Navigator mounts only while the overlay is visible. Buffer the request
    // until the placeholder MFA_INITIAL_SCREEN lays out and triggers the push.
    if (!mfaNavigationRef.isReady()) {
        pendingNavigation = {screen, params};
        return;
    }

    const currentRoute = mfaNavigationRef.getCurrentRoute();
    if (currentRoute?.name === screen) {
        return;
    }

    if (currentRoute?.name === MFA_INITIAL_SCREEN) {
        if (hasInitialLaidOut) {
            mfaNavigationRef.dispatch(StackActions.push(screen, params));
            return;
        }
        pendingNavigation = {screen, params};
        return;
    }

    mfaNavigationRef.dispatch(StackActions.replace(screen, params));
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

export {MFA_INITIAL_SCREEN, MFA_OVERLAY_SCREENS, mfaNavigationRef, navigate, handleInitialScreenLayout, resetMfaNavigation};
export type {MultifactorAuthenticationModalNavigatorInternalParamList};
