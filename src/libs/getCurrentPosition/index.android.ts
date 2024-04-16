// https://github.com/Richou/react-native-android-location-enabler/issues/40
// If we update our react native version, we need to test this file again
import Geolocation from '@react-native-community/geolocation';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';
import type {GetCurrentPosition} from './getCurrentPosition.types';
import {GeolocationErrorCode} from './getCurrentPosition.types';

Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
    locationProvider: 'auto',
});

const getCurrentPosition: GetCurrentPosition = (success, error, config) => {
    // Prompt's the user to enable geolocation permission with yes/no options
    // If the user selects yes, then this module would enable the native system location
    // Otherwise if user selects no, or we have an issue displaying the prompt, it will return an error
    promptForEnableLocationIfNeeded({
        interval: 2000, // This updates location after every 2 seconds (required prop). We don't depend on this as we only use the location once.
    })
        .then((permissionState) => {
            if (permissionState === 'enabled') {
                // If the user just enabled the permission by clicking 'Ok', sometimes we need to wait before
                // the native system location/gps is setup, this is usually device specific, but a wait of a few
                // milliseconds will be enough. Currently its using 500ms, it seemed enough for Android 12 test
                // device. In rare cases when the device takes longer than 500ms, then Geolocation.getCurrentPosition
                // will throw an error in which case the user can always call the action again to retry (but its rare).
                setTimeout(() => {
                    Geolocation.getCurrentPosition(success, error, config);
                }, 500);
                return;
            }

            // if location permission is 'already-enabled', then directly get the updated location.
            Geolocation.getCurrentPosition(success, error, config);
        })
        .catch(() => {
            // An error here can be because of these reasons
            // 1. User denied location permission
            // 2. Failure to open the permission dialog
            // 3. Device location settings can't be changed or the device doesn't support some location settings
            // 4. Any internal error
            // For all of these we will return a permission denied error.
            error({
                code: GeolocationErrorCode.PERMISSION_DENIED,
                message: 'Geolocation is not supported by this environment.',
                PERMISSION_DENIED: GeolocationErrorCode.PERMISSION_DENIED,
                POSITION_UNAVAILABLE: GeolocationErrorCode.POSITION_UNAVAILABLE,
                TIMEOUT: GeolocationErrorCode.TIMEOUT,
                NOT_SUPPORTED: GeolocationErrorCode.NOT_SUPPORTED,
            });
        });
};

export default getCurrentPosition;
