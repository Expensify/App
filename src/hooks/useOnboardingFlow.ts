import {useEffect} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {hasCompletedGuidedSetupFlowSelector, hasCompletedHybridAppSetupFlowSelector} from '@libs/onboardingSelectors';
import variables from '@styles/variables';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function useOnboardingFlow() {
    const [isOnboardingCompleted] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });
    const [isHybridAppOnboardingCompleted] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT, {
        selector: hasCompletedHybridAppSetupFlowSelector,
    });

    useEffect(() => {
        if (NativeModules.HybridAppModule) {
            if (isHybridAppOnboardingCompleted === false) {
                Navigation.navigate(ROUTES.EXPLANATION_MODAL_ROOT);
                return;
            }

            if (isHybridAppOnboardingCompleted === true && isOnboardingCompleted === false) {
                setTimeout(() => {
                    OnboardingFlow.startOnboardingFlow();
                }, variables.explanationModalDelay);
                return;
            }
        }

        if (!NativeModules.HybridAppModule && isOnboardingCompleted === false) {
            OnboardingFlow.startOnboardingFlow();
        }
    }, [isOnboardingCompleted, isHybridAppOnboardingCompleted]);

    return {isOnboardingCompleted, isHybridAppOnboardingCompleted};
}

export default useOnboardingFlow;
