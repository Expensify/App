import getCurrentPosition from '@libs/getCurrentPosition';

import {getLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';

import ONYXKEYS from '@src/ONYXKEYS';
import type {UserLocation} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';

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
    getLocationPermission().then((status) => {
        if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
            return;
        }

        clearUserLocation();
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
