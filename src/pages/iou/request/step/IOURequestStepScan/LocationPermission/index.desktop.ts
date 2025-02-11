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
            navigator.geolocation.getCurrentPosition(
                () => resolve(RESULTS.GRANTED),
                (error) => {
                    // If user denies permission, error.code will be 1 (PERMISSION_DENIED)
                    if (error.code === 1) {
                        resolve(RESULTS.BLOCKED);
                    } else if (error.code === 2) { // POSITION_UNAVAILABLE
                        resolve(RESULTS.BLOCKED);
                    } else if (error.code === 3) { // TIMEOUT
                        resolve(RESULTS.BLOCKED);
                    } else {
                        resolve(RESULTS.DENIED);
                    }
                },
                {
                    timeout: CONST.GPS.TIMEOUT,
                    enableHighAccuracy: true,
                }
            );
        } else {
            resolve(RESULTS.UNAVAILABLE);
        }
    });
}

// function getLocationPermission(): Promise<PermissionStatus> {
//     return new Promise((resolve) => {
//         if (navigator.geolocation) {
//             navigator.permissions.query({name: 'geolocation'}).then((result) => {
//                 if (result.state === 'prompt') {
//                     resolve(RESULTS.DENIED);
//                     return;
//                 }
//                 resolve(result.state === 'granted' ? RESULTS.GRANTED : RESULTS.BLOCKED);
//             });
//         } else {
//             resolve(RESULTS.UNAVAILABLE);
//         }
//     });
// }

export {requestLocationPermission, getLocationPermission};
