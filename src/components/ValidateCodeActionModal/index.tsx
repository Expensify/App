import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useSafePaddingBottomStyle from '@hooks/useSafePaddingBottomStyle';
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
    isAddingNewContact,
}: ValidateCodeActionModalProps) {
    const themeStyles = useThemeStyles();
    const safePaddingBottomStyle = useSafePaddingBottomStyle();
    const firstRenderRef = useRef(true);
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const hide = useCallback(() => {
        clearError();
        onClose?.();
    }, [onClose, clearError]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!firstRenderRef.current || !isVisible || hasMagicCodeBeenSent || isAddingNewContact) {
            return;
        }
        firstRenderRef.current = false;

        sendValidateCode();
    }, [isVisible, sendValidateCode, hasMagicCodeBeenSent, isAddingNewContact]);

    return (
        <Modal
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
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={ValidateCodeActionModal.displayName}
                offlineIndicatorStyle={themeStyles.mtAuto}
            >
                <HeaderWithBackButton
                    title={title}
                    onBackButtonPress={hide}
                />

                <View style={[themeStyles.flex1, themeStyles.mt3, themeStyles.pb5]}>
                    <Text style={[themeStyles.ph5, themeStyles.mb3]}>{descriptionPrimary}</Text>
                    {!!descriptionSecondary && <Text style={[themeStyles.ph5, themeStyles.mb3]}>{descriptionSecondary}</Text>}
                    <ValidateCodeForm
                        isLoading={isLoading}
                        validateCodeAction={validateCodeAction}
                        validatePendingAction={validatePendingAction}
                        validateError={validateError}
                        handleSubmitForm={handleSubmitForm}
                        sendValidateCode={sendValidateCode}
                        clearError={clearError}
                        buttonStyles={[themeStyles.justifyContentEnd, themeStyles.flex1, safePaddingBottomStyle]}
                        ref={validateCodeFormRef}
                        hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                        menuItems={footer}
                    />
                </View>
            </ScreenWrapper>
        </Modal>
    );
}

ValidateCodeActionModal.displayName = 'ValidateCodeActionModal';

export default ValidateCodeActionModal;
