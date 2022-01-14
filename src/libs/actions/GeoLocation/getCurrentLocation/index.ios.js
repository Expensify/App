import Geolocation from 'react-native-geolocation-service';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import Log from '../../../Log';

export default function getCurrentLocation() {
    Onyx.merge(ONYXKEYS.USER_LOCATION, {loading: true});

    Geolocation.requestAuthorization('whenInUse')
        .then((authorizationResult) => {
            if (authorizationResult !== 'granted') {
                Log.info('[Geolocation] iOS user denied location permission');
                Onyx.merge(ONYXKEYS.USER_LOCATION, {loading: false, longitude: 0, latitude: 0});
                return;
            }

            Geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    Onyx.merge(ONYXKEYS.USER_LOCATION, {loading: false, longitude, latitude});
                },
                (error) => {
                    Log.info('[Geolocation] Unable to get user location', false, {error});
                    Onyx.merge(ONYXKEYS.USER_LOCATION, {loading: false, longitude: 0, latitude: 0});
                },
                {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
        });
}
