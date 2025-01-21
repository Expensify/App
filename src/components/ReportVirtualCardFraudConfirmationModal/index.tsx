import React, {useCallback} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import type {ReportVirtualCardFraudConfirmationModalProps} from './types';

function ReportVirtualCardFraudConfirmationModal({title, isVisible, onClose, onModalHide}: ReportVirtualCardFraudConfirmationModalProps) {
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();

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
                    <View style={[themeStyles.justifyContentCenter, themeStyles.flex1]}>
                        <ImageSVG
                            contentFit="contain"
                            src={Expensicons.MagnifyingGlassSpyMouthClosed}
                            style={themeStyles.alignSelfCenter}
                            width={184}
                            height={290}
                        />

                        <Text style={[themeStyles.textHeadlineH1, themeStyles.alignSelfCenter, themeStyles.mt5]}>{translate('reportFraudConfirmationPage.title')}</Text>
                        <Text style={[themeStyles.textSupporting, themeStyles.alignSelfCenter, themeStyles.mt2, themeStyles.textAlignCenter]}>
                            {translate('reportFraudConfirmationPage.description')}
                        </Text>
                    </View>

                    <Button
                        text={translate('reportFraudConfirmationPage.buttonText')}
                        onPress={hide}
                        style={themeStyles.justifyContentEnd}
                        success
                        large
                    />
                </View>
            </ScreenWrapper>
        </Modal>
    );
}

ReportVirtualCardFraudConfirmationModal.displayName = 'ReportVirtualCardFraudConfirmationModal';

export default ReportVirtualCardFraudConfirmationModal;
