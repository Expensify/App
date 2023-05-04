const {PERMISSIONS} = require('react-native-permissions/dist/commonjs/permissions');
const {RESULTS} = require('react-native-permissions/dist/commonjs/results');
const _ = require('underscore');

export {PERMISSIONS, RESULTS};

const openLimitedPhotoLibraryPicker = jest.fn(() => {});
const openSettings = jest.fn(() => {});
const check = jest.fn(() => RESULTS.GRANTED);
const request = jest.fn(() => RESULTS.GRANTED);
const checkLocationAccuracy = jest.fn(() => 'full');
const requestLocationAccuracy = jest.fn(() => 'full');

const notificationOptions = ['alert', 'badge', 'sound', 'carPlay', 'criticalAlert', 'provisional'];

const notificationSettings = {
    alert: true,
    badge: true,
    sound: true,
    carPlay: true,
    criticalAlert: true,
    provisional: true,
    lockScreen: true,
    notificationCenter: true,
};

const checkNotifications = jest.fn(() => ({
    status: RESULTS.GRANTED,
    settings: notificationSettings,
}));

const requestNotifications = jest.fn((options) => ({
    status: RESULTS.GRANTED,
    settings: _.chain(options)
        .filter((option) => _.contains(notificationOptions, option))
        .reduce((acc, option) => ({...acc, [option]: true}), {
            lockScreen: true,
            notificationCenter: true,
        })
        .value(),
}));

const checkMultiple = jest.fn((permissions) =>
    _.reduce(permissions, (acc, permission) => ({
        ...acc,
        [permission]: RESULTS.GRANTED,
    })),
);

const requestMultiple = jest.fn((permissions) =>
    _.reduce(permissions, (acc, permission) => ({
        ...acc,
        [permission]: RESULTS.GRANTED,
    })),
);

export default {
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

export {
    openLimitedPhotoLibraryPicker,
    openSettings,
    check,
    request,
    checkLocationAccuracy,
    requestLocationAccuracy,
    checkNotifications,
    requestNotifications,
    checkMultiple,
    requestMultiple,
};
