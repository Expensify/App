import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import ConfirmModal from './ConfirmModal';

type SuccessfulAuthenticationNotificationProps = {
    /** Notification visibility */
    isVisible: boolean;

    /** A callback to call when the notification has been closed */
    onConfirm?: () => void;
};

function SuccessfulAuthenticationNotification({isVisible, onConfirm = () => {}}: SuccessfulAuthenticationNotificationProps) {
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

SuccessfulAuthenticationNotification.displayName = 'SuccessfulAuthenticationNotification';

export default SuccessfulAuthenticationNotification;