import {PERMISSIONS, RESULTS} from 'react-native-permissions/dist/commonjs/permissions';
import type {ValueOf} from 'type-fest';

type Results = ValueOf<typeof RESULTS>;
type ResultsCollection = Record<string, Results>;
type NotificationSettings = Record<string, boolean>;
type Notification = {status: Results; settings: NotificationSettings};

const openLimitedPhotoLibraryPicker: jest.Mock<void> = jest.fn(() => {});
const openSettings: jest.Mock<void> = jest.fn(() => {});
const check = jest.fn(() => RESULTS.GRANTED as string);
const request = jest.fn(() => RESULTS.GRANTED as string);
const checkLocationAccuracy: jest.Mock<string> = jest.fn(() => 'full');
const requestLocationAccuracy: jest.Mock<string> = jest.fn(() => 'full');

const notificationOptions = new Set<string>(['alert', 'badge', 'sound', 'carPlay', 'criticalAlert', 'provisional']);

const notificationSettings: NotificationSettings = {
    alert: true,
    badge: true,
    sound: true,
    carPlay: true,
    criticalAlert: true,
    provisional: true,
    lockScreen: true,
    notificationCenter: true,
};

const checkNotifications: jest.Mock<Notification> = jest.fn(() => ({
    status: RESULTS.GRANTED,
    settings: notificationSettings,
}));

const requestNotifications: jest.Mock<Notification> = jest.fn((options: Record<string, string>) => ({
    status: RESULTS.GRANTED,
    settings: Object.keys(options)
        .filter((option: string) => notificationOptions.has(option))
        .reduce(
            (acc: NotificationSettings, option: string) => {
                acc[option] = true;
                return acc;
            },
            {
                lockScreen: true,
                notificationCenter: true,
            },
        ),
}));

const checkMultiple: jest.Mock<ResultsCollection> = jest.fn((permissions: string[]) =>
    permissions.reduce((acc: ResultsCollection, permission: string) => {
        acc[permission] = RESULTS.GRANTED;
        return acc;
    }, {}),
);

const requestMultiple: jest.Mock<ResultsCollection> = jest.fn((permissions: string[]) =>
    permissions.reduce((acc: ResultsCollection, permission: string) => {
        acc[permission] = RESULTS.GRANTED;
        return acc;
    }, {}),
);

export {
    PERMISSIONS,
    RESULTS,
    check,
    checkLocationAccuracy,
    checkMultiple,
    checkNotifications,
    openLimitedPhotoLibraryPicker,
    openSettings,
    request,
    requestLocationAccuracy,
    requestMultiple,
    requestNotifications,
};
