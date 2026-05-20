import React, {useEffect, useRef} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';
import type {PhotoFile} from 'react-native-vision-camera';
import {useCameraFormat} from 'react-native-vision-camera';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNativeCamera from '@hooks/useNativeCamera';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import HapticFeedback from '@libs/HapticFeedback';
import Log from '@libs/Log';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import captureReceipt from '@pages/iou/request/step/IOURequestStepScan/captureReceipt';
import {useMultiScanActions, useMultiScanState} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';
import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/components/NavigationAwareCamera/Camera';
import getCameraAspectRatio from '@pages/iou/request/step/IOURequestStepScan/getCameraAspectRatio';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import type {CameraProps} from './types';

const BLINK_DURATION_MS = 80;

/**
 * Camera — native capture variant.
 * Renders a react-native-vision-camera viewfinder with shutter, flash toggle, gallery picker, and focus gesture.
 * Calls `onCapture(file, source)` for each photo taken or file picked from the gallery.
 */
function Camera({onCapture, shouldAcceptMultipleFiles = false, onLayout, onCameraInitialized, onAttachmentPickerStatusChange}: CameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const lazyIllustrations = useMemoizedLazyIllustrations(['Hand', 'Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'ReceiptMultiple', 'boltSlash']);
    const {isMultiScanEnabled, canUseMultiScan} = useMultiScanState();
    const {toggleMultiScan} = useMultiScanActions();

    // Ref for double-tap protection (doesn't trigger re-render)
    const isCapturingPhoto = useRef(false);

    const onFocusStart = () => {
        isCapturingPhoto.current = false;
    };

    const onFocusCleanup = () => {
        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
    };

    const {
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
    } = useNativeCamera({context: 'Camera', onFocusStart, onFocusCleanup});

    // Prioritize photoResolution over videoResolution so the format selector picks a 4032x3024
    // format instead of the 5712x4284 (24.5MP) format that videoResolution:'max' would select.
    // This cuts capture time roughly in half while maintaining the same output photo resolution.
    // Use screen dimensions for video resolution since we only need enough for the preview.
    const format = useCameraFormat(device, [
        {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
        {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
        {videoResolution: {width: windowHeight, height: windowWidth}},
    ]);
    const cameraAspectRatio = getCameraAspectRatio(format, isInLandscapeMode);
    const fps = format ? Math.min(Math.max(30, format.minFps), format.maxFps) : 30;

    // Track camera init telemetry
    const cameraInitSpanStarted = useRef(false);
    const cameraInitialized = useRef(false);

    // Blink animation for shutter feedback
    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const showBlink = () => {
        blinkOpacity.set(withSequence(withTiming(1, {duration: BLINK_DURATION_MS}), withTiming(0, {duration: BLINK_DURATION_MS})));
        HapticFeedback.press();
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

        onCameraInitialized?.();
    };

    const maybeCancelShutterSpan = () => {
        if (isMultiScanEnabled) {
            return;
        }

        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
    };

    const capturePhoto = () => {
        if (!isMultiScanEnabled) {
            startSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION, {
                name: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                op: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native'},
            });
        }

        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            maybeCancelShutterSpan();
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            maybeCancelShutterSpan();
            showCameraAlert();
            return;
        }

        if (isCapturingPhoto.current) {
            maybeCancelShutterSpan();
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

        captureReceipt(camera.current, {flash, hasFlash, isPlatformMuted, path, isInLandscapeMode})
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
                maybeCancelShutterSpan();
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

    // Wait for camera permission status to render
    if (cameraPermissionStatus == null) {
        return null;
    }

    return (
        <View
            style={styles.flex1}
            onLayout={onLayout}
        >
            <View style={[styles.flex1, isInLandscapeMode && styles.flexRow]}>
                <View style={[styles.flex1]}>
                    {cameraPermissionStatus !== RESULTS.GRANTED && (
                        <ScrollView contentContainerStyle={styles.flexGrow1}>
                            <View style={[styles.cameraView, isInLandscapeMode ? styles.permissionViewLandscape : styles.permissionView, styles.userSelectNone]}>
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
                        </ScrollView>
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
                                <View style={StyleUtils.getCameraViewfinderStyle(cameraAspectRatio, isInLandscapeMode)}>
                                    <NavigationAwareCamera
                                        ref={camera}
                                        device={device}
                                        format={format}
                                        fps={fps}
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
                                        style={[StyleSheet.absoluteFill, StyleUtils.getBackgroundColorStyle(theme.appBG), blinkStyle, styles.zIndex10]}
                                    />
                                </View>
                            </GestureDetector>
                            {canUseMultiScan ? (
                                <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                                    <PressableWithFeedback
                                        role={CONST.ROLE.BUTTON}
                                        accessibilityLabel={translate('receipt.flash')}
                                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                                        disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                                        onPress={() => setFlash((prevFlash) => !prevFlash)}
                                    >
                                        <Icon
                                            height={variables.iconSizeSmall}
                                            width={variables.iconSizeSmall}
                                            src={lazyIcons.Bolt}
                                            fill={flash ? theme.white : theme.icon}
                                        />
                                    </PressableWithFeedback>
                                </View>
                            ) : null}
                        </View>
                    )}
                </View>

                <View style={[styles.justifyContentAround, styles.alignItemsCenter, styles.p3, !isInLandscapeMode && styles.flexRow]}>
                    <AttachmentPicker
                        onOpenPicker={() => {
                            setIsAttachmentPickerActive(true);
                            onAttachmentPickerStatusChange?.(true);
                        }}
                        fileLimit={shouldAcceptMultipleFiles ? CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT : 1}
                        shouldValidateImage={false}
                    >
                        {({openPicker}) => (
                            <PressableWithFeedback
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('receipt.gallery')}
                                sentryLabel={shouldAcceptMultipleFiles ? CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILES : CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILE}
                                style={[styles.alignItemsStart, isMultiScanEnabled && styles.opacity0]}
                                onPress={() => {
                                    openPicker({
                                        onPicked: (data) => emitPickedFiles(data),
                                        onCanceled: () => onAttachmentPickerStatusChange?.(false),
                                        onClosed: () => {
                                            setIsAttachmentPickerActive(false);
                                            onAttachmentPickerStatusChange?.(false);
                                        },
                                    });
                                }}
                            >
                                <Icon
                                    height={variables.iconSizeMenuItem}
                                    width={variables.iconSizeMenuItem}
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
                    {canUseMultiScan ? (
                        <PressableWithFeedback
                            accessibilityRole="button"
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('receipt.multiScan')}
                            style={styles.alignItemsEnd}
                            onPress={toggleMultiScan}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.MULTI_SCAN}
                        >
                            <Icon
                                height={variables.iconSizeMenuItem}
                                width={variables.iconSizeMenuItem}
                                src={lazyIcons.ReceiptMultiple}
                                fill={isMultiScanEnabled ? theme.iconMenu : theme.textSupporting}
                            />
                        </PressableWithFeedback>
                    ) : (
                        <PressableWithFeedback
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('receipt.flash')}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                            style={[styles.alignItemsEnd, !hasFlash && styles.opacity0]}
                            disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                            onPress={() => setFlash((prevFlash) => !prevFlash)}
                        >
                            <Icon
                                height={variables.iconSizeMenuItem}
                                width={variables.iconSizeMenuItem}
                                src={flash ? lazyIcons.Bolt : lazyIcons.boltSlash}
                                fill={theme.textSupporting}
                            />
                        </PressableWithFeedback>
                    )}
                </View>
            </View>
        </View>
    );
}

Camera.displayName = 'Camera';

export default Camera;
export type {CameraProps};
