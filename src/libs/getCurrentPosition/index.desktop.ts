import type {GetCurrentPosition} from './getCurrentPosition.types';
import {GeolocationErrorCode} from './getCurrentPosition.types';

const makeError = (code: (typeof GeolocationErrorCode)[keyof typeof GeolocationErrorCode], message: string) => ({
    code,
    message,
    PERMISSION_DENIED: GeolocationErrorCode.PERMISSION_DENIED,
    POSITION_UNAVAILABLE: GeolocationErrorCode.POSITION_UNAVAILABLE,
    TIMEOUT: GeolocationErrorCode.TIMEOUT,
    NOT_SUPPORTED: GeolocationErrorCode.NOT_SUPPORTED,
});

const getCurrentPosition: GetCurrentPosition = (success, error, options) => {
    const doGeoRequest = () => {
        try {
            navigator.geolocation.getCurrentPosition(success, error, options);
        } catch (e) {
            error(makeError(GeolocationErrorCode.POSITION_UNAVAILABLE, String(e || 'Geolocation call failed')));
        }
    };

    // IPC-based permission checking
    if (typeof window !== 'undefined' && window.electron?.invoke) {
        window.electron
            .invoke('check-location-permission')
            .then((permissionStatus: unknown) => {
                const status = String(permissionStatus);

                if (status === 'denied') {
                    error(makeError(GeolocationErrorCode.PERMISSION_DENIED, 'Location access denied. Enable location permissions in system settings.'));
                    return;
                }

                doGeoRequest();
            })
            .catch(() => {
                doGeoRequest(); // Fallback to direct geolocation
            });

        return; // handled via IPC
    }

    doGeoRequest(); // Fallback to direct geolocation
};

export default getCurrentPosition;
