import type {CameraPermissionState, UseWebCamera, WebCameraPlatformTypes} from './useWebCamera.types';

type NativeWebCameraTypes = WebCameraPlatformTypes & {
    cameraRef: {current: null};
    viewfinderLayout: undefined;
    setCameraPermissionStateArgs: [state?: CameraPermissionState];
    isFlashLightOn: {current: boolean};
    videoConstraints: undefined;
    setupCameraPermissionsAndCapabilitiesArgs: [];
};

const useWebCamera: UseWebCamera<NativeWebCameraTypes> = () => ({
    cameraRef: {current: null},
    viewfinderLayout: undefined,
    cameraPermissionState: undefined as 'prompt' | 'granted' | 'denied' | undefined,
    setCameraPermissionState: () => {},
    isFlashLightOn: {current: false},
    toggleFlashlight: () => {},
    isTorchAvailable: false,
    isQueriedPermissionState: false,
    videoConstraints: undefined,
    requestCameraPermission: () => {},
    setupCameraPermissionsAndCapabilities: () => {},
    capturePhotoWithFlash: () => {},
});

export default useWebCamera;
