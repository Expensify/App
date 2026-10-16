import type {
    AirshipContact,
    AirshipLiveActivityManager,
    AirshipPush,
    AirshipPushAndroid,
    AirshipPushIOS,
    AirshipRoot,
    AirshipRootIOS,
    LiveActivity,
    PushNotificationStatus,
} from '@ua/react-native-airship';

import createMock from 'tests/utils/createMock';

// eslint-disable-next-line no-restricted-syntax
enum EventType {
    NotificationResponse = 'com.airship.notification_response',
    PushReceived = 'com.airship.push_received',
}

// eslint-disable-next-line no-restricted-syntax
enum PermissionStatus {
    Granted = 'granted',
    Denied = 'denied',
    NotDetermined = 'not_determined',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace iOS {
    /**
     * Enum of foreground notification options.
     */
    // eslint-disable-next-line no-restricted-syntax, rulesdir/no-inline-named-export
    export enum ForegroundPresentationOption {
        /**
         * Play the sound associated with the notification.
         */
        Sound = 'sound',
        /**
         * Apply the notification's badge value to the app’s icon.
         */
        Badge = 'badge',

        /**
         * Show the notification in Notification Center. On iOS 13 an older,
         * this will also show the notification as a banner.
         */
        List = 'list',

        /**
         * Present the notification as a banner. On iOS 13 an older,
         * this will also show the notification in the Notification Center.
         */
        Banner = 'banner',
    }
}

const pushIOS = createMock<AirshipPushIOS>({
    setBadgeNumber: jest.fn(),
    setForegroundPresentationOptions: jest.fn(),
    setForegroundPresentationOptionsCallback: jest.fn(),
});

const pushAndroid = createMock<AirshipPushAndroid>({
    setForegroundDisplayPredicate: jest.fn(),
});

const notificationStatus: PushNotificationStatus = {
    isUserNotificationsEnabled: false,
    areNotificationsAllowed: false,
    isPushPrivacyFeatureEnabled: false,
    isPushTokenRegistered: false,
    isOptedIn: false,
    isUserOptedIn: false,
    notificationPermissionStatus: PermissionStatus.Denied,
};
const push = createMock<AirshipPush>({
    iOS: pushIOS,
    android: pushAndroid,
    enableUserNotifications: () => Promise.resolve(false),
    clearNotifications: jest.fn(),
    getNotificationStatus: () => Promise.resolve(notificationStatus),
    getActiveNotifications: () => Promise.resolve([]),
});

const contact = createMock<AirshipContact>({
    identify: jest.fn(),
    getNamedUserId: () => Promise.resolve(undefined),
    reset: jest.fn(),
});

const liveActivityManager = createMock<AirshipLiveActivityManager>({
    list: jest.fn(() => Promise.resolve([])),
    listAll: jest.fn(() => Promise.resolve([])),
    start: jest.fn(() => Promise.resolve(createMock<LiveActivity>({id: 'mock-activity-id'}))),
    update: jest.fn(() => Promise.resolve()),
    end: jest.fn(() => Promise.resolve()),
});

const airshipIOS = createMock<AirshipRootIOS>({
    liveActivityManager,
});

const Airship: Partial<AirshipRoot> = {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    push,
    contact,
    iOS: airshipIOS,
};

export default Airship;

export {EventType, iOS, PermissionStatus};
