import getCurrentPosition from '@libs/getCurrentPosition';

import {getLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import isLocationPermissionGranted from '@pages/iou/request/step/IOURequestStepScan/LocationPermission/isGranted';

import ONYXKEYS from '@src/ONYXKEYS';
import type {UserLocation} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

/**
 * Sets the longitude and latitude of user's current location
 */
function setUserLocation({longitude, latitude}: UserLocation) {
    Onyx.set(ONYXKEYS.USER_LOCATION, {longitude, latitude});
}

function clearUserLocation() {
    Onyx.set(ONYXKEYS.USER_LOCATION, null);
}

/**
 * Reads the device position in the background and caches it for the submits that follow, so a submit that finds the
 * key filled never has to wait on the device. The read is deliberately not awaited by callers: nothing in the
 * capture or submit chain may block on it.
 *
 * @param ignoreFlag reads the position until this returns true, so a screen that unmounts mid-read stops writing
 * @returns whether permission was already granted, which is when the read was started
 */
async function snapshotUserLocation(isStale: () => boolean = () => false): Promise<boolean> {
    const status = await getLocationPermission();
    if (isStale() || !isLocationPermissionGranted(status)) {
        return false;
    }

    clearUserLocation();
    getCurrentPosition(
        (successData) => {
            if (isStale()) {
                return;
            }
            setUserLocation({
                longitude: successData.coords.longitude,
                latitude: successData.coords.latitude,
            });
        },
        () => {},
    );
    return true;
}

export {setUserLocation, clearUserLocation, snapshotUserLocation};
