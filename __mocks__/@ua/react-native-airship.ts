import type {AirshipContact, AirshipPush, AirshipPushAndroid, AirshipPushIOS, AirshipRoot} from '@ua/react-native-airship';
import {EventType as AirshipEventType, iOS as AirshipIOS} from '@ua/react-native-airship';

const EventType: Partial<typeof AirshipEventType> = {
    NotificationResponse: AirshipEventType.NotificationResponse,
    PushReceived: AirshipEventType.PushReceived,
};

const iOS: Partial<typeof AirshipIOS> = {
    ForegroundPresentationOption: {
        Sound: AirshipIOS.ForegroundPresentationOption.Sound,
        Badge: AirshipIOS.ForegroundPresentationOption.Badge,
        Banner: AirshipIOS.ForegroundPresentationOption.Banner,
        List: AirshipIOS.ForegroundPresentationOption.List,
    },
};

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
