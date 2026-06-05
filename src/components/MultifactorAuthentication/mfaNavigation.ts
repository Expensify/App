import {createNavigationContainerRef, StackActions} from '@react-navigation/native';
import type {MultifactorAuthenticationModalNavigatorParamList} from '@libs/Navigation/types';
import CONFIG from '@src/CONFIG';
import SCREENS from '@src/SCREENS';

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

// Outcome screens are terminal states the flow ends on.
const OUTCOME_SCREENS = new Set<string>([SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS, SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_FAILURE]);

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

    // In HybridApp the MFA overlay renders in an independent BaseNavigationContainer presented inside a native
    // modal, where StackActions.replace silently fails to commit (the computed state is never applied), stranding
    // the user on the spinner-bearing Prompt screen. For the terminal outcome screens we push instead, which
    // commits reliably; outcome screens end the flow (the stack is reset when the overlay closes) so the extra
    // stack entry has no downside. Standalone keeps replace, where it works as expected.
    if (CONFIG.IS_HYBRID_APP && OUTCOME_SCREENS.has(screen)) {
        mfaNavigationRef.dispatch(StackActions.push(screen, params));
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

export {MFA_INITIAL_SCREEN, mfaNavigationRef, navigate, handleInitialScreenLayout, resetMfaNavigation};
export type {MultifactorAuthenticationModalNavigatorInternalParamList};
