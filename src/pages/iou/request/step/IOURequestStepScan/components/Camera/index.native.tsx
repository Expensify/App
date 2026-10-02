import ActivityIndicator from '@components/ActivityIndicator';

import useCameraPhotoAspectRatio from '@hooks/useCameraPhotoAspectRatio';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useNativeCamera from '@hooks/useNativeCamera';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type CapturedPhoto from '@libs/cameraCapture/types';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import HapticFeedback from '@libs/HapticFeedback';
import Log from '@libs/Log';
import ReceiptStorage from '@libs/ReceiptStorage';
import {cancelSpan, endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import captureReceipt, {shouldTakePhoto} from '@pages/iou/request/step/IOURequestStepScan/captureReceipt';
import CameraPermissionPrompt from '@pages/iou/request/step/IOURequestStepScan/components/CameraPermissionPrompt';
import CameraViewport from '@pages/iou/request/step/IOURequestStepScan/components/CameraViewport';
import {useMultiScanActions, useMultiScanState} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';
import MultiScanEducationalModal from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanEducationalModal';
import ReceiptPreviews from '@pages/iou/request/step/IOURequestStepScan/components/ReceiptPreviews';
import ScannerControlsBar from '@pages/iou/request/step/IOURequestStepScan/components/ScannerControlsBar';
import useCameraInitTelemetry from '@pages/iou/request/step/IOURequestStepScan/hooks/useCameraInitTelemetry';
import startReceiptPrepareSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startReceiptPrepareSpan';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useRef} from 'react';
import {Alert, Platform, View} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';
import {usePhotoOutput} from 'react-native-vision-camera';

import type {CameraProps} from './types';

const BLINK_DURATION_MS = 80;

const PHOTO_TARGET_RESOLUTION = {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT};

const QUALITY_PRIORITIZATION = Platform.OS === 'ios' ? 'speed' : 'quality';

const PREPARED_IOS_PHOTO_SETTINGS = [{flashMode: 'off' as const, enableShutterSound: false}];

/**
 * Camera — native capture variant.
 * Renders a react-native-vision-camera viewfinder with shutter, flash toggle, gallery picker, and focus gesture.
 * Calls `onCapture(file, source)` for each photo taken or file picked from the gallery.
 */
function Camera({onCapture, onPicked, shouldAcceptMultipleFiles = false, onLayout, onAttachmentPickerStatusChange, onMultiScanSubmit}: CameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isMultiScanEnabled, canUseMultiScan} = useMultiScanState();
    const {toggleMultiScan} = useMultiScanActions();

    // Ref for double-tap protection (doesn't trigger re-render)
    const isCapturingPhoto = useRef(false);

    const onFocusStart = () => {
        isCapturingPhoto.current = false;
    };

    const onFocusCleanup = () => {
        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_PREPARE);
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
    } = useNativeCamera({onFocusStart, onFocusCleanup});

    // v5's default 'native' container is HEIC on iOS.
    const photoOutput = usePhotoOutput({targetResolution: PHOTO_TARGET_RESOLUTION, containerFormat: 'jpeg', qualityPrioritization: QUALITY_PRIORITIZATION});
    const outputs = [photoOutput];
    // `<Camera>` already adds a `resolutionBias` for every output.
    const constraints = [{fps: 30}];
    const {cameraAspectRatio, updatePhotoResolution} = useCameraPhotoAspectRatio(photoOutput, PHOTO_TARGET_RESOLUTION, isInLandscapeMode);

    // Blink animation for shutter feedback
    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const showBlink = () => {
        blinkOpacity.set(withSequence(withTiming(1, {duration: BLINK_DURATION_MS}), withTiming(0, {duration: BLINK_DURATION_MS})));
        HapticFeedback.press();
    };

    const {handleCameraInitialized, handleSessionConfigSelected} = useCameraInitTelemetry({cameraPermissionStatus, device});

    // VisionCamera replaces the prepared settings on every reconfigure.
    const handleCameraConfigured = () => {
        updatePhotoResolution();
        handleCameraInitialized();
        if (Platform.OS !== 'ios') {
            return;
        }
        photoOutput.prepareSettings(PREPARED_IOS_PHOTO_SETTINGS).catch((error: unknown) => {
            Log.info('[Camera] could not prepare the photo settings', false, {error: error instanceof Error ? error.message : String(error)});
        });
    };

    const maybeCancelShutterSpan = () => {
        if (isMultiScanEnabled) {
            return;
        }

        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_PREPARE);
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
    };

    const capturePhoto = () => {
        if (!isMultiScanEnabled) {
            startSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION, {
                name: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                op: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: CONST.TELEMETRY.SPAN_PLATFORM.NATIVE},
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
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: CONST.TELEMETRY.SPAN_PLATFORM.NATIVE,
                [CONST.TELEMETRY.ATTRIBUTE_CAPTURE_METHOD]: shouldTakePhoto({flash, hasFlash, isInLandscapeMode})
                    ? CONST.TELEMETRY.CAPTURE_METHOD.PHOTO
                    : CONST.TELEMETRY.CAPTURE_METHOD.SNAPSHOT,
                [CONST.TELEMETRY.ATTRIBUTE_FLASH_USED]: flash && hasFlash,
            },
        });

        isCapturingPhoto.current = true;
        showBlink();

        captureReceipt(camera.current, photoOutput, {flash, hasFlash, isPlatformMuted, isInLandscapeMode, path: getReceiptsUploadFolderPath()})
            .then((photo: CapturedPhoto) => {
                endSpanWithAttributes(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE, {
                    [CONST.TELEMETRY.ATTRIBUTE_PHOTO_WIDTH]: photo.width,
                    [CONST.TELEMETRY.ATTRIBUTE_PHOTO_HEIGHT]: photo.height,
                });
                if (!isMultiScanEnabled) {
                    startReceiptPrepareSpan(CONST.TELEMETRY.SPAN_PLATFORM.NATIVE);
                }
                return ReceiptStorage.adopt(photo.path);
            })
            .then((durableName) => {
                if (isMultiScanEnabled) {
                    isCapturingPhoto.current = false;
                } else {
                    setDidCapturePhoto(true);
                }

                const source = ReceiptStorage.toLocalUri(durableName);
                const cameraFile: FileObject = {
                    uri: source,
                    name: durableName,
                    type: 'image/jpeg',
                };

                onCapture(cameraFile, source);
            })
            .catch((error: unknown) => {
                isCapturingPhoto.current = false;
                maybeCancelShutterSpan();
                showCameraAlert();
                Log.warn('Error taking photo', {message: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined});
            });
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
                        <CameraPermissionPrompt
                            isInLandscapeMode={isInLandscapeMode}
                            onPress={capturePhoto}
                        />
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device == null && (
                        <View style={[styles.cameraView]}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                style={[styles.flex1]}
                                color={theme.textSupporting}
                            />
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device != null && (
                        <CameraViewport
                            camera={camera}
                            device={device}
                            outputs={outputs}
                            constraints={constraints}
                            cameraAspectRatio={cameraAspectRatio}
                            isInLandscapeMode={isInLandscapeMode}
                            tapGesture={tapGesture}
                            cameraFocusIndicatorAnimatedStyle={cameraFocusIndicatorAnimatedStyle}
                            blinkStyle={blinkStyle}
                            isAttachmentPickerActive={isAttachmentPickerActive}
                            didCapturePhoto={didCapturePhoto}
                            onConfigured={handleCameraConfigured}
                            onStarted={updatePhotoResolution}
                            onSessionConfigSelected={handleSessionConfigSelected}
                            shouldShowFlashButton={canUseMultiScan}
                            cameraPermissionStatus={cameraPermissionStatus}
                            flash={flash}
                            hasFlash={hasFlash}
                            setFlash={setFlash}
                        />
                    )}
                </View>

                <ScannerControlsBar
                    isInLandscapeMode={isInLandscapeMode}
                    isMultiScanEnabled={isMultiScanEnabled}
                    canUseMultiScan={canUseMultiScan}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                    cameraPermissionStatus={cameraPermissionStatus}
                    flash={flash}
                    hasFlash={hasFlash}
                    setFlash={setFlash}
                    setIsAttachmentPickerActive={setIsAttachmentPickerActive}
                    onAttachmentPickerStatusChange={onAttachmentPickerStatusChange}
                    onPicked={onPicked}
                    capturePhoto={capturePhoto}
                    toggleMultiScan={toggleMultiScan}
                />

                {canUseMultiScan && !!onMultiScanSubmit && isInLandscapeMode && (
                    <ReceiptPreviews
                        isMultiScanEnabled={isMultiScanEnabled}
                        submit={onMultiScanSubmit}
                        isCapturingPhoto={didCapturePhoto}
                        isInLandscapeMode
                    />
                )}
            </View>

            {canUseMultiScan && !!onMultiScanSubmit && !isInLandscapeMode && (
                <ReceiptPreviews
                    isMultiScanEnabled={isMultiScanEnabled}
                    submit={onMultiScanSubmit}
                    isCapturingPhoto={didCapturePhoto}
                />
            )}
            <MultiScanEducationalModal />
        </View>
    );
}

Camera.displayName = 'Camera';

export default Camera;
