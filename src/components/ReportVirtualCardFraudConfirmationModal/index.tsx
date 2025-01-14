import React, {useCallback} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import type {ReportVirtualCardFraudConfirmationModalProps} from './types';

function ReportVirtualCardFraudConfirmationModal({title, isVisible, onClose, onModalHide}: ReportVirtualCardFraudConfirmationModalProps) {
    const themeStyles = useThemeStyles();

    const hide = useCallback(() => {
        onClose?.();
    }, [onClose]);

    return (
        <Modal
            shouldHandleNavigationBack
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
                testID={ReportVirtualCardFraudConfirmationModal.displayName}
                offlineIndicatorStyle={themeStyles.mtAuto}
            >
                <HeaderWithBackButton
                    title={title}
                    onBackButtonPress={hide}
                />

                <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1]}>
                    <Text>Modal content here</Text>
                </View>
            </ScreenWrapper>
        </Modal>
    );
}

ReportVirtualCardFraudConfirmationModal.displayName = 'ReportVirtualCardFraudConfirmationModal';

export default ReportVirtualCardFraudConfirmationModal;
