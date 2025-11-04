import React, {useCallback, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MFARevokeConfirmModal from '@components/MFA/MFARevokeConfirmModal';
import MFARevokeContent from '@components/MFA/MFARevokeContent';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';

function MFARevokePage() {
    const {translate} = useLocalize();

    const isAccessRevokedOnAllDevices = false; // TODO: replace with actual logic

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
        // revokeMFA(); // TODO: implement the revokeMFA action
        hideConfirmModal();
        onGoBackPress();
    }, [hideConfirmModal, onGoBackPress]);

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
