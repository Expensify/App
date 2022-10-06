import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {launchCamera} from 'react-native-image-picker';

/**
 * Launching the camera for iOS involves checking for permissions
 * And only then starting the camera
 * If the user deny permission the callback will be called with an error response
 * in the same format as the error returned by react-native-image-picker
 * @param {CameraOptions} options
 * @param {function} callback - callback called with the result
 */
export default function launchCameraIOS(options, callback) {
    // Checks current camera permissions and prompts the user in case they aren't granted
    request(PERMISSIONS.IOS.CAMERA)
        .then((permission) => {
            if (permission !== RESULTS.GRANTED) {
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
