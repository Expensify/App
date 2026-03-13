import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type Onboarding from '@src/types/onyx/Onboarding';
import type {GuardResult, NavigationGuard} from './types';

/**
 * Module-level Onyx subscriptions for TestDriveModalGuard
 */
let onboarding: OnyxEntry<Onboarding>;
let onboardingPolicyID: OnyxEntry<string>;
let hasNonPersonalPolicy: OnyxEntry<boolean>;

let hasRedirectedToTestDriveModal = false;

/**
 * Reset the session flag (for testing purposes)
 */
function resetSessionFlag() {
    hasRedirectedToTestDriveModal = false;
}

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        onboarding = value;

        // Reset the session flag when modal is dismissed
        if (value?.testDriveModalDismissed === true) {
            hasRedirectedToTestDriveModal = false;
        }
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.ONBOARDING_POLICY_ID,
    callback: (value) => {
        onboardingPolicyID = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.HAS_NON_PERSONAL_POLICY,
    callback: (value) => {
        hasNonPersonalPolicy = value;
    },
});

/**
 * Check if navigation should be blocked while the test drive modal is active.
 * After the guard redirects to the modal, there's a delay before the native Modal overlay becomes visible
 * During this window, tab switches can push screens on top of the modal navigator,
 * causing DISMISS_MODAL to fail since it only checks the last route.
 */
function shouldBlockWhileModalActive(state: NavigationState, action: NavigationAction): boolean {
    const isModalDismissed = onboarding?.testDriveModalDismissed === true;
    if (!hasRedirectedToTestDriveModal || isModalDismissed) {
        return false;
    }

    // Only block when the test drive modal is the LAST route (on top of the stack).
    // If something was already pushed on top (broken state), don't block — the user
    // needs to be able to navigate to recover from the error.
    const lastRoute = state.routes.at(-1);
    if (lastRoute?.name !== NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR) {
        return false;
    }

    // Allow DISMISS_MODAL (Skip button) and GO_BACK (close/X button, confirm flow)
    if (action.type === CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL || action.type === CONST.NAVIGATION.ACTION_TYPE.GO_BACK) {
        return false;
    }

    return true;
}

/**
 * Check if we're already on or navigating to the test drive modal
 * This prevents redirect loops where our redirect creates new navigation actions
 */
function isNavigatingToTestDriveModal(state: NavigationState, action: NavigationAction): boolean {
    const currentRoute = findFocusedRoute(state);
    if (currentRoute?.name === SCREENS.TEST_DRIVE_MODAL.ROOT) {
        return true;
    }

    if (action.type === 'RESET' && action.payload) {
        const targetRoute = findFocusedRoute(action.payload as NavigationState);
        if (targetRoute?.name === SCREENS.TEST_DRIVE_MODAL.ROOT) {
            return true;
        }
    }

    return false;
}

/**
 * TestDriveModalGuard handles the test drive modal flow
 * This modal appears after a user completes the guided setup flow but hasn't dismissed the test drive modal yet
 */
const TestDriveModalGuard: NavigationGuard = {
    name: 'TestDriveModalGuard',

    evaluate: (state: NavigationState, action: NavigationAction, context): GuardResult => {
        if (context.isLoading) {
            return {type: 'ALLOW'};
        }

        if (shouldBlockWhileModalActive(state, action)) {
            return {type: 'BLOCK', reason: '[TestDriveModalGuard] Blocking navigation while test drive modal is active'};
        }

        const isModalDismissed = onboarding?.testDriveModalDismissed === true;
        const isNavigatingToModal = isNavigatingToTestDriveModal(state, action);

        // Redirect to home if trying to access dismissed test drive modal (prevent URL navigation)
        if (isNavigatingToModal && isModalDismissed) {
            Log.info('[TestDriveModalGuard] Redirecting to home - test drive modal has been dismissed');
            return {type: 'REDIRECT', route: ROUTES.HOME};
        }

        // Allow if we're already navigating to the modal (prevents redirect loops)
        if (isNavigatingToModal) {
            return {type: 'ALLOW'};
        }

        // Skip if already redirected or user has accessible policy
        if (hasRedirectedToTestDriveModal || (onboardingPolicyID && hasNonPersonalPolicy)) {
            Log.info('[TestDriveModalGuard] Already redirected or user has accessible policy, allowing');
            return {type: 'ALLOW'};
        }

        // Check if user has completed the guided setup flow
        const hasCompletedGuidedSetup = hasCompletedGuidedSetupFlowSelector(onboarding) ?? false;

        // Check if test drive modal should be shown
        const shouldShowTestDriveModal = onboarding?.testDriveModalDismissed === false;

        // If user completed setup and modal should be shown, redirect to it once
        if (hasCompletedGuidedSetup && shouldShowTestDriveModal) {
            Log.info('[TestDriveModalGuard] Redirecting to test drive modal');
            hasRedirectedToTestDriveModal = true;

            return {
                type: 'REDIRECT',
                route: ROUTES.TEST_DRIVE_MODAL_ROOT.route,
            };
        }

        return {type: 'ALLOW'};
    },
};

export default TestDriveModalGuard;
export {resetSessionFlag};
