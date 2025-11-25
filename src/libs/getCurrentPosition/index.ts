import {getCurrentPositionAsync, PermissionStatus, requestForegroundPermissionsAsync} from 'expo-location';
import type {PermissionResponse} from 'expo-location';
import {GeolocationErrorCode} from './getCurrentPosition.types';
import type {GetCurrentPosition} from './getCurrentPosition.types';

const getCurrentPosition: GetCurrentPosition = async (success, error, options) => {
    const foregroundPermissionResponse: PermissionResponse = await requestForegroundPermissionsAsync();

    if (foregroundPermissionResponse.status !== PermissionStatus.GRANTED) {
        error({code: GeolocationErrorCode.PERMISSION_DENIED, message: 'User denied access to location.'});
        return;
    }

    try {
        const currentPosition = await getCurrentPositionAsync(options);
        success(currentPosition);
    } catch (caughtError) {
        let message = 'Geolocation call failed';
        let code = GeolocationErrorCode.POSITION_UNAVAILABLE;

        if (caughtError instanceof GeolocationPositionError) {
            code = caughtError.code;
            message = caughtError.message;
        } else if (caughtError instanceof Error) {
            message = caughtError.message;
        } else if (typeof caughtError === 'string') {
            message = caughtError;
        }

        error({code, message});
    }
};

export default getCurrentPosition;
