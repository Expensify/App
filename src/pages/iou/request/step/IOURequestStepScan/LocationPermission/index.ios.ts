import {Linking} from 'react-native';
import {check, PERMISSIONS, request} from 'react-native-permissions';

function requestLocationPermission(hasError: boolean) {
    if (hasError) {
        return Linking.openSettings();
    }
    return request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
}

function getLocationPermission() {
    return check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
}

export {requestLocationPermission, getLocationPermission};
