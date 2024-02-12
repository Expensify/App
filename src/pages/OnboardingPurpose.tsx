import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';

function OnboardingPurpose() {
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const theme = useTheme();

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        Navigation.goBack();
        setIsModalOpen(false);
    }, []);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.ONBOARDING}
            isVisible={isModalOpen}
            onClose={closeModal}
            innerContainerStyle={styles.pt0}
            shouldUseCustomBackdrop
            // This prevents stacking of transparent overlays
            shouldForceHideBackdrop
        >
            <View style={{maxHeight: windowHeight}}>
                <HeaderWithBackButton
                    shouldShowCloseButton
                    shouldShowBackButton={false}
                    onCloseButtonPress={closeModal}
                    shouldOverlay
                    iconFill={theme.iconColorfulBackground}
                />
            </View>
        </Modal>
    );
}

OnboardingPurpose.displayName = 'OnboardingPurpose';
export default OnboardingPurpose;
