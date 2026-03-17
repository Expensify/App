import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Button from './Button';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import Modal from './Modal';
import Text from './Text';

type RequireTwoFactorAuthenticationModalProps = {
    /** A callback to call when the form has been submitted */
    onSubmit: () => void;

    /** A callback to call when the form has been closed */
    onCancel?: () => void;

    /** Modal visibility */
    isVisible: boolean;

    /** Describe what is showing */
    description: string;

    /**
     * Whether the modal should enable the new focus manager.
     * We are attempting to migrate to a new refocus manager, adding this property for gradual migration.
     * */
    shouldEnableNewFocusManagement?: boolean;
};

function RequireTwoFactorAuthenticationModal({onCancel = () => {}, description, isVisible, onSubmit, shouldEnableNewFocusManagement}: RequireTwoFactorAuthenticationModalProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

    return (
        <Modal
            onClose={onCancel}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={{...styles.pb5, ...styles.pt0, ...styles.boxShadowNone}}
            shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
        >
            <View>
                <View style={[styles.cardSectionIllustration, styles.alignItemsCenter, StyleUtils.getBackgroundColorStyle(LottieAnimations.Safe.backgroundColor)]}>
                    <Lottie
                        source={LottieAnimations.Safe}
                        style={styles.h100}
                        webStyle={styles.h100}
                        autoPlay
                        loop
                    />
                </View>
                <View style={[styles.mt5, styles.mh5]}>
                    <View style={[styles.gap2, styles.mb10]}>
                        <Text style={[styles.textHeadlineH1]}>{translate('twoFactorAuth.pleaseEnableTwoFactorAuth')}</Text>
                        <Text style={styles.textSupporting}>{description}</Text>
                    </View>
                    <Button
                        large
                        success
                        pressOnEnter
                        onPress={onSubmit}
                        text={translate('twoFactorAuth.enableTwoFactorAuth')}
                    />
                </View>
            </View>
        </Modal>
    );
}

export default RequireTwoFactorAuthenticationModal;
