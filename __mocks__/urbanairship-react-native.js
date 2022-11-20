const EventType = {
    NotificationResponse: 'notificationResponse',
    PushReceived: 'pushReceived',
};

export default {
    setUserNotificationsEnabled: jest.fn(),
    clearNotifications: jest.fn(),
    addListener: jest.fn(),
    getNamedUser: jest.fn(),
    enableUserPushNotifications: () => Promise.resolve(false),
    setNamedUser: jest.fn(),
    removeAllListeners: jest.fn(),
    setBadgeNumber: jest.fn(),
    getNotificationStatus: jest.fn(),
};

export {
    EventType,
};
