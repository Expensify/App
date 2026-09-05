import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWebCamera from '@hooks/useWebCamera';

import HapticFeedback from '@libs/HapticFeedback';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import {useMultiScanActions, useMultiScanState} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';
import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/components/NavigationAwareCamera/WebCamera';
import ReceiptPreviews from '@pages/iou/request/step/IOURequestStepScan/components/ReceiptPreviews';
import {calculateCropRect} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import startReceiptPrepareSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startReceiptPrepareSpan';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {LayoutRectangle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';

import type {CameraProps} from './types';

const BLINK_DURATION_MS = 80;
const CAPTURE_JPEG_QUALITY = 0.92;

/**
 * Crop the current video frame to the viewfinder aspect ratio and encode it once as JPEG.
 **/

function cropVideoFrameToFile(video: HTMLVideoElement, viewfinderLayout: LayoutRectangle | null | undefined): Promise<{file: File; uri: string} | null> {
    return new Promise((resolve) => {
        try {
            const sourceWidth = video.videoWidth;
            const sourceHeight = video.videoHeight;
            const viewfinderWidth = viewfinderLayout?.width ?? NaN;
            const viewfinderHeight = viewfinderLayout?.height ?? NaN;

            // Some browsers center-crop the viewfinder inside the video element (due to object-position: center),
            // while others let it overflow and crop from the top. We align the captured frame the same way.
            const shouldAlignTop = (video.getBoundingClientRect?.()?.height ?? NaN) > viewfinderHeight;
            const crop =
                viewfinderWidth && viewfinderHeight
                    ? calculateCropRect(sourceWidth, sourceHeight, viewfinderWidth, viewfinderHeight, shouldAlignTop)
                    : {originX: 0, originY: 0, width: sourceWidth, height: sourceHeight};

            const canvas = document.createElement('canvas');
            canvas.width = Math.round(crop.width);
            canvas.height = Math.round(crop.height);
            const context = canvas.getContext('2d');

            if (!context) {
                resolve(null);
                return;
            }

            context.drawImage(video, crop.originX, crop.originY, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    if (!blob || blob.size === 0) {
                        resolve(null);
                        return;
                    }

                    const uri = URL.createObjectURL(blob);
                    const file = new File([blob], `receipt_${Date.now()}.jpg`, {type: 'image/jpeg'});
                    file.uri = uri;
                    resolve({file, uri});
                },
                'image/jpeg',
                CAPTURE_JPEG_QUALITY,
            );
        } catch {
            // drawImage/toBlob can throw (e.g. a media/security error). Resolve null so the caller
            // cancels the spans rather than getting an unhandled rejection.
            resolve(null);
        }
    });
}

/**
 * CameraCapture — mobile web capture variant.
 * Renders a camera viewfinder, shutter button, flash toggle and gallery picker.
 * Calls `onCapture(file, source)` for each photo taken or file picked from the gallery.
 */
