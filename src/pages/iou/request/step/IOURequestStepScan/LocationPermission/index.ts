import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function requestLocationPermission(hasError: boolean): Promise<PermissionStatus> {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => resolve(RESULTS.GRANTED),
                (error) => resolve(error.TIMEOUT || error.POSITION_UNAVAILABLE ? RESULTS.BLOCKED : RESULTS.DENIED),
                {
                    timeout: 2000,
                    enableHighAccuracy: true,
                },
            );
        } else {
            resolve(RESULTS.UNAVAILABLE);
        }
    });
}

function getLocationPermission(): Promise<PermissionStatus> {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.permissions.query({name: 'geolocation'}).then((result) => {
                resolve(result.state === 'granted' ? RESULTS.GRANTED : RESULTS.DENIED);
            });
        } else {
            resolve(RESULTS.UNAVAILABLE);
        }
    });
}

export {requestLocationPermission, getLocationPermission};
