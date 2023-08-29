import {PermissionsAndroid} from 'react-native';

function requestCameraPermission() {
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
}

function getCameraPermissionStatus() {
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
}

export {requestCameraPermission, getCameraPermissionStatus};
