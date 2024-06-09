import {PermissionsAndroid} from 'react-native';
import {launchCamera as launchCameraImagePicker} from 'react-native-image-picker';
import type {LaunchCamera} from './types';
import {ErrorLaunchCamera} from './types';

/**
 * Launching the camera for Android involves checking for permissions
 * And only then starting the camera
 * If the user deny permission the callback will be called with an error response
 * in the same format as the error returned by react-native-image-picker
 */
const launchCamera: LaunchCamera = (options, callback) => {
    // Checks current camera permissions and prompts the user in case they aren't granted
    const cameraPermission = PermissionsAndroid.PERMISSIONS.CAMERA;
    if (!cameraPermission) {
        return
    }
    PermissionsAndroid.request(cameraPermission)
        .then((permission) => {
            if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
                throw new ErrorLaunchCamera('User did not grant permissions', 'permission');
            }

            launchCameraImagePicker(options, callback);
        })
        .catch((error) => {
            /* Intercept the permission error as well as any other errors and call the callback
             * follow the same pattern expected for image picker results */
            callback({
                errorMessage: error.message,
                errorCode: error.errorCode || 'others',
            });
        });
};

export default launchCamera;
