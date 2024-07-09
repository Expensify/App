type CameraPermissionModule = {
    requestCameraPermission: (() => Promise<string>) | undefined;
    getCameraPermissionStatus: (() => Promise<string>) | undefined;
};

export default CameraPermissionModule;
