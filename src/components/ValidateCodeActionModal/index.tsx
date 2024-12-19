import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ValidateCodeActionModalProps} from './type';
import ValidateCodeForm from './ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeForm/BaseValidateCodeForm';

function ValidateCodeActionModal({
    isVisible,
    title,
    descriptionPrimary,
    descriptionSecondary,
    onClose,
    onModalHide,
    validatePendingAction,
    validateError,
    handleSubmitForm,
    clearError,
    footer,
    sendValidateCode,
    hasMagicCodeBeenSent,
    isLoading,
    shouldHandleNavigationBack,
}: ValidateCodeActionModalProps) {
    const themeStyles = useThemeStyles();
    const firstRenderRef = useRef(true);
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const hide = useCallback(() => {
        clearError();
        onClose?.();
        firstRenderRef.current = true;
    }, [onClose, clearError]);

    useEffect(() => {
        if (!firstRenderRef.current || !isVisible || hasMagicCodeBeenSent) {
            return;
        }
        firstRenderRef.current = false;

        sendValidateCode();
    }, [isVisible, sendValidateCode, hasMagicCodeBeenSent]);

    return (
        <Modal
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={hide}
            onModalHide={onModalHide ?? hide}
            onBackdropPress={() => Navigation.dismissModal()}
            hideModalContentWhileAnimating
            useNativeDriver
            shouldUseModalPaddingStyle={false}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                includePaddingTop
                shouldEnableMaxHeight
                testID={ValidateCodeActionModal.displayName}
                offlineIndicatorStyle={themeStyles.mtAuto}
            >
                <HeaderWithBackButton
                    title={title}
                    onBackButtonPress={hide}
                />

                <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1]}>
                    <Text style={[themeStyles.mb3]}>{descriptionPrimary}</Text>
                    {!!descriptionSecondary && <Text style={[themeStyles.mb3]}>{descriptionSecondary}</Text>}
                    <ValidateCodeForm
                        isLoading={isLoading}
                        validateCodeAction={validateCodeAction}
                        validatePendingAction={validatePendingAction}
                        validateError={validateError}
                        handleSubmitForm={handleSubmitForm}
                        sendValidateCode={sendValidateCode}
                        clearError={clearError}
                        buttonStyles={[themeStyles.justifyContentEnd, themeStyles.flex1]}
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
