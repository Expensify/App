import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {UserLocation} from '@src/types/onyx';

/**
 * Sets the longitude and latitude of user's current location
 */
function setUserLocation({longitude, latitude}: UserLocation) {
    Onyx.set(ONYXKEYS.USER_LOCATION, {longitude, latitude});
}

export default setUserLocation;
