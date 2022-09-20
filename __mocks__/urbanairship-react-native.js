const EventType = {
    NotificationResponse: 'notificationResponse',
    PushReceived: 'pushReceived',
};

const UrbanAirship = {
    setUserNotificationsEnabled: jest.fn(),
    clearNotifications: jest.fn(),
    addListener: jest.fn(),
    getNamedUser: jest.fn(),
    enableUserPushNotifications: () => Promise.resolve(false),
    setNamedUser: jest.fn(),
    removeAllListeners: jest.fn(),
    setBadgeNumber: jest.fn(),
};

export default UrbanAirship;

export {
    EventType,
    UrbanAirship,
};
