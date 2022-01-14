import Geolocation from 'react-native-geolocation-service';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import Log from '../../../Log';

export default function getCurrentLocation() {
    console.debug('Android getting location');
    Geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            Onyx.set(ONYXKEYS.USER_LOCATION, {latitude, longitude});
        },
        (error) => {
            Log.info('[Geolocation] Unable to get user location', false, {error});
            Onyx.set(ONYXKEYS.USER_LOCATION, {});
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
}
