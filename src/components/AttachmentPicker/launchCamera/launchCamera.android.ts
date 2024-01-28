import {PermissionsAndroid} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import type {CameraOptions, Callback, ErrorCode} from './types';

/**
 * Launching the camera for Android involves checking for permissions
 * And only then starting the camera
 * If the user deny permission the callback will be called with an error response
 * in the same format as the error returned by react-native-image-picker
 */
export default function launchCameraAndroid(options: CameraOptions, callback: Callback) {
    // Checks current camera permissions and prompts the user in case they aren't granted
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
        .then((permission) => {
            if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
                const error = new Error('User did not grant permissions');
                error.errorCode = 'permission';
                throw error;
            }

            launchCamera(options, callback);
        })
        .catch((error) => {
            /* Intercept the permission error as well as any other errors and call the callback
             * follow the same pattern expected for image picker results */
            callback({
                errorMessage: error.message,
                errorCode: error.errorCode || 'others',
            });
        });
}
