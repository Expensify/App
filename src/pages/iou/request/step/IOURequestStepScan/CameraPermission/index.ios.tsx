import {check, PERMISSIONS, request} from 'react-native-permissions';
import type CameraPermissionModule from './types';

function requestCameraPermission() {
    return request(PERMISSIONS.IOS.CAMERA);
}

function getCameraPermissionStatus() {
    return check(PERMISSIONS.IOS.CAMERA);
}

const CameraPermission: CameraPermissionModule = {
    requestCameraPermission,
    getCameraPermissionStatus,
};

export default CameraPermission;
