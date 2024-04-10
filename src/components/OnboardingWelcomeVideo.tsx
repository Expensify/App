import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import Text from './Text';
import WelcomeVideoModal from './WelcomeVideoModal';

function OnboardingWelcomeVideo() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const onClose = () => {
        Navigation.goBack();
    };

    return (
        <WelcomeVideoModal onClose={onClose}>
            <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{translate('onboarding.welcomeVideo.title')}</Text>
            <Text style={styles.textSupporting}>{translate('onboarding.welcomeVideo.description')}</Text>
        </WelcomeVideoModal>
    );
}

OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';
export default OnboardingWelcomeVideo;
