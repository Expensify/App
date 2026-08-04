import Log from '@libs/Log';

import type NotificationPermissionModule from './types';
import type {NotificationPermissionStatus} from './types';

function toStatus(permission: NotificationPermission): NotificationPermissionStatus {
    if (permission === 'granted' || permission === 'denied') {
        return permission;
    }
    return 'default';
}

const NotificationPermission: NotificationPermissionModule = {
    getStatus(): Promise<NotificationPermissionStatus> {
        if (typeof window === 'undefined' || !window.Notification) {
            return Promise.resolve('denied');
        }
        return Promise.resolve(toStatus(Notification.permission));
    },

    request(): Promise<NotificationPermissionStatus> {
        if (typeof window === 'undefined' || !window.Notification) {
            return Promise.resolve('denied');
        }
        return Notification.requestPermission()
            .then(toStatus)
            .catch((error: unknown) => {
                Log.warn('[NotificationPermission] request failed', {error: String(error)});
                return 'denied';
            });
    },
};

export default NotificationPermission;
