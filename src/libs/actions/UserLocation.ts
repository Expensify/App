import getCurrentPosition from '@libs/getCurrentPosition';

import hasLocationPermission from '@pages/iou/request/step/IOURequestStepScan/LocationPermission/hasLocationPermission';

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

function snapshotUserLocation() {
    // Clear before the permission check so a denied check also drops a position cached earlier, which can come from
    // another session or from AddressSearch. A submit that gets permission later would otherwise tag the expense with it.
    clearUserLocation();
    hasLocationPermission().then((isGranted) => {
        if (!isGranted) {
            return;
        }

        // Best effort: a submit that finds no cached position falls back to a capped read
        getCurrentPosition(
            (successData) => {
                setUserLocation({
                    longitude: successData.coords.longitude,
                    latitude: successData.coords.latitude,
                });
            },
            () => {},
        );
    });
}

export {setUserLocation, clearUserLocation, snapshotUserLocation};
