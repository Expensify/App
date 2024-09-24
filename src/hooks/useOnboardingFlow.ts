import {useEffect} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {hasCompletedGuidedSetupFlowSelector, hasCompletedHybridAppOnboardingFlowSelector} from '@libs/onboardingSelectors';
import variables from '@styles/variables';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * Hook to handle redirection to the onboarding flow based on the user's onboarding status
 *
 * Warning: This hook should be used only once in the app
 */
function useOnboardingFlow() {
    const [isOnboardingCompleted] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });
    const [isHybridAppOnboardingCompleted] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {
        selector: hasCompletedHybridAppOnboardingFlowSelector,
    });

    useEffect(() => {
        if (NativeModules.HybridAppModule) {
            // When user is transitioning from OldDot to NewDot, we should show the explanation modal
            // Only if the hybrid app onboarding is not completed, we should show the explanation modal
            if (isHybridAppOnboardingCompleted === false) {
                Navigation.navigate(ROUTES.EXPLANATION_MODAL_ROOT);
                return;
            }

            // If the hybrid app onboarding is completed, but the onboarding is not completed, we should start NewDot onboarding flow
            if (isHybridAppOnboardingCompleted === true && isOnboardingCompleted === false) {
                // Delay NewDot onboarding flow to hide the explanation modal in time
                setTimeout(() => {
                    OnboardingFlow.startOnboardingFlow();
                }, variables.explanationModalDelay);
                return;
            }
        }

        // If the user is not transitioning from OldDot to NewDot, we should start NewDot onboarding flow if it's not completed yet
        if (!NativeModules.HybridAppModule && isOnboardingCompleted === false) {
            OnboardingFlow.startOnboardingFlow();
        }
    }, [isOnboardingCompleted, isHybridAppOnboardingCompleted]);

    return {isOnboardingCompleted, isHybridAppOnboardingCompleted};
}

export default useOnboardingFlow;
