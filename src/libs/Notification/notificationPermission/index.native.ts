import type NotificationPermissionModule from './types';

const NotificationPermissionNative: NotificationPermissionModule = {
    getStatus: () => Promise.resolve('denied'),
    request: () => Promise.resolve('denied'),
};

export default NotificationPermissionNative;
