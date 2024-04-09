import {check, PERMISSIONS, request} from 'react-native-permissions';

function requestLocationPermission() {
    return request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
}

// Android will never return blocked after a check, you have to request the permission to get the info.
function getLocationPermission() {
    return check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
}

export {requestLocationPermission, getLocationPermission};
