import {Platform} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';

function requestLocationPermission() {
    return request(Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    }));
}

// eslint-disable-next-line import/prefer-default-export
export {requestLocationPermission};
