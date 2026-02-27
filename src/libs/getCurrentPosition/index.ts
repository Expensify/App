import {getCurrentPositionAsync, PermissionStatus, requestForegroundPermissionsAsync} from 'expo-location';
import type {PermissionResponse} from 'expo-location';
import {GeolocationErrorCode} from './getCurrentPosition.types';
import type {GetCurrentPosition} from './getCurrentPosition.types';
import getGeolocationError from './getGeolocationError';

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
        const geolocationError = getGeolocationError(caughtError);
        error(geolocationError);
    }
};

export default getCurrentPosition;
