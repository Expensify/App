import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type AuthenticationSuccessfulNotificationProps = {
    /** Notification visibility */
    isVisible: boolean;

    /** A callback to call when the notification has been closed */
    onConfirm?: () => void;
};

function AuthenticationSuccessfulNotification({isVisible, onConfirm = () => {}}: AuthenticationSuccessfulNotificationProps) {
    const {translate} = useLocalize();

    return (
        <View>
            <ConfirmModal
                title={translate('initialSettingsPage.troubleshoot.biometrics.notificationTitle')}
                isVisible={isVisible}
                onConfirm={onConfirm}
                prompt={translate('initialSettingsPage.troubleshoot.biometrics.notificationFallbackContent')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </View>
    );
}

AuthenticationSuccessfulNotification.displayName = 'AuthenticationSuccessfulNotification';

export default AuthenticationSuccessfulNotification;