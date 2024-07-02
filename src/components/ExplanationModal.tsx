import React, {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import FeatureTrainingModal from './FeatureTrainingModal';

function ExplanationModal() {
    const {translate} = useLocalize();

    const onConfirm = useCallback(() => {
        Welcome.completeHybridAppOnboarding();

        // We need to check if standard NewDot onboarding is completed.
        Welcome.isOnboardingFlowCompleted({
            onNotCompleted: () => {
                setTimeout(() => {
                    Navigation.isNavigationReady().then(() => {
                        Navigation.navigate(ROUTES.ONBOARDING_ROOT);
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
            onConfirm={onConfirm}
        />
    );
}

ExplanationModal.displayName = 'ExplanationModal';
export default ExplanationModal;
