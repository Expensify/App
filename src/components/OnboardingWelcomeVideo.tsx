import React from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import FeatureTrainingModal from './FeatureTrainingModal';

function OnboardingWelcomeVideo() {
    const {translate} = useLocalize();

    return (
        <FeatureTrainingModal
            title={translate('onboarding.welcomeVideo.title')}
            description={translate('onboarding.welcomeVideo.description')}
            confirmText={translate('onboarding.getStarted')}
            videoURL={CONST.WELCOME_VIDEO_URL}
        />
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';
export default OnboardingWelcomeVideo;
