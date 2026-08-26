const useWebCamera = (_options?: {onUnmount?: () => void}) => ({
    cameraRef: {current: null},
    viewfinderLayout: undefined,
    cameraPermissionState: undefined as 'prompt' | 'granted' | 'denied' | undefined,
    setCameraPermissionState: (_state?: 'prompt' | 'granted' | 'denied') => {},
    isFlashLightOn: {current: false},
    toggleFlashlight: () => {},
    isTorchAvailable: false,
    isQueriedPermissionState: false,
    videoConstraints: undefined,
    requestCameraPermission: () => {},
    setupCameraPermissionsAndCapabilities: () => {},
    capturePhotoWithFlash: (_getScreenshot: () => void) => {},
});

export default useWebCamera;
