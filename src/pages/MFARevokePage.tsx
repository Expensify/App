import React, {useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

function MFARevokePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

    const isAccessRevokedOnAllDevices = false; // TODO: replace with actual logic

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const onConfirm = () => {
        // revokeMFA(); // TODO: implement the revokeMFA action
        hideConfirmModal();
        onGoBackPress();
    };

    return (
        <ScreenWrapper testID={MFARevokePage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.revokePage.headerTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                {isAccessRevokedOnAllDevices ? (
                    <>
                        <View style={[styles.flex1]}>
                            <Text style={[styles.mt3, styles.ph5]}>{translate('multiFactorAuthentication.revokePage.renableContent')}</Text>
                        </View>
                        <View style={[styles.flexRow, styles.m5]}>
                            <Button
                                success
                                style={[styles.flex1]}
                                onPress={onGoBackPress}
                                text={translate('common.buttonConfirm')}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={[styles.flex1]}>
                            <Text style={[styles.mt3, styles.ph5]}>{translate('multiFactorAuthentication.revokePage.revokeContent')}</Text>
                        </View>
                        <View style={[styles.flexRow, styles.m5]}>
                            <Button
                                danger
                                style={[styles.flex1]}
                                onPress={showConfirmModal}
                                text={translate('multiFactorAuthentication.revokePage.bottomButtonContent')}
                            />
                        </View>
                        <ConfirmModal
                            danger
                            title={translate('common.areYouSure')}
                            onConfirm={onConfirm}
                            onCancel={hideConfirmModal}
                            isVisible={isConfirmModalVisible}
                            prompt={translate('multiFactorAuthentication.revokePage.confirmationContent')}
                            confirmText={translate('multiFactorAuthentication.revokePage.bottomButtonContent')}
                            cancelText={translate('common.cancel')}
                            shouldDisableConfirmButtonWhenOffline
                            shouldShowCancelButton
                        />
                    </>
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MFARevokePage.displayName = 'MFARevokePage';

export default MFARevokePage;
