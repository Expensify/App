import {useIsFocused} from '@react-navigation/native';
import {useEffect, useReducer, useRef, useState} from 'react';
import type {LayoutRectangle} from 'react-native';
import type Webcam from 'react-webcam';
import {isMobile, isMobileWebKit} from '@libs/Browser';
import CONST from '@src/CONST';

/**
 * Preload camera permission state at module load so first render can use a cached value.
 */
let cachedPermissionState: PermissionState | undefined;

if (typeof navigator !== 'undefined' && navigator.permissions) {
    navigator.permissions
        .query({name: 'camera'})
        .then((status) => {
            cachedPermissionState = status.state;
            if ('addEventListener' in status) {
                status.addEventListener('change', () => {
                    cachedPermissionState = status.state;
                });
            }
        })
        .catch(() => {
            cachedPermissionState = 'denied';
        });
}

function queryCameraPermission(): Promise<PermissionState> {
    if (cachedPermissionState !== undefined) {
        return Promise.resolve(cachedPermissionState);
    }

    if (typeof navigator === 'undefined' || !navigator.permissions) {
        return Promise.resolve('denied');
    }

    return navigator.permissions
        .query({name: 'camera'})
        .then((status) => status.state)
        .catch(() => 'denied' as const);
}

type UseWebCameraOptions = {
    /** Additional cleanup to run on unmount */
    onUnmount?: () => void;
};

function useWebCamera({onUnmount}: UseWebCameraOptions = {}) {
    const isTabActive = useIsFocused();
    const [cameraPermissionState, setCameraPermissionState] = useState<PermissionState | undefined>(() => cachedPermissionState ?? 'prompt');
    const [isFlashLightOn, toggleFlashlight] = useReducer((state: boolean) => !state, false);
    const [isTorchAvailable, setIsTorchAvailable] = useState(false);
    const [isQueriedPermissionState, setIsQueriedPermissionState] = useState(() => cachedPermissionState !== undefined);
    const [deviceConstraints, setDeviceConstraints] = useState<MediaTrackConstraints>();
    const videoConstraints = isTabActive ? deviceConstraints : undefined;
    const cameraRef = useRef<Webcam>(null);
    const trackRef = useRef<MediaStreamTrack | null>(null);
    const viewfinderLayout = useRef<LayoutRectangle>(null);
    const getScreenshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * On phones that have ultra-wide lens, react-webcam uses ultra-wide by default.
     * The last deviceId is of regular lens camera.
     */
    const requestCameraPermission = () => {
        if (!isMobile()) {
            return;
        }
        const defaultConstraints = {facingMode: {exact: 'environment'}};
        navigator.mediaDevices
            .getUserMedia({video: {facingMode: {exact: 'environment'}, zoom: {ideal: 1}}})
            .then((stream) => {
                setCameraPermissionState('granted');
                for (const track of stream.getTracks()) {
                    track.stop();
                }
                // Only Safari 17+ supports zoom constraint
                if (isMobileWebKit() && stream.getTracks().length > 0) {
                    let deviceId;
                    for (const track of stream.getTracks()) {
                        const setting = track.getSettings();
                        if (setting.zoom === 1) {
                            deviceId = setting.deviceId;
                            break;
                        }
                    }
                    if (deviceId) {
                        setDeviceConstraints({deviceId});
                        return;
                    }
                }
                if (!navigator.mediaDevices.enumerateDevices) {
                    setDeviceConstraints(defaultConstraints);
                    return;
                }
                navigator.mediaDevices
                    .enumerateDevices()
                    .then((devices) => {
                        let lastBackDeviceId = '';
                        for (let i = devices.length - 1; i >= 0; i--) {
                            const device = devices.at(i);
                            if (device?.kind === 'videoinput') {
                                lastBackDeviceId = device.deviceId;
                                break;
                            }
                        }
                        if (!lastBackDeviceId) {
                            setDeviceConstraints(defaultConstraints);
                            return;
                        }
                        setDeviceConstraints({deviceId: lastBackDeviceId});
                    })
                    .catch(() => {
                        setDeviceConstraints(defaultConstraints);
                    });
            })
            .catch(() => {
                setDeviceConstraints(defaultConstraints);
                setCameraPermissionState('denied');
            });
    };

    useEffect(() => {
        if (!isTabActive) {
            return;
        }
        let ignore = false;
        queryCameraPermission()
            .then((state) => {
                if (ignore) {
                    return;
                }
                if (state === 'granted') {
                    requestCameraPermission();
                } else {
                    setCameraPermissionState(state);
                }
            })
            .catch(() => {
                if (ignore) {
                    return;
                }
                setCameraPermissionState('denied');
            })
            .finally(() => {
                if (ignore) {
                    return;
                }
                setIsQueriedPermissionState(true);
            });
        return () => {
            ignore = true;
        };
    }, [isTabActive]);

    useEffect(
        () => () => {
            onUnmount?.();
            setDeviceConstraints(undefined);
            if (!getScreenshotTimeoutRef.current) {
                return;
            }
            clearTimeout(getScreenshotTimeoutRef.current);
        },
        [onUnmount],
    );

    const setupCameraPermissionsAndCapabilities = (stream: MediaStream) => {
        setCameraPermissionState('granted');

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();

        if ('torch' in capabilities && capabilities.torch) {
            trackRef.current = track;
        }
        setIsTorchAvailable('torch' in capabilities && !!capabilities.torch);
    };

    const clearTorchConstraints = () => {
        if (!trackRef.current) {
            return;
        }
        trackRef.current.applyConstraints({
            advanced: [{torch: false}],
        });
    };

    const capturePhotoWithFlash = (getScreenshot: () => void) => {
        if (trackRef.current && isFlashLightOn) {
            trackRef.current
                .applyConstraints({
                    advanced: [{torch: true}],
                })
                .then(() => {
                    getScreenshotTimeoutRef.current = setTimeout(() => {
                        getScreenshot();
                        clearTorchConstraints();
                    }, CONST.RECEIPT.FLASH_DELAY_MS);
                });
            return;
        }

        getScreenshot();
    };

    return {
        cameraRef,
        viewfinderLayout,
        cameraPermissionState,
        setCameraPermissionState,
        isFlashLightOn,
        toggleFlashlight,
        isTorchAvailable,
        isQueriedPermissionState,
        videoConstraints,
        requestCameraPermission,
        setupCameraPermissionsAndCapabilities,
        capturePhotoWithFlash,
    };
}

export default useWebCamera;
