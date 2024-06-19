import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import ConfirmContent from './ConfirmContent';
import Lottie from './Lottie';
import Modal from './Modal';
import type BaseModalProps from './Modal/types';

type RequireTwoFactorAuthenticationModalProps = {
    /** Title of the modal */
    title?: string;

    /** A callback to call when the form has been submitted */
    onConfirm: () => void;

    /** A callback to call when the form has been closed */
    onCancel?: () => void;

    /** Modal visibility */
    isVisible: boolean;

    /** Confirm button text */
    confirmText?: string;

    /** Styles for title */
    titleStyles?: StyleProp<TextStyle>;

    /** Styles for prompt */
    promptStyles?: StyleProp<TextStyle>;

    /** Styles for icon */
    iconAdditionalStyles?: StyleProp<ViewStyle>;

    /**
     * Whether the modal should enable the new focus manager.
     * We are attempting to migrate to a new refocus manager, adding this property for gradual migration.
     * */
    shouldEnableNewFocusManagement?: boolean;
};

function RequireTwoFactorAuthenticationModal({
    confirmText = '',
    onCancel = () => {},
    title = '',
    titleStyles,
    iconAdditionalStyles,
    promptStyles,
    isVisible,
    onConfirm,
    shouldEnableNewFocusManagement,
}: RequireTwoFactorAuthenticationModalProps) {
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Modal
            onSubmit={onConfirm}
            onClose={onCancel}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            // innerContainerStyle={innerContainerStyle}
            shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
        >
            <Lottie
                source={LottieAnimations.Safe}
                style={styles.h100}
                webStyle={styles.h100}
                autoPlay
                loop
            />
            <Button
                large
                success
                pressOnEnter
                onPress={() => {}}
                text={translate('twoFactorAuth.enableTwoFactorAuth')}
            />
            {/* <ConfirmContent
                title={title}
               
                onConfirm={() => (isVisible ? onConfirm() : null)}
                onCancel={onCancel}
                confirmText={confirmText}
                prompt={prompt}
                success={success}
                danger={danger}
                shouldDisableConfirmButtonWhenOffline={shouldDisableConfirmButtonWhenOffline}
                shouldShowCancelButton={shouldShowCancelButton}
                shouldCenterContent={shouldCenterContent}
                iconSource={iconSource}
                iconAdditionalStyles={iconAdditionalStyles}
                titleStyles={titleStyles}
                promptStyles={promptStyles}
                shouldStackButtons={shouldStackButtons}
                image={image}
            /> */}
        </Modal>
    );
}

RequireTwoFactorAuthenticationModal.displayName = 'RequireTwoFactorAuthenticationModal';

export default RequireTwoFactorAuthenticationModal;
