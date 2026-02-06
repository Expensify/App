import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Onboarding from '@src/types/onyx/Onboarding';
import type {GuardResult, NavigationGuard} from './types';

/**
 * Module-level Onyx subscription for TestDriveModalGuard
 */
let onboarding: OnyxEntry<Onboarding>;

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        onboarding = value;
    },
});

/**
 * TestDriveModalGuard handles the test drive modal flow
 * This modal appears after a user completes the guided setup flow but hasn't dismissed the test drive modal yet
 */
const TestDriveModalGuard: NavigationGuard = {
    name: 'TestDriveModalGuard',

    evaluate: (state: NavigationState, action: NavigationAction, context): GuardResult => {
        // Skip if app is still loading
        if (context.isLoading) {
            return {type: 'ALLOW'};
        }

        // Check if user has completed the guided setup flow
        const hasCompletedGuidedSetup = hasCompletedGuidedSetupFlowSelector(onboarding) ?? false;

        // Check if test drive modal has been dismissed
        // Note: We compare to `false` specifically, not just falsy values
        // because `undefined` means the modal doesn't need to be shown
        const shouldShowTestDriveModal = onboarding?.testDriveModalDismissed === false;

        // If user completed setup but hasn't dismissed test drive modal, redirect to it
        if (hasCompletedGuidedSetup && shouldShowTestDriveModal) {
            Log.info('[TestDriveModalGuard] User has completed guided setup but not dismissed test drive modal, redirecting');

            return {
                type: 'REDIRECT',
                route: ROUTES.TEST_DRIVE_MODAL_ROOT.route,
            };
        }

        return {type: 'ALLOW'};
    },
};

export default TestDriveModalGuard;
