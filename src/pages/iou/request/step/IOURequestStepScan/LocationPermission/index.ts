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

function getLocationPermission(): Promise<PermissionStatus> {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.permissions.query({name: 'geolocation'}).then((result) => {
                if (result.state === 'prompt') {
                    resolve(RESULTS.DENIED);
                    return;
                }
                resolve(result.state === 'granted' ? RESULTS.GRANTED : RESULTS.BLOCKED);
            });
        } else {
            resolve(RESULTS.UNAVAILABLE);
        }
    });
}

export {requestLocationPermission, getLocationPermission};
