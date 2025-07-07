"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://github.com/Richou/react-native-android-location-enabler/issues/40
// If we update our react native version, we need to test this file again
var geolocation_1 = require("@react-native-community/geolocation");
var react_native_android_location_enabler_1 = require("react-native-android-location-enabler");
var getCurrentPosition_types_1 = require("./getCurrentPosition.types");
geolocation_1.default.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
    locationProvider: 'auto',
});
var getCurrentPosition = function (success, error, config) {
    // Prompt's the user to enable geolocation permission with yes/no options
    // If the user selects yes, then this module would enable the native system location
    // Otherwise if user selects no, or we have an issue displaying the prompt, it will return an error
    (0, react_native_android_location_enabler_1.promptForEnableLocationIfNeeded)({
        interval: 2000, // This updates location after every 2 seconds (required prop). We don't depend on this as we only use the location once.
    })
        .then(function (permissionState) {
        if (permissionState === 'enabled') {
            // If the user just enabled the permission by clicking 'Ok', sometimes we need to wait before
            // the native system location/gps is setup, this is usually device specific, but a wait of a few
            // milliseconds will be enough. Currently its using 500ms, it seemed enough for Android 12 test
            // device. In rare cases when the device takes longer than 500ms, then Geolocation.getCurrentPosition
            // will throw an error in which case the user can always call the action again to retry (but its rare).
            setTimeout(function () {
                geolocation_1.default.getCurrentPosition(success, error, config);
            }, 500);
            return;
        }
        // if location permission is 'already-enabled', then directly get the updated location.
        geolocation_1.default.getCurrentPosition(success, error, config);
    })
        .catch(function () {
        // An error here can be because of these reasons
        // 1. User denied location permission
        // 2. Failure to open the permission dialog
        // 3. Device location settings can't be changed or the device doesn't support some location settings
        // 4. Any internal error
        // For all of these we will return a permission denied error.
        error({
            code: getCurrentPosition_types_1.GeolocationErrorCode.PERMISSION_DENIED,
            message: 'Geolocation is not supported by this environment.',
            PERMISSION_DENIED: getCurrentPosition_types_1.GeolocationErrorCode.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: getCurrentPosition_types_1.GeolocationErrorCode.POSITION_UNAVAILABLE,
            TIMEOUT: getCurrentPosition_types_1.GeolocationErrorCode.TIMEOUT,
            NOT_SUPPORTED: getCurrentPosition_types_1.GeolocationErrorCode.NOT_SUPPORTED,
        });
    });
};
exports.default = getCurrentPosition;
