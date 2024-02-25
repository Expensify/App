import {check, PERMISSIONS, request} from 'react-native-permissions';
import type CameraPermissionModule from './types';

function requestCameraPermission() {
    return request(PERMISSIONS.ANDROID.CAMERA);
}

// Android will never return blocked after a check, you have to request the permission to get the info.
function getCameraPermissionStatus() {
    return check(PERMISSIONS.ANDROID.CAMERA);
}

const CameraPermission: CameraPermissionModule = {
    requestCameraPermission,
    getCameraPermissionStatus,
};

export default CameraPermission;
