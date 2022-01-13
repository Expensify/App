import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import Log from '../../../Log';

export default function getCurrentLocation() {
    console.debug('web getting location');

    if (!navigator.geolocation) {
        Onyx.set(ONYXKEYS.USER_LOCATION, {});
        return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        Onyx.set(ONYXKEYS.USER_LOCATION, {latitude, longitude});
    }, (error) => {
        Log.info('[Geolocation] Unable to get user location', false, {error});
        Onyx.set(ONYXKEYS.USER_LOCATION, {});
    });
}
