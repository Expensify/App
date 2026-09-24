import type {PermissionStatus} from 'react-native-permissions';

import {RESULTS} from 'react-native-permissions';

function isLocationPermissionGranted(status: PermissionStatus) {
    return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

export default isLocationPermissionGranted;
