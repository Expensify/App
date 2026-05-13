import Airship, {PermissionStatus} from '@ua/react-native-airship';
import Log from '@libs/Log';
import type NotificationPermissionModule from './types';
import type {NotificationPermissionStatus} from './types';

function fromAirshipStatus(status: PermissionStatus): NotificationPermissionStatus {
    if (status === PermissionStatus.Granted) {
        return 'granted';
    }
    if (status === PermissionStatus.Denied) {
        return 'denied';
    }
    return 'default';
}

const NotificationPermissionNative: NotificationPermissionModule = {
    getStatus(): Promise<NotificationPermissionStatus> {
        return Airship.push
            .getNotificationStatus()
            .then(({notificationPermissionStatus}) => fromAirshipStatus(notificationPermissionStatus))
            .catch((error: unknown) => {
                Log.warn('[NotificationPermission] getStatus failed', {error: String(error)});
                return 'denied';
            });
    },

    request(): Promise<NotificationPermissionStatus> {
        return Airship.push
            .enableUserNotifications()
            .then((isEnabled) => (isEnabled ? 'granted' : 'denied'))
            .catch((error: unknown) => {
                Log.warn('[NotificationPermission] request failed', {error: String(error)});
                return 'denied';
            });
    },
};

export default NotificationPermissionNative;
