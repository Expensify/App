import {useFocusEffect} from '@react-navigation/core';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, AppState, StyleSheet, View} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import type {PhotoFile, Point, Camera as VisionCamera} from 'react-native-vision-camera';
import {useCameraDevice, useCameraFormat} from 'react-native-vision-camera';
import {scheduleOnRN} from 'react-native-worklets';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {showCameraPermissionsAlert} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CameraPermission from '@pages/iou/request/step/IOURequestStepScan/CameraPermission';
import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/components/NavigationAwareCamera/Camera';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type {CameraProps} from './types';

const BLINK_DURATION_MS = 80;

/**
 * Camera — native capture variant.
 * Renders a react-native-vision-camera viewfinder with shutter, flash toggle, gallery picker, and focus gesture.
 * Calls `onCapture(file, source)` for each photo taken or file picked from the gallery.
 */
function Camera({onCapture, shouldAcceptMultipleFiles = false, onLayout}: CameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const device = useCameraDevice('back', {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });
    const format = useCameraFormat(device, [{photoAspectRatio: 4 / 3}, {videoResolution: 'max'}, {photoResolution: 'max'}]);
    // Format dimensions are in landscape orientation, so height/width gives portrait aspect ratio
    const cameraAspectRatio = format ? format.photoHeight / format.photoWidth : undefined;

    const hasFlash = !!device?.hasFlash;
    const camera = useRef<VisionCamera>(null);
    const [flash, setFlash] = useState(false);
    const lazyIllustrations = useMemoizedLazyIllustrations(['Hand', 'Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'boltSlash']);
    const platform = getPlatform(true);
    const [mutedPlatforms = getEmptyObject<Partial<Record<Platform, true>>>()] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS);
    const isPlatformMuted = mutedPlatforms[platform];
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const [isAttachmentPickerActive, setIsAttachmentPickerActive] = useState(false);
    const [didCapturePhoto, setDidCapturePhoto] = useState(false);

    // Track camera init telemetry
    const cameraInitSpanStarted = useRef(false);
    const cameraInitialized = useRef(false);

    // Ref for double-tap protection (doesn't trigger re-render)
    const isCapturingPhoto = useRef(false);

    // Blink animation for shutter feedback
    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const showBlink = () => {
        blinkOpacity.set(withSequence(withTiming(1, {duration: BLINK_DURATION_MS}), withTiming(0, {duration: BLINK_DURATION_MS})));
    };

    // Start camera init span when permission is granted and camera is ready
    useEffect(() => {
        if (cameraInitSpanStarted.current || cameraPermissionStatus !== RESULTS.GRANTED || device == null) {
            return;
        }
        startSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT, {
            name: CONST.TELEMETRY.SPAN_CAMERA_INIT,
            op: CONST.TELEMETRY.SPAN_CAMERA_INIT,
        });
        cameraInitSpanStarted.current = true;
    }, [cameraPermissionStatus, device]);

    // Cancel spans when permission is denied/blocked/unavailable
    useEffect(() => {
        if (cameraPermissionStatus !== RESULTS.BLOCKED && cameraPermissionStatus !== RESULTS.UNAVAILABLE && cameraPermissionStatus !== RESULTS.DENIED) {
            return;
        }
        cancelSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
    }, [cameraPermissionStatus]);

    // Cancel spans on unmount if camera never initialized
    useEffect(() => {
        return () => {
            if (cameraInitialized.current) {
                return;
            }
            if (cameraInitSpanStarted.current) {
                cancelSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT);
            }
            cancelSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        };
    }, []);

    const handleCameraInitialized = () => {
        if (cameraInitialized.current) {
            return;
        }
        cameraInitialized.current = true;
        if (cameraInitSpanStarted.current) {
            endSpan(CONST.TELEMETRY.SPAN_CAMERA_INIT);
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);

        // Pre-create upload directory to avoid latency during capture
        const path = getReceiptsUploadFolderPath();
        ReactNativeBlobUtil.fs
            .isDir(path)
            .then((isDir) => {
                if (isDir) {
                    return;
                }
                ReactNativeBlobUtil.fs.mkdir(path).catch((error: string) => {
                    Log.warn('Error creating the receipts upload directory', error);
                });
            })
            .catch((error: string) => {
                Log.warn('Error checking if the upload directory exists', error);
            });
    };

    const askForPermissions = () => {
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
    };

    // Focus indicator animation
    const focusIndicatorOpacity = useSharedValue(0);
    const focusIndicatorScale = useSharedValue(2);
    const focusIndicatorPosition = useSharedValue({x: 0, y: 0});

    const cameraFocusIndicatorAnimatedStyle = useAnimatedStyle(() => ({
        opacity: focusIndicatorOpacity.get(),
        transform: [{translateX: focusIndicatorPosition.get().x}, {translateY: focusIndicatorPosition.get().y}, {scale: focusIndicatorScale.get()}],
    }));

    const focusCamera = (point: Point) => {
        if (!camera.current) {
            return;
        }

        camera.current.focus(point).catch((error: Record<string, unknown>) => {
            if (error.message === '[unknown/unknown] Cancelled by another startFocusAndMetering()') {
                return;
            }
            Log.warn('Error focusing camera', error);
        });
    };

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

    useFocusEffect(() => {
        setDidCapturePhoto(false);
        isCapturingPhoto.current = false;
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
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
        };
    });

    const capturePhoto = () => {
        startSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION, {
            name: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
            op: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native'},
        });

        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            showCameraAlert();
            return;
        }

        if (isCapturingPhoto.current) {
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native'},
        });

        isCapturingPhoto.current = true;
        showBlink();

        const path = getReceiptsUploadFolderPath();

        camera.current
            .takePhoto({
                flash: flash && hasFlash ? 'on' : 'off',
                enableShutterSound: !isPlatformMuted,
                path,
            })
            .then((photo: PhotoFile) => {
                setDidCapturePhoto(true);
                const source = getPhotoSource(photo.path);
                endSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);

                const cameraFile: FileObject = {
                    uri: source,
                    name: photo.path,
                    type: 'image/jpeg',
                };

                onCapture(cameraFile, source);

                setDidCapturePhoto(false);
                isCapturingPhoto.current = false;
            })
            .catch((error: string) => {
                isCapturingPhoto.current = false;
                cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
                cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
                showCameraAlert();
                Log.warn('Error taking photo', error);
            });
    };

    const emitPickedFiles = (files: FileObject[]) => {
        for (const file of files) {
            const source = file.uri ?? '';
            onCapture(file, source);
        }
    };

    const cameraLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'Camera',
        cameraPermissionGranted: cameraPermissionStatus === RESULTS.GRANTED,
        deviceAvailable: device != null,
    };

    // Wait for camera permission status to render
    if (cameraPermissionStatus == null) {
        return null;
    }

    return (
        <View
            style={styles.flex1}
            onLayout={() => onLayout?.()}
        >
            <View style={[styles.flex1]}>
                {cameraPermissionStatus !== RESULTS.GRANTED && (
                    <View style={[styles.cameraView, styles.permissionView, styles.userSelectNone]}>
                        <ImageSVG
                            contentFit="contain"
                            src={lazyIllustrations.Hand}
                            width={CONST.RECEIPT.HAND_ICON_WIDTH}
                            height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                            style={styles.pb5}
                        />

                        <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                        <Text style={[styles.subTextFileUpload]}>{translate('receipt.cameraAccess')}</Text>
                        <Button
                            success
                            text={translate('common.continue')}
                            accessibilityLabel={translate('common.continue')}
                            style={[styles.p9, styles.pt5]}
                            onPress={capturePhoto}
                            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.SCAN_SUBMIT_BUTTON}
                        />
                    </View>
                )}
                {cameraPermissionStatus === RESULTS.GRANTED && device == null && (
                    <View style={[styles.cameraView]}>
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                            color={theme.textSupporting}
                            reasonAttributes={cameraLoadingReasonAttributes}
                        />
                    </View>
                )}
                {cameraPermissionStatus === RESULTS.GRANTED && device != null && (
                    <View style={[styles.cameraView, styles.alignItemsCenter]}>
                        <GestureDetector gesture={tapGesture}>
                            <View style={StyleUtils.getCameraViewfinderStyle(cameraAspectRatio)}>
                                <NavigationAwareCamera
                                    ref={camera}
                                    device={device}
                                    format={format}
                                    style={styles.flex1}
                                    zoom={device.neutralZoom}
                                    photo
                                    cameraTabIndex={1}
                                    forceInactive={isAttachmentPickerActive || didCapturePhoto}
                                    onInitialized={handleCameraInitialized}
                                />
                                <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                                <Animated.View
                                    pointerEvents="none"
                                    style={[StyleSheet.absoluteFillObject, StyleUtils.getBackgroundColorStyle(theme.appBG), blinkStyle, styles.zIndex10]}
                                />
                            </View>
                        </GestureDetector>
                        <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                            <PressableWithFeedback
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('receipt.flash')}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                                disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                                onPress={() => setFlash((prevFlash) => !prevFlash)}
                            >
                                <Icon
                                    height={16}
                                    width={16}
                                    src={lazyIcons.Bolt}
                                    fill={flash ? theme.white : theme.icon}
                                />
                            </PressableWithFeedback>
                        </View>
                    </View>
                )}
            </View>
            <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                <AttachmentPicker
                    onOpenPicker={() => {
                        setIsAttachmentPickerActive(true);
                    }}
                    fileLimit={shouldAcceptMultipleFiles ? CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT : 1}
                    shouldValidateImage={false}
                >
                    {({openPicker}) => (
                        <PressableWithFeedback
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('receipt.gallery')}
                            sentryLabel={shouldAcceptMultipleFiles ? CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILES : CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILE}
                            style={[styles.alignItemsStart]}
                            onPress={() => {
                                openPicker({
                                    onPicked: (data) => emitPickedFiles(data),
                                    onCanceled: () => {},
                                    onClosed: () => {
                                        setIsAttachmentPickerActive(false);
                                    },
                                });
                            }}
                        >
                            <Icon
                                height={32}
                                width={32}
                                src={lazyIcons.Gallery}
                                fill={theme.textSupporting}
                            />
                        </PressableWithFeedback>
                    )}
                </AttachmentPicker>
                <PressableWithFeedback
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.shutter')}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.SHUTTER}
                    style={[styles.alignItemsCenter]}
                    onPress={capturePhoto}
                >
                    <ImageSVG
                        contentFit="contain"
                        src={lazyIllustrations.Shutter}
                        width={CONST.RECEIPT.SHUTTER_SIZE}
                        height={CONST.RECEIPT.SHUTTER_SIZE}
                    />
                </PressableWithFeedback>
                <PressableWithFeedback
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.flash')}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                    style={[styles.alignItemsEnd, !hasFlash && styles.opacity0]}
                    disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                    onPress={() => setFlash((prevFlash) => !prevFlash)}
                >
                    <Icon
                        height={32}
                        width={32}
                        src={flash ? lazyIcons.Bolt : lazyIcons.boltSlash}
                        fill={theme.textSupporting}
                    />
                </PressableWithFeedback>
            </View>
        </View>
    );
}

Camera.displayName = 'Camera';

export default Camera;
export type {CameraProps};
