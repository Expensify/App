import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import CONST from '@src/CONST';

function requestLocationPermission(): Promise<PermissionStatus> {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => resolve(RESULTS.GRANTED),
                (error) => resolve(error.TIMEOUT || error.POSITION_UNAVAILABLE ? RESULTS.BLOCKED : RESULTS.DENIED),
                {
                    timeout: CONST.GPS.TIMEOUT,
                    enableHighAccuracy: true,
                },
            );
        } else {
            resolve(RESULTS.UNAVAILABLE);
        }
    });
}

// Using navigator.permissions.query does not provide accurate results on desktop.
// Therefore, we use getCurrentPosition instead and assume the user has not enabled location services if it reaches timeout.
function getLocationPermission(): Promise<PermissionStatus> {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => resolve(RESULTS.GRANTED),
                (error) => {
                    // If user denies permission, error.code will be 1 (PERMISSION_DENIED)
                    if (error.code === 1) {
                        resolve(RESULTS.BLOCKED);
                    } else if (error.code === 2) {
                        // POSITION_UNAVAILABLE
                        resolve(RESULTS.BLOCKED);
                    } else if (error.code === 3) {
                        // TIMEOUT
                        resolve(RESULTS.BLOCKED);
                    } else {
                        resolve(RESULTS.DENIED);
                    }
                },
                {
                    timeout: CONST.GPS.TIMEOUT,
                    enableHighAccuracy: true,
                },
            );
        } else {
            resolve(RESULTS.UNAVAILABLE);
        }
    });
}

export {requestLocationPermission, getLocationPermission};