function CameraCapture({onCapture, onPicked, shouldAcceptMultipleFiles = false, onLayout, onMultiScanSubmit}: CameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['Hand', 'Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'ReceiptMultiple', 'boltSlash']);
    const {isMultiScanEnabled, canUseMultiScan} = useMultiScanState();
    const {toggleMultiScan} = useMultiScanActions();

    const onUnmount = () => {
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
        cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_PREPARE);
    };

    const {
        cameraRef,
        viewfinderLayout: viewfinderLayoutRef,
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
    } = useWebCamera({onUnmount});

    // Blink animation for shutter feedback
    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const showBlink = () => {
        blinkOpacity.set(withSequence(withTiming(1, {duration: BLINK_DURATION_MS}), withTiming(0, {duration: BLINK_DURATION_MS})));
        HapticFeedback.press();
    };

    const getScreenshot = () => {
        if (!cameraRef.current) {
            requestCameraPermission();
            return;
        }

        if (!isMultiScanEnabled) {
            startSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION, {
                name: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                op: CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: CONST.TELEMETRY.SPAN_PLATFORM.WEB},
            });
        }
        startSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: CONST.TELEMETRY.SPAN_PLATFORM.WEB},
        });

        const cancelCaptureSpans = () => {
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
        };

        const video = cameraRef.current.video;
        if (!video?.videoWidth || !video.videoHeight) {
            cancelCaptureSpans();
            return;
        }

        showBlink();

        cropVideoFrameToFile(video, viewfinderLayoutRef.current).then((result) => {
            if (!result) {
                cancelCaptureSpans();
                return;
            }

            endSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            if (!isMultiScanEnabled) {
                startReceiptPrepareSpan(CONST.TELEMETRY.SPAN_PLATFORM.WEB);
            }
            onCapture(result.file, result.uri);
        });
    };

    const capturePhoto = () => {
        capturePhotoWithFlash(getScreenshot);
    };

    return (
        <View
            onLayout={onLayout}
            style={[styles.flex1]}
        >
            <View style={[styles.flex1, styles.justifyContentCenter]}>
                <View style={[styles.cameraView]}>
                    {((cameraPermissionState === 'prompt' && !isQueriedPermissionState) || (cameraPermissionState === 'granted' && isEmptyObject(videoConstraints))) && (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                            color={theme.textSupporting}
                        />
                    )}
                    {cameraPermissionState !== 'granted' && isQueriedPermissionState && (
                        <View style={[styles.flex1, styles.permissionView, styles.userSelectNone]}>
                            <Icon
                                src={lazyIllustrations.Hand}
                                width={CONST.RECEIPT.HAND_ICON_WIDTH}
                                height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                                additionalStyles={[styles.pb5]}
                            />
                            <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                            {cameraPermissionState === 'denied' ? (
                                <Text style={[styles.subTextFileUpload]}>
                                    <RenderHTML html={translate('receipt.deniedCameraAccess')} />
                                </Text>
                            ) : (
                                <Text style={[styles.subTextFileUpload]}>{translate('receipt.cameraAccess')}</Text>
                            )}
                            <Button
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                accessibilityLabel={translate('common.continue')}
                                style={[styles.p9, styles.pt5]}
                                onPress={capturePhoto}
                                sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.SCAN_CAMERA_PERMISSION_BUTTON}
                            >
                                <Button.Text>{translate('common.continue')}</Button.Text>
                            </Button>
                        </View>
                    )}
                    {cameraPermissionState === 'granted' && !isEmptyObject(videoConstraints) && (
                        <View
                            style={styles.flex1}
                            onLayout={(e) => (viewfinderLayoutRef.current = e.nativeEvent.layout)}
                        >
                            <NavigationAwareCamera
                                onUserMedia={setupCameraPermissionsAndCapabilities}
                                onUserMediaError={() => setCameraPermissionState('denied')}
                                style={{
                                    ...styles.videoContainer,
                                    display: cameraPermissionState !== 'granted' ? 'none' : 'block',
                                }}
                                ref={cameraRef}
                                videoConstraints={videoConstraints}
                                audio={false}
                                disablePictureInPicture={false}
                                mirrored={false}
                            />
                            {canUseMultiScan ? (
                                <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, isFlashLightOn && styles.bgGreenSuccess, !isTorchAvailable && styles.opacity0]}>
                                    <PressableWithFeedback
                                        role={CONST.ROLE.BUTTON}
                                        accessibilityLabel={translate('receipt.flash')}
                                        disabled={!isTorchAvailable}
                                        onPress={toggleFlashlight}
                                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                                    >
                                        <Icon
                                            height={variables.iconSizeSmall}
                                            width={variables.iconSizeSmall}
                                            src={lazyIcons.Bolt}
                                            fill={isFlashLightOn ? theme.white : theme.icon}
                                        />
                                    </PressableWithFeedback>
                                </View>
                            ) : null}
                            <Animated.View
                                pointerEvents="none"
                                style={[StyleSheet.absoluteFill, styles.backgroundWhite, blinkStyle, styles.zIndex10]}
                            />
                        </View>
                    )}
                </View>

                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                    <AttachmentPicker
                        acceptedFileTypes={[...CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS]}
                        allowMultiple={shouldAcceptMultipleFiles}
                    >
                        {({openPicker}) => (
                            <PressableWithFeedback
                                accessibilityLabel={translate(shouldAcceptMultipleFiles ? 'common.chooseFiles' : 'common.chooseFile')}
                                role={CONST.ROLE.BUTTON}
                                style={isMultiScanEnabled && styles.opacity0}
                                onPress={() => openPicker({onPicked})}
                                sentryLabel={shouldAcceptMultipleFiles ? CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILES : CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILE}
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
                        style={[styles.alignItemsCenter]}
                        onPress={capturePhoto}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.SHUTTER}
                    >
                        <Icon
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
                            style={[styles.alignItemsEnd, !isTorchAvailable && styles.opacity0]}
                            onPress={toggleFlashlight}
                            disabled={!isTorchAvailable}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                        >
                            <Icon
                                height={variables.iconSizeMenuItem}
                                width={variables.iconSizeMenuItem}
                                src={isFlashLightOn ? lazyIcons.Bolt : lazyIcons.boltSlash}
                                fill={theme.textSupporting}
                            />
                        </PressableWithFeedback>
                    )}
                </View>
            </View>
            {canUseMultiScan && !!onMultiScanSubmit && (
                <ReceiptPreviews
                    isMultiScanEnabled={isMultiScanEnabled}
                    submit={onMultiScanSubmit}
                />
            )}
        </View>
    );
}

CameraCapture.displayName = 'CameraCapture';

export default CameraCapture;
