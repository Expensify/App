import type NotificationPermissionModule from './types';

const NotificationPermissionNative: NotificationPermissionModule = {
    getStatusSync: () => 'denied',
    getStatus: () => Promise.resolve('denied'),
    request: () => Promise.resolve('denied'),
};

export default NotificationPermissionNative;
