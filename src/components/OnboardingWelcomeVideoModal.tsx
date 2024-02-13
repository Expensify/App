import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import Button from './Button';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import Modal from './Modal';
import Text from './Text';

function OnboardingWelcomeVideoModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();
    const [isModalOpen, setIsModalOpen] = useState(true);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            isVisible={isModalOpen}
            onClose={closeModal}
            innerContainerStyle={styles.pt0}
            shouldUseCustomBackdrop
        >
            <View style={{maxHeight: windowHeight}}>
                <View style={[styles.w100, styles.p2, styles.pb5]}>
                    <View style={[styles.onboardingWelcomeVideo]}>
                        <Lottie
                            source={LottieAnimations.Hands}
                            style={styles.w100}
                            webStyle={isSmallScreenWidth ? styles.h100 : styles.w100}
                            autoPlay
                            loop
                        />
                    </View>
                    <View style={[styles.pt5, isSmallScreenWidth ? styles.ph3 : styles.ph6]}>
                        <Text style={[styles.textHeadline]}>{translate('onboarding.welcomeVideo.title')}</Text>
                        <Text style={[styles.textSupporting, styles.pb8]}>{translate('onboarding.welcomeVideo.description')}</Text>
                        <Button
                            success
                            pressOnEnter
                            onPress={closeModal}
                            text={translate('onboarding.welcomeVideo.button')}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

OnboardingWelcomeVideoModal.displayName = 'OnboardingWelcomeVideoModal';

export default OnboardingWelcomeVideoModal;
