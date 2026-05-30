import React, {useRef} from 'react';
import {Alert, Platform, View} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';
import type {PhotoFile} from 'react-native-vision-camera';
import {useCameraFormat} from 'react-native-vision-camera';
import ActivityIndicator from '@components/ActivityIndicator';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useNativeCamera from '@hooks/useNativeCamera';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import HapticFeedback from '@libs/HapticFeedback';
import Log from '@libs/Log';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import captureReceipt from '@pages/iou/request/step/IOURequestStepScan/captureReceipt';
import CameraPermissionPrompt from '@pages/iou/request/step/IOURequestStepScan/components/CameraPermissionPrompt';
import CameraViewport from '@pages/iou/request/step/IOURequestStepScan/components/CameraViewport';
import {useMultiScanActions, useMultiScanState} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';
import MultiScanEducationalModal from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanEducationalModal';
import ReceiptPreviews from '@pages/iou/request/step/IOURequestStepScan/components/ReceiptPreviews';
import ScannerControlsBar from '@pages/iou/request/step/IOURequestStepScan/components/ScannerControlsBar';
import getCameraAspectRatio from '@pages/iou/request/step/IOURequestStepScan/getCameraAspectRatio';
import useCameraInitTelemetry from '@pages/iou/request/step/IOURequestStepScan/hooks/useCameraInitTelemetry';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import type {CameraProps} from './types';

const BLINK_DURATION_MS = 80;

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
    const {windowWidth, windowHeight} = useWindowDimensions();
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

    // Prioritize photoResolution so the format selector picks the configured PHOTO_WIDTH/PHOTO_HEIGHT
    // format. videoResolution is platform-specific:
    //  - iOS: match the photo target — `takeSnapshot` reads from the video pipeline, so a smaller
    //    video resolution would degrade the snapshot capture quality.
    //  - Android: keep screen dimensions — `takeSnapshot` is a GPU screenshot of the preview surface
    //    and doesn't depend on video resolution; constraining to screen size avoids burning GPU on a
    //    higher-than-needed preview.
    const format = useCameraFormat(device, [
        {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
        {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
        Platform.OS === 'ios'
            ? {videoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}}
            : {videoResolution: {width: windowHeight, height: windowWidth}},
    ]);
    const cameraAspectRatio = getCameraAspectRatio(format, isInLandscapeMode);
    const fps = format ? Math.min(Math.max(30, format.minFps), format.maxFps) : 30;

    // Blink animation for shutter feedback
    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const showBlink = () => {
        blinkOpacity.set(withSequence(withTiming(1, {duration: BLINK_DURATION_MS}), withTiming(0, {duration: BLINK_DURATION_MS})));
        HapticFeedback.press();
    };

    const {handleCameraInitialized} = useCameraInitTelemetry({cameraPermissionStatus, device});

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
                endSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);

                if (isMultiScanEnabled) {
                    isCapturingPhoto.current = false;
                } else {
                    setDidCapturePhoto(true);
                }

                const source = getPhotoSource(photo.path);
                const cameraFile: FileObject = {
                    uri: source,
                    name: photo.path,
                    type: 'image/jpeg',
                };

                onCapture(cameraFile, source);
            })
            .catch((error: string) => {
                isCapturingPhoto.current = false;
                maybeCancelShutterSpan();
                showCameraAlert();
                Log.warn('Error taking photo', error);
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
                                reasonAttributes={cameraLoadingReasonAttributes}
                            />
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device != null && (
                        <CameraViewport
                            camera={camera}
                            device={device}
                            format={format}
                            fps={fps}
                            cameraAspectRatio={cameraAspectRatio}
                            isInLandscapeMode={isInLandscapeMode}
                            tapGesture={tapGesture}
                            cameraFocusIndicatorAnimatedStyle={cameraFocusIndicatorAnimatedStyle}
                            blinkStyle={blinkStyle}
                            isAttachmentPickerActive={isAttachmentPickerActive}
                            didCapturePhoto={didCapturePhoto}
                            onInitialized={handleCameraInitialized}
                            canUseMultiScan={canUseMultiScan}
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
export type {CameraProps};
