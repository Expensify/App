import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ValidateCodeActionModalProps} from './type';
import ValidateCodeForm from './ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeForm/BaseValidateCodeForm';

function ValidateCodeActionModal({isVisible, title, description, onClose}: ValidateCodeActionModalProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const themeStyles = useThemeStyles();
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const hide = useCallback(() => {
        // clear data, error etc here.
        onClose();
    }, [onClose]);

    useEffect(() => {
        User.requestValidateCodeAction();
    }, []);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={hide}
            onModalHide={hide}
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
                {validateCodeAction?.isLoading ? (
                    <FullScreenLoadingIndicator />
                ) : (
                    <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb7]}>
                        <Text style={[themeStyles.mb3]}>{description}</Text>
                        <ValidateCodeForm
                            handleSubmitForm={() => {}}
                            clearError={() => {}}
                            ref={validateCodeFormRef}
                            contactMethod={account?.primaryLogin ?? ''}
                        />
                    </View>
                )}
            </ScreenWrapper>
        </Modal>
    );
}

ValidateCodeActionModal.displayName = 'ValidateCodeActionModal';

export default ValidateCodeActionModal;
