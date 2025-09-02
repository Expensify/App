import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type AuthenticationSuccessfullNotificationProps = {
    /** Notification visibility */
    isVisible: boolean;

    /** A callback to call when the notification has been closed */
    onConfirm?: () => void;
};

function AuthenticationSuccessfullNotification({isVisible, onConfirm = () => {}}: AuthenticationSuccessfullNotificationProps) {
    const {translate} = useLocalize();

    return (
        <View>
            <ConfirmModal
                title={translate('initialSettingsPage.troubleshoot.biometrics.notificationTitle')}
                isVisible={isVisible}
                onConfirm={() => {
                    onConfirm();
                }}
                prompt={translate('initialSettingsPage.troubleshoot.biometrics.notificationContent')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </View>
    );
}

AuthenticationSuccessfullNotification.displayName = 'AuthenticationSuccessfullNotification';

export default AuthenticationSuccessfullNotification;
