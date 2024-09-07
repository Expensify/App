import React, {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Welcome from '@userActions/Welcome';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import FeatureTrainingModal from './FeatureTrainingModal';

function ExplanationModal() {
    const {translate} = useLocalize();

    const onClose = useCallback(() => {
        Welcome.completeHybridAppOnboarding();

        // We need to check if standard NewDot onboarding is completed.
        Welcome.isOnboardingFlowCompleted({
            onNotCompleted: () => {
                setTimeout(() => {
                    Navigation.isNavigationReady().then(() => {
                        OnboardingFlow.startOnboardingFlow();
                    });
                }, variables.welcomeVideoDelay);
            },
        });
    }, []);

    return (
        <FeatureTrainingModal
            title={translate('onboarding.explanationModal.title')}
            description={translate('onboarding.explanationModal.description')}
            secondaryDescription={translate('onboarding.explanationModal.secondaryDescription')}
            confirmText={translate('footer.getStarted')}
            videoURL={CONST.WELCOME_VIDEO_URL}
            onClose={onClose}
        />
    );
}

ExplanationModal.displayName = 'ExplanationModal';
export default ExplanationModal;
