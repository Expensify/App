import {launchCamera} from 'react-native-image-picker';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import type {Callback, CameraOptions} from './types';
import {ErrorLaunchCamera} from './types';

/**
 * Launching the camera for iOS involves checking for permissions
 * And only then starting the camera
 * If the user deny permission the callback will be called with an error response
 * in the same format as the error returned by react-native-image-picker
 */
export default function launchCameraIOS(options: CameraOptions, callback: Callback) {
    // Checks current camera permissions and prompts the user in case they aren't granted
    request(PERMISSIONS.IOS.CAMERA)
        .then((permission) => {
            if (permission !== RESULTS.GRANTED) {
                throw new ErrorLaunchCamera('User did not grant permissions', 'permission');
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
