import React from 'react';
import {type StyleProp, type TextStyle, View, type ViewStyle} from 'react-native';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import ConfirmContent from './ConfirmContent';
import Lottie from './Lottie';
import Modal from './Modal';
import type BaseModalProps from './Modal/types';
import Text from './Text';

type RequireTwoFactorAuthenticationModalProps = {
    /** A callback to call when the form has been submitted */
    onConfirm: () => void;

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

function RequireTwoFactorAuthenticationModal({onCancel = () => {}, description, isVisible, onConfirm, shouldEnableNewFocusManagement}: RequireTwoFactorAuthenticationModalProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

    return (
        <Modal
            onSubmit={onConfirm}
            onClose={onCancel}
            isVisible={isVisible}
            type={shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={{...styles.pt2, ...styles.pb5, ...styles.br4, ...styles.boxShadowNone}}
            shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
        >
            <View style={[styles.w100, StyleUtils.getBackgroundColorStyle(LottieAnimations.Safe.backgroundColor)]}>
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
                    onPress={() => {}}
                    text={translate('twoFactorAuth.enableTwoFactorAuth')}
                />
            </View>
        </Modal>
    );
}

RequireTwoFactorAuthenticationModal.displayName = 'RequireTwoFactorAuthenticationModal';

export default RequireTwoFactorAuthenticationModal;
