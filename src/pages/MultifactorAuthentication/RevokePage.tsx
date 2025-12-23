import React, {useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationRevokeConfirmModal from '@components/MultifactorAuthentication/RevokeConfirmModal';
import MultifactorAuthenticationRevokeContent from '@components/MultifactorAuthentication/RevokeContent';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

function MultifactorAuthenticationRevokePage() {
    const {translate} = useLocalize();
    const {trigger, info} = useMultifactorAuthenticationContext();

    const isAccessRevokedOnAllDevices = !info.isAnyDeviceRegistered;

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onGoBackPress = () => {
        Navigation.dismissModal();
    };

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const onConfirm = () => {
        trigger(CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.REVOKE);
        hideConfirmModal();
        onGoBackPress();
    };

    return (
        <ScreenWrapper testID={MultifactorAuthenticationRevokePage.displayName}>
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.revokeAccess.faceOrFingerprintVerification')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <MultifactorAuthenticationRevokeContent
                    isAccessRevoked={isAccessRevokedOnAllDevices}
                    onGoBackPress={onGoBackPress}
                    onShowConfirmModal={showConfirmModal}
                />
                {!isAccessRevokedOnAllDevices && (
                    <MultifactorAuthenticationRevokeConfirmModal
                        isVisible={isConfirmModalVisible}
                        onConfirm={onConfirm}
                        onCancel={hideConfirmModal}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationRevokePage.displayName = 'MultifactorAuthenticationRevokePage';

export default MultifactorAuthenticationRevokePage;
