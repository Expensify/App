import React from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import {resolveRequestNotificationPermision, showRequestNotificationPermissionModal} from '@libs/Notification/LocalNotification/BrowserNotifications';
import ONYXKEYS from '@src/ONYXKEYS';

function RequestNotificationPermision() {
    const [isNotificationPopupShow] = useOnyx(ONYXKEYS.IS_REQUEST_NOTIFICATION_PERMISSION_SHOW, {canBeMissing: true});

    return (
        <ConfirmModal
            title={'Turn on the nofications'}
            isVisible={isNotificationPopupShow ?? false}
            onConfirm={() => {
                // Check their global preferences for browser notifications and ask permission if they have none
                Notification.requestPermission().then((status) => {
                    resolveRequestNotificationPermision(status);
                });
                showRequestNotificationPermissionModal(false);
            }}
            onCancel={() => {
                resolveRequestNotificationPermision('denied');
                showRequestNotificationPermissionModal(false);
            }}
            prompt={'Allow to notificate'}
            confirmText={'OK'}
            cancelText={'Cancel'}
            danger
            shouldEnableNewFocusManagement
        />
    );
}

RequestNotificationPermision.displayName = 'RequestNotificationPermision';

export default RequestNotificationPermision;
