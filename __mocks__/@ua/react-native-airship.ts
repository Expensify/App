import type {AirshipContact, AirshipPush, AirshipPushAndroid, AirshipPushIOS, AirshipRoot} from '@ua/react-native-airship';

// eslint-disable-next-line no-restricted-syntax
enum EventType {
    NotificationResponse = 'com.airship.notification_response',
    PushReceived = 'com.airship.push_received',
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

const Airship: Partial<AirshipRoot> = {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    push,
    contact,
};

export default Airship;

export {EventType, iOS};
