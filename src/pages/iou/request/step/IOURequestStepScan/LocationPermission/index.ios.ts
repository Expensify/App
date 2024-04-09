import {check, PERMISSIONS, request} from 'react-native-permissions';

function requestLocationPermission() {
    return request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
}

function getLocationPermissionStatus() {
    return check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
}

export {requestLocationPermission, getLocationPermissionStatus};
