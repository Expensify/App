import EventType from './EventType';
import NotificationType from './NotificationType';

// Push notifications are only supported on mobile, so we'll just noop here
export default {
    enable: () => {},
    bind: () => {},
    EventType,
    NotificationType,
};
