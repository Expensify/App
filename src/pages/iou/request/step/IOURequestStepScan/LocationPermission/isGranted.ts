import type {PermissionStatus} from 'react-native-permissions';

import {RESULTS} from 'react-native-permissions';

/** Whether a status from `getLocationPermission()` means the device can be read without asking the user first. */
function isLocationPermissionGranted(status: PermissionStatus) {
    return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

export default isLocationPermissionGranted;
