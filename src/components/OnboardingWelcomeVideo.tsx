import React from 'react';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import FeatureTrainingModal from './FeatureTrainingModal';

function OnboardingWelcomeVideo() {
    const {translate} = useLocalize();
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <FeatureTrainingModal
            title={translate('onboarding.welcomeVideo.title')}
            description={translate('onboarding.welcomeVideo.description')}
            confirmText={translate('onboarding.getStarted')}
            videoURL={CONST.WELCOME_VIDEO_URL}
            onConfirm={() => {
                if (onboardingPurposeSelected !== CONST.ONBOARDING_CHOICES.EMPLOYER || !isSmallScreenWidth) {
                    return;
                }
                Navigation.goBack(ROUTES.HOME, true, true);
            }}
        />
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';
export default OnboardingWelcomeVideo;
