import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ValidateCodeActionModalProps} from './type';
import ValidateCodeForm from './ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeForm/BaseValidateCodeForm';

function ValidateCodeActionModal({
    isVisible,
    title,
    description,
    onClose,
    onModalHide,
    validatePendingAction,
    validateError,
    handleSubmitForm,
    clearError,
    footer,
    sendValidateCode,
    hasMagicCodeBeenSent,
}: ValidateCodeActionModalProps) {
    const themeStyles = useThemeStyles();
    const firstRenderRef = useRef(true);
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const hide = useCallback(() => {
        clearError();
        onClose();
    }, [onClose, clearError]);

    useEffect(() => {
        if (!firstRenderRef.current || !isVisible) {
            return;
        }
        firstRenderRef.current = false;

        sendValidateCode();
    }, [isVisible, sendValidateCode]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={hide}
            onModalHide={onModalHide ?? hide}
            hideModalContentWhileAnimating
            useNativeDriver
            shouldUseModalPaddingStyle={false}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={ValidateCodeActionModal.displayName}
                offlineIndicatorStyle={themeStyles.mtAuto}
            >
                <HeaderWithBackButton
                    title={title}
                    onBackButtonPress={hide}
                />

                <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb7]}>
                    <Text style={[themeStyles.mb3]}>{description}</Text>
                    <ValidateCodeForm
                        validateCodeAction={validateCodeAction}
                        validatePendingAction={validatePendingAction}
                        validateError={validateError}
                        handleSubmitForm={handleSubmitForm}
                        sendValidateCode={sendValidateCode}
                        clearError={clearError}
                        ref={validateCodeFormRef}
                        hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                    />
                </View>
                {footer?.()}
            </ScreenWrapper>
        </Modal>
    );
}

ValidateCodeActionModal.displayName = 'ValidateCodeActionModal';

export default ValidateCodeActionModal;
