import {check, PERMISSIONS, request} from 'react-native-permissions';

function requestCameraPermission() {
    return request(PERMISSIONS.ANDROID.CAMERA);
}

// Android will never return blocked after a check, you have to request the permission to get the info.
function getCameraPermissionStatus() {
    return check(PERMISSIONS.ANDROID.CAMERA);
}

export {requestCameraPermission, getCameraPermissionStatus};
