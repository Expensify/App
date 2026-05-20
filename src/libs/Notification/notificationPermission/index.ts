// Web-only. There is no .native variant on purpose: on iOS/Android the
// notification permission prompt is owned by the existing push-registration
// flow, so the `window.Notification` guards below cause getStatus and request
// to resolve to 'denied' on native, which disables the EnableNotificationsBanner.
import Log from '@libs/Log';
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
        return Notification.requestPermission()
            .then(toStatus)
            .catch((error: unknown) => {
                Log.warn('[NotificationPermission] request failed', {error: String(error)});
                return 'denied';
            });
    },
};

export default NotificationPermissionWeb;
