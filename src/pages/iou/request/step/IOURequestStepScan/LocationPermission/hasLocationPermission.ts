/**
 * Resolves whether location permission is granted, and resolves false when the check itself fails, so a submit that waits on it always goes out.
 */
import {RESULTS} from 'react-native-permissions';

import {getLocationPermission} from '.';

function hasLocationPermission(): Promise<boolean> {
    return getLocationPermission().then(
        (status) => status === RESULTS.GRANTED || status === RESULTS.LIMITED,
        () => false,
    );
}

export default hasLocationPermission;
