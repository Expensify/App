import type NotificationPermissionModule from './types';
import type {NotificationPermissionStatus} from './types';

function toStatus(permission: NotificationPermission): NotificationPermissionStatus {
    if (permission === 'granted' || permission === 'denied') {
        return permission;
    }
    return 'default';
}

const NotificationPermissionWeb: NotificationPermissionModule = {
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
        return Notification.requestPermission().then(toStatus);
    },
};

export default NotificationPermissionWeb;
