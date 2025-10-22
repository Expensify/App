import type {ValueOf} from 'type-fest';
import type {GetCurrentPosition} from './getCurrentPosition.types';
import {GeolocationErrorCode} from './getCurrentPosition.types';
import type {LocationPermissionState} from './locationPermission';
import {LOCATION_PERMISSION_STATES} from './locationPermission';

const makeError = (code: ValueOf<typeof GeolocationErrorCode>, message: string) => ({
    code,
    message,
    PERMISSION_DENIED: GeolocationErrorCode.PERMISSION_DENIED,
    POSITION_UNAVAILABLE: GeolocationErrorCode.POSITION_UNAVAILABLE,
    TIMEOUT: GeolocationErrorCode.TIMEOUT,
    NOT_SUPPORTED: GeolocationErrorCode.NOT_SUPPORTED,
});

const isLocationPermissionState = (status: unknown): status is LocationPermissionState =>
    typeof status === 'string' && Object.values(LOCATION_PERMISSION_STATES).includes(status as LocationPermissionState);

const getCurrentPosition: GetCurrentPosition = (success, error, options) => {
    const doGeoRequest = () => {
        try {
            navigator.geolocation.getCurrentPosition(success, error, options);
        } catch (caughtError) {
            let reason = 'Geolocation call failed';
            if (caughtError instanceof Error) {
                reason = caughtError.message;
            } else if (typeof caughtError === 'string') {
                reason = caughtError;
            }

            error(makeError(GeolocationErrorCode.POSITION_UNAVAILABLE, reason));
        }
    };

    // IPC-based permission checking
    if (typeof window !== 'undefined' && window.electron?.invoke) {
        window.electron
            .invoke('check-location-permission')
            .then((permissionStatus: unknown) => {
                if (!isLocationPermissionState(permissionStatus)) {
                    error(makeError(GeolocationErrorCode.PERMISSION_DENIED, 'Unable to verify location permissions. Enable location access and try again.'));
                    return;
                }

                if (permissionStatus === LOCATION_PERMISSION_STATES.DENIED) {
                    error(makeError(GeolocationErrorCode.PERMISSION_DENIED, 'Location access denied. Enable location permissions in system settings.'));
                    return;
                }

                doGeoRequest();
            })
            .catch(() => {
                error(makeError(GeolocationErrorCode.PERMISSION_DENIED, 'Unable to verify location permissions. Enable location access and try again.'));
            });

        return; // handled via IPC
    }

    doGeoRequest(); // Fallback to direct geolocation
};

export default getCurrentPosition;
