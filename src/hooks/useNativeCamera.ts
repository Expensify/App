import {useFocusEffect} from '@react-navigation/core';
import {useCallback, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {Gesture} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import {useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import type {Camera, Point} from 'react-native-vision-camera';
import {useCameraDevice} from 'react-native-vision-camera';
import {scheduleOnRN} from 'react-native-worklets';
import {useFullScreenLoaderActions, useFullScreenLoaderState} from '@components/FullScreenLoaderContext';
import {showCameraPermissionsAlert} from '@libs/fileDownload/FileUtils';
import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';
import Log from '@libs/Log';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CameraPermission from '@pages/iou/request/step/IOURequestStepScan/CameraPermission';
import ONYXKEYS from '@src/ONYXKEYS';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseNativeCameraOptions = {
    /** Context name for telemetry reason attributes */
    context: string;

    /** Additional logic to run when the screen gains focus */
    onFocusStart?: () => void;

    /** Additional cleanup to run when focus effect cleans up */
    onFocusCleanup?: () => void;
};

function useNativeCamera({context, onFocusStart, onFocusCleanup}: UseNativeCameraOptions) {
    const {translate} = useLocalize();
    const {isLoaderVisible} = useFullScreenLoaderState();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const device = useCameraDevice('back', {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });

    const platform = getPlatform(true);
    const [mutedPlatforms = getEmptyObject<Partial<Record<Platform, true>>>()] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS);
    const isPlatformMuted = mutedPlatforms[platform];

    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const hasFlash = !!device?.hasFlash;
    const [flash, setFlash] = useState(false);
    const [didCapturePhoto, setDidCapturePhoto] = useState(false);
    const [isAttachmentPickerActive, setIsAttachmentPickerActive] = useState(false);
    const camera = useRef<Camera>(null);

    const askForPermissions = useCallback(() => {
        // There's no way we can check for the BLOCKED status without requesting the permission first
        // https://github.com/zoontek/react-native-permissions/blob/a836e114ce3a180b2b23916292c79841a267d828/README.md?plain=1#L670
        CameraPermission.requestCameraPermission?.()
            .then((status: string) => {
                setCameraPermissionStatus(status);

                if (status === RESULTS.BLOCKED) {
                    showCameraPermissionsAlert(translate);
                }
            })
            .catch(() => {
                setCameraPermissionStatus(RESULTS.UNAVAILABLE);
            });
    }, [translate]);

    // Focus indicator animations
    const focusIndicatorOpacity = useSharedValue(0);
    const focusIndicatorScale = useSharedValue(2);
    const focusIndicatorPosition = useSharedValue({x: 0, y: 0});

    const cameraFocusIndicatorAnimatedStyle = useAnimatedStyle(() => ({
        opacity: focusIndicatorOpacity.get(),
        transform: [{translateX: focusIndicatorPosition.get().x}, {translateY: focusIndicatorPosition.get().y}, {scale: focusIndicatorScale.get()}],
    }));

    const focusCamera = useCallback((point: Point) => {
        if (!camera.current) {
            return;
        }

        camera.current.focus(point).catch((error: Record<string, unknown>) => {
            if (error.message === '[unknown/unknown] Cancelled by another startFocusAndMetering()') {
                return;
            }
            Log.warn('Error focusing camera', error);
        });
    }, []);

    const tapGesture = Gesture.Tap()
        .enabled(device?.supportsFocus ?? false)
        .onStart((ev: {x: number; y: number}) => {
            const point = {x: ev.x, y: ev.y};

            focusIndicatorOpacity.set(withSequence(withTiming(0.8, {duration: 250}), withDelay(1000, withTiming(0, {duration: 250}))));
            focusIndicatorScale.set(2);
            focusIndicatorScale.set(withSpring(1, {damping: 10, stiffness: 200}));
            focusIndicatorPosition.set(point);

            scheduleOnRN(focusCamera, point);
        });

    // Refresh camera permission on screen focus and app state changes
    useFocusEffect(
        useCallback(() => {
            setDidCapturePhoto(false);
            onFocusStart?.();
            const refreshCameraPermissionStatus = () => {
                CameraPermission?.getCameraPermissionStatus?.()
                    .then(setCameraPermissionStatus)
                    .catch(() => setCameraPermissionStatus(RESULTS.UNAVAILABLE));
            };

            refreshCameraPermissionStatus();

            // Refresh permission status when app gains focus
            const subscription = AppState.addEventListener('change', (appState) => {
                if (appState !== 'active') {
                    return;
                }

                refreshCameraPermissionStatus();
            });

            return () => {
                subscription.remove();
                onFocusCleanup?.();

                if (isLoaderVisible) {
                    setIsLoaderVisible(false);
                }
            };
        }, [isLoaderVisible, setIsLoaderVisible, onFocusStart, onFocusCleanup]),
    );

    const cameraLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context,
        cameraPermissionGranted: cameraPermissionStatus === RESULTS.GRANTED,
        deviceAvailable: device != null,
    };

    return {
        camera,
        device,
        cameraPermissionStatus,
        flash,
        setFlash,
        hasFlash,
        didCapturePhoto,
        setDidCapturePhoto,
        isAttachmentPickerActive,
        setIsAttachmentPickerActive,
        isPlatformMuted,
        askForPermissions,
        tapGesture,
        cameraFocusIndicatorAnimatedStyle,
        cameraLoadingReasonAttributes,
    };
}

export default useNativeCamera;
