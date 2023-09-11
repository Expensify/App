import {check, PERMISSIONS, request} from 'react-native-permissions';

function requestCameraPermission() {
    return request(PERMISSIONS.IOS.CAMERA);
}

function getCameraPermissionStatus() {
    return check(PERMISSIONS.IOS.CAMERA);
}

export {requestCameraPermission, getCameraPermissionStatus};
