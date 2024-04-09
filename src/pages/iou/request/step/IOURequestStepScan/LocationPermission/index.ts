import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';

function getLocationPermissionStatus(): Promise<PermissionStatus> {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => resolve(RESULTS.GRANTED),
                (error) => resolve(error.TIMEOUT || error.POSITION_UNAVAILABLE ? RESULTS.BLOCKED : RESULTS.DENIED),
            );
        } else {
            resolve(RESULTS.UNAVAILABLE);
        }
    });
}

const requestLocationPermission = getLocationPermissionStatus;

export {requestLocationPermission, getLocationPermissionStatus};
