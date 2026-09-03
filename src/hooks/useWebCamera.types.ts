type UseWebCameraOptions = {
    /** Additional cleanup to run on unmount */
    onUnmount?: () => void;
};

type CameraPermissionState = 'prompt' | 'granted' | 'denied';

type WebCameraPlatformTypes = {
    cameraRef: unknown;
    viewfinderLayout: unknown;
    setCameraPermissionStateArgs: unknown[];
    isFlashLightOn: unknown;
    videoConstraints: unknown;
    setupCameraPermissionsAndCapabilitiesArgs: unknown[];
};

type UseWebCameraResult<TPlatform extends WebCameraPlatformTypes> = {
    cameraRef: TPlatform['cameraRef'];
    viewfinderLayout: TPlatform['viewfinderLayout'];
    cameraPermissionState: CameraPermissionState | undefined;
    setCameraPermissionState: (...args: TPlatform['setCameraPermissionStateArgs']) => void;
    isFlashLightOn: TPlatform['isFlashLightOn'];
    toggleFlashlight: () => void;
    isTorchAvailable: boolean;
    isQueriedPermissionState: boolean;
    videoConstraints: TPlatform['videoConstraints'];
    requestCameraPermission: () => void;
    setupCameraPermissionsAndCapabilities: (...args: TPlatform['setupCameraPermissionsAndCapabilitiesArgs']) => void;
    capturePhotoWithFlash: (getScreenshot: () => void) => void;
};

type UseWebCamera<TPlatform extends WebCameraPlatformTypes> = (options?: UseWebCameraOptions) => UseWebCameraResult<TPlatform>;

export type {CameraPermissionState, UseWebCamera, UseWebCameraOptions, UseWebCameraResult, WebCameraPlatformTypes};
