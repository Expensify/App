import type CameraPermissionModule from './types';

function requestCameraPermission() {}

function getCameraPermissionStatus() {}

const CameraPermission: CameraPermissionModule = {
    requestCameraPermission,
    getCameraPermissionStatus,
};

export default CameraPermission;
