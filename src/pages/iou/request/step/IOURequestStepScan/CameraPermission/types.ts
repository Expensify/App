type CameraPermissionModule = {
    requestCameraPermission: () => Promise<string> | void;
    getCameraPermissionStatus: () => Promise<string> | void;
};

export default CameraPermissionModule;
