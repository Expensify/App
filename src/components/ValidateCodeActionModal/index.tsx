import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import useThreeDotsAnchorPosition from '@hooks/useThreeDotsAnchorPosition';
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
    disableAnimation,
    threeDotsMenuItems = [],
    onThreeDotsButtonPress = () => {},
}: ValidateCodeActionModalProps) {
    const themeStyles = useThemeStyles();
    const firstRenderRef = useRef(true);
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);
    const styles = useThemeStyles();
    const threeDotsAnchorPosition = useThreeDotsAnchorPosition(styles.threeDotsPopoverOffset);

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
        // We only want to send validate code on first render not on change of hasMagicCodeBeenSent, so we don't add it as a dependency.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, sendValidateCode]);

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
            animationInTiming={disableAnimation ? 1 : undefined}
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
                    threeDotsMenuItems={threeDotsMenuItems}
                    shouldShowThreeDotsButton={threeDotsMenuItems.length > 0}
                    shouldOverlayDots
                    threeDotsAnchorPosition={threeDotsAnchorPosition}
                    onThreeDotsButtonPress={onThreeDotsButtonPress}
                />

                <ScrollView
                    style={[styles.w100, styles.h100, styles.flex1]}
                    contentContainerStyle={styles.flexGrow1}
                    keyboardShouldPersistTaps="handled"
                >
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
                </ScrollView>
                {footer?.()}
            </ScreenWrapper>
        </Modal>
    );
}

ValidateCodeActionModal.displayName = 'ValidateCodeActionModal';

export default ValidateCodeActionModal;
