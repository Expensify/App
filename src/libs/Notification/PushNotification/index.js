import NotificationType from './NotificationType';

// Push notifications are only supported on mobile, so we'll just noop here
export default {
    register: () => {},
    deregister: () => {},
    onReceived: () => {},
    onSelected: () => {},
    TYPE: NotificationType,
    clearNotifications: () => {},
};
