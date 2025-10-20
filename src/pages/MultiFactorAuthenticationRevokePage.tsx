import React, {useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Text from '@components/Text';
import ConfirmModal from '@components/ConfirmModal';
import ONYXKEYS from '@src/ONYXKEYS';
import Button from '@components/Button';

function multiFactorAuthenticationRevokePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

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
        <ScreenWrapper testID={multiFactorAuthenticationRevokePage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.revokePage.headerTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1]}>
                    <Text style={[styles.mt5, styles.ph5]}>
                        {translate('multiFactorAuthentication.revokePage.pageContent')}
                    </Text>
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
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

multiFactorAuthenticationRevokePage.displayName = 'multiFactorAuthenticationRevokePage';

export default multiFactorAuthenticationRevokePage;