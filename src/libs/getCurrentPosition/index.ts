import {getCurrentPositionAsync, PermissionStatus, requestForegroundPermissionsAsync} from 'expo-location';
import type {PermissionResponse} from 'expo-location';
import {GeolocationErrorCode} from './getCurrentPosition.types';
import type {GetCurrentPosition} from './getCurrentPosition.types';

const getCurrentPosition: GetCurrentPosition = async (success, error, options) => {
    const foregroundPermissionResponse: PermissionResponse = await requestForegroundPermissionsAsync();

    if (foregroundPermissionResponse.status !== PermissionStatus.GRANTED) {
        error({code: GeolocationErrorCode.PERMISSION_DENIED, message: 'Geolocation is not supported by this environment.'});
    }

    try {
        const currentPosition = await getCurrentPositionAsync(options);
        success(currentPosition);
    } catch (caughtError) {
        let message = 'Geolocation call failed';
        if (caughtError instanceof Error) {
            message = caughtError.message;
        } else if (typeof caughtError === 'string') {
            message = caughtError;
        }

        error({code: GeolocationErrorCode.POSITION_UNAVAILABLE, message});
    }
};

export default getCurrentPosition;
