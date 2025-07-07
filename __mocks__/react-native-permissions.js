"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestNotifications = exports.requestMultiple = exports.requestLocationAccuracy = exports.request = exports.openSettings = exports.openLimitedPhotoLibraryPicker = exports.checkNotifications = exports.checkMultiple = exports.checkLocationAccuracy = exports.check = exports.RESULTS = exports.PERMISSIONS = void 0;
var permissions_1 = require("react-native-permissions/dist/commonjs/permissions");
Object.defineProperty(exports, "PERMISSIONS", { enumerable: true, get: function () { return permissions_1.PERMISSIONS; } });
Object.defineProperty(exports, "RESULTS", { enumerable: true, get: function () { return permissions_1.RESULTS; } });
var openLimitedPhotoLibraryPicker = jest.fn(function () { });
exports.openLimitedPhotoLibraryPicker = openLimitedPhotoLibraryPicker;
var openSettings = jest.fn(function () { });
exports.openSettings = openSettings;
var check = jest.fn(function () { return permissions_1.RESULTS.GRANTED; });
exports.check = check;
var request = jest.fn(function () { return permissions_1.RESULTS.GRANTED; });
exports.request = request;
var checkLocationAccuracy = jest.fn(function () { return 'full'; });
exports.checkLocationAccuracy = checkLocationAccuracy;
var requestLocationAccuracy = jest.fn(function () { return 'full'; });
exports.requestLocationAccuracy = requestLocationAccuracy;
var notificationOptions = ['alert', 'badge', 'sound', 'carPlay', 'criticalAlert', 'provisional'];
var notificationSettings = {
    alert: true,
    badge: true,
    sound: true,
    carPlay: true,
    criticalAlert: true,
    provisional: true,
    lockScreen: true,
    notificationCenter: true,
};
var checkNotifications = jest.fn(function () { return ({
    status: permissions_1.RESULTS.GRANTED,
    settings: notificationSettings,
}); });
exports.checkNotifications = checkNotifications;
var requestNotifications = jest.fn(function (options) { return ({
    status: permissions_1.RESULTS.GRANTED,
    settings: Object.keys(options)
        .filter(function (option) { return notificationOptions.includes(option); })
        .reduce(function (acc, option) {
        acc[option] = true;
        return acc;
    }, {
        lockScreen: true,
        notificationCenter: true,
    }),
}); });
exports.requestNotifications = requestNotifications;
var checkMultiple = jest.fn(function (permissions) {
    return permissions.reduce(function (acc, permission) {
        acc[permission] = permissions_1.RESULTS.GRANTED;
        return acc;
    }, {});
});
exports.checkMultiple = checkMultiple;
var requestMultiple = jest.fn(function (permissions) {
    return permissions.reduce(function (acc, permission) {
        acc[permission] = permissions_1.RESULTS.GRANTED;
        return acc;
    }, {});
});
exports.requestMultiple = requestMultiple;
