import React, {useCallback, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MFARevokeConfirmModal from '@components/MultiFactorAuthentication/MFARevokeConfirmModal';
import MFARevokeContent from '@components/MultiFactorAuthentication/MFARevokeContent';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

function MFARevokePage() {
    const {translate} = useLocalize();
    const {trigger, info} = useMultifactorAuthenticationContext();

    const isAccessRevokedOnAllDevices = !info.isAnyDeviceRegistered;

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onGoBackPress = useCallback(() => {
        Navigation.dismissModal();
    }, []);

    const showConfirmModal = useCallback(() => {
        setConfirmModalVisibility(true);
    }, []);

    const hideConfirmModal = useCallback(() => {
        setConfirmModalVisibility(false);
    }, []);

    const onConfirm = useCallback(() => {
        trigger(CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.REVOKE);
        hideConfirmModal();
        onGoBackPress();
    }, [hideConfirmModal, onGoBackPress, trigger]);

    return (
        <ScreenWrapper testID={MFARevokePage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.revokePage.headerTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <MFARevokeContent
                    isAccessRevoked={isAccessRevokedOnAllDevices}
                    onGoBackPress={onGoBackPress}
                    onShowConfirmModal={showConfirmModal}
                />
                {!isAccessRevokedOnAllDevices && (
                    <MFARevokeConfirmModal
                        isVisible={isConfirmModalVisible}
                        onConfirm={onConfirm}
                        onCancel={hideConfirmModal}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MFARevokePage.displayName = 'MFARevokePage';

export default MFARevokePage;
