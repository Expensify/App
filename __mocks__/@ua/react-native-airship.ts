import type {AirshipContact, AirshipLiveActivityManager, AirshipPush, AirshipPushAndroid, AirshipPushIOS, AirshipRoot, AirshipRootIOS} from '@ua/react-native-airship';

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

const pushIOS = jest.fn().mockImplementation(() => ({
    setBadgeNumber: jest.fn(),
    setForegroundPresentationOptions: jest.fn(),
    setForegroundPresentationOptionsCallback: jest.fn(),
}))() as AirshipPushIOS;

const pushAndroid = jest.fn().mockImplementation(() => ({
    setForegroundDisplayPredicate: jest.fn(),
}))() as AirshipPushAndroid;

const push = jest.fn().mockImplementation(() => ({
    iOS: pushIOS,
    android: pushAndroid,
    enableUserNotifications: () => Promise.resolve(false),
    clearNotifications: jest.fn(),
    getNotificationStatus: () => Promise.resolve({airshipOptIn: false, systemEnabled: false, airshipEnabled: false}),
    getActiveNotifications: () => Promise.resolve([]),
}))() as AirshipPush;

const contact = jest.fn().mockImplementation(() => ({
    identify: jest.fn(),
    getNamedUserId: () => Promise.resolve(undefined),
    reset: jest.fn(),
    module: jest.fn(),
}))() as AirshipContact;

const liveActivityManager = jest.fn().mockImplementation(() => ({
    list: jest.fn(() => Promise.resolve([])),
    listAll: jest.fn(() => Promise.resolve([])),
    start: jest.fn(() => Promise.resolve({id: 'mock-activity-id'})),
    update: jest.fn(() => Promise.resolve()),
    end: jest.fn(() => Promise.resolve()),
}))() as AirshipLiveActivityManager;

const airshipIOS = jest.fn().mockImplementation(() => ({
    liveActivityManager,
}))() as AirshipRootIOS;

const Airship: Partial<AirshipRoot> = {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    push,
    contact,
    iOS: airshipIOS,
};

export default Airship;

export {EventType, iOS, PermissionStatus};
