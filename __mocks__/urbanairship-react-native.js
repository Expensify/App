export default {
    setUserNotificationsEnabled: jest.fn(),
};

const EventType = {
    NotificationResponse: 'notificationResponse',
    PushReceived: 'pushReceived',
};

export {
    EventType,
};
