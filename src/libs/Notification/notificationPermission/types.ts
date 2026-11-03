type NotificationPermissionStatus = 'granted' | 'denied' | 'default';

type NotificationPermissionModule = {
    getStatusSync: () => NotificationPermissionStatus;
    getStatus: () => Promise<NotificationPermissionStatus>;
    request: () => Promise<NotificationPermissionStatus>;
};

export default NotificationPermissionModule;
export type {NotificationPermissionStatus};
