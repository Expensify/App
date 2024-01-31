import type {AirshipContact, AirshipPush, AirshipPushAndroid, AirshipPushIOS, AirshipRoot} from '@ua/react-native-airship';
import {EventType as EventTypeAirship, iOS as iOSAirship} from '@ua/react-native-airship';

const EventType: Partial<typeof EventTypeAirship> = {
    NotificationResponse: EventTypeAirship.NotificationResponse,
    PushReceived: EventTypeAirship.PushReceived,
};

const iOS: Partial<typeof iOSAirship> = {
    ForegroundPresentationOption: {
        Sound: iOSAirship.ForegroundPresentationOption.Sound,
        Badge: iOSAirship.ForegroundPresentationOption.Badge,
        Banner: iOSAirship.ForegroundPresentationOption.Banner,
        List: iOSAirship.ForegroundPresentationOption.List,
    },
};

const pushIOS: AirshipPushIOS = jest.fn().mockImplementation(() => ({
    setBadgeNumber: jest.fn(),
    setForegroundPresentationOptions: jest.fn(),
    setForegroundPresentationOptionsCallback: jest.fn(),
}))();

const pushAndroid: AirshipPushAndroid = jest.fn().mockImplementation(() => ({
    setForegroundDisplayPredicate: jest.fn(),
}))();

const push: AirshipPush = jest.fn().mockImplementation(() => ({
    iOS: pushIOS,
    android: pushAndroid,
    enableUserNotifications: () => Promise.resolve(false),
    clearNotifications: jest.fn(),
    getNotificationStatus: () => Promise.resolve({airshipOptIn: false, systemEnabled: false, airshipEnabled: false}),
    getActiveNotifications: () => Promise.resolve([]),
}))();

const contact: AirshipContact = jest.fn().mockImplementation(() => ({
    identify: jest.fn(),
    getNamedUserId: () => Promise.resolve(undefined),
    reset: jest.fn(),
    module: jest.fn(),
}))();

const Airship: Partial<AirshipRoot> = {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    push,
    contact,
};

export default Airship;

export {EventType, iOS};
