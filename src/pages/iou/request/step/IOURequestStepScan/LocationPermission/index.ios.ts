import {check, PERMISSIONS, request} from 'react-native-permissions';

function requestLocationPermission() {
    return request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
}

function getLocationPermission() {
    return check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
}

export {requestLocationPermission, getLocationPermission};
