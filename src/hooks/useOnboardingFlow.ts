import {useEffect} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {hasCompletedGuidedSetupFlowSelector, hasCompletedHybridAppOnboardingFlowSelector} from '@libs/onboardingSelectors';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/**
 * Hook to handle redirection to the onboarding flow based on the user's onboarding status
 *
 * Warning: This hook should be used only once in the app
 */
function useOnboardingFlowRouter() {
    const [isOnboardingCompleted, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });
    const [isHybridAppOnboardingCompleted, isHybridAppOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {
        selector: hasCompletedHybridAppOnboardingFlowSelector,
    });

    useEffect(() => {
        if (isLoadingOnyxValue(isOnboardingCompletedMetadata, isHybridAppOnboardingCompletedMetadata)) {
            return;
        }

        if (NativeModules.HybridAppModule) {
            // When user is transitioning from OldDot to NewDot, we usually show the explanation modal
            if (isHybridAppOnboardingCompleted === false) {
                Navigation.navigate(ROUTES.EXPLANATION_MODAL_ROOT);
            }

            // But if the hybrid app onboarding is completed, but NewDot onboarding is not completed, we start NewDot onboarding flow
            // This is a special case when user created an account from NewDot without finishing the onboarding flow and then logged in from OldDot
            if (isHybridAppOnboardingCompleted === true && isOnboardingCompleted === false) {
                OnboardingFlow.startOnboardingFlow();
            }
        }

        // If the user is not transitioning from OldDot to NewDot, we should start NewDot onboarding flow if it's not completed yet
        if (!NativeModules.HybridAppModule && isOnboardingCompleted === false) {
            OnboardingFlow.startOnboardingFlow();
        }
    }, [isOnboardingCompleted, isHybridAppOnboardingCompleted, isOnboardingCompletedMetadata, isHybridAppOnboardingCompletedMetadata]);

    return {isOnboardingCompleted, isHybridAppOnboardingCompleted};
}

export default useOnboardingFlowRouter;
