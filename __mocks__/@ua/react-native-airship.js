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

const Airship = {
    setUserNotificationsEnabled: jest.fn(),
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    setBadgeNumber: jest.fn(),
    push: {
        iOS: {
            setBadgeNumber: jest.fn(),
            setForegroundPresentationOptions: jest.fn(),
            setForegroundPresentationOptionsCallback: jest.fn(),
        },
        android: {
            setForegroundDisplayPredicate: jest.fn(),
        },
        enableUserNotifications: () => Promise.resolve(false),
        clearNotifications: jest.fn(),
        getNotificationStatus: () => Promise.resolve({airshipOptIn: false, systemEnabled: false}),
    },
    contact: {
        identify: jest.fn(),
        getNamedUserId: jest.fn(),
        reset: jest.fn(),
    },
};

export default Airship;

export {EventType, iOS};
