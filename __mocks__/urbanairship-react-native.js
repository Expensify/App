const EventType = {
    NotificationResponse: 'notificationResponse',
    PushReceived: 'pushReceived',
};

const iOS = {
    ForegroundPresentationOption: {
        Alert: 'alert',
        Sound: 'sound',
        Badge: 'badge',
    },
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
    setForegroundPresentationOptions: jest.fn(),
    getNotificationStatus: jest.fn(),
};

export default UrbanAirship;

export {
    EventType,
    iOS,
    UrbanAirship,
};
