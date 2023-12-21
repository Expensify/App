import NotificationType from './NotificationType';
import PushNotificationType from './types';

// Push notifications are only supported on mobile, so we'll just noop here
const PushNotification: PushNotificationType = {
    init: () => {},
    register: () => {},
    deregister: () => {},
    onReceived: () => {},
    onSelected: () => {},
    TYPE: NotificationType,
    clearNotifications: () => {},
};

export default PushNotification;
