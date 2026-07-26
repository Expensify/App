type NotificationPermissionStatus = 'granted' | 'denied' | 'default';

type NotificationPermissionModule = {
    getStatus: () => Promise<NotificationPermissionStatus>;
    request: () => Promise<NotificationPermissionStatus>;
};

export default NotificationPermissionModule;
export type {NotificationPermissionStatus};
