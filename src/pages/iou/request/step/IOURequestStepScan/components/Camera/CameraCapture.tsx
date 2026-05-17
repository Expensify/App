import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWebCamera from '@hooks/useWebCamera';
import {base64ToFile} from '@libs/fileDownload/FileUtils';
import HapticFeedback from '@libs/HapticFeedback';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {useMultiScanActions, useMultiScanState} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';
import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/components/NavigationAwareCamera/WebCamera';
import {cropImageToAspectRatio} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import type {ImageObject} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CameraProps} from './types';

const BLINK_DURATION_MS = 80;

/**
 * CameraCapture — mobile web capture variant.
 * Renders a camera viewfinder, shutter button, flash toggle and gallery picker.
 * Calls `onCapture(file, source)` for each photo taken or file picked from the gallery.
 */
function CameraCapture({onCapture, shouldAcceptMultipleFiles = false, onLayout}: CameraProps) {
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
                attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'web'},
            });
        }
        startSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'web'},
        });

        const imageBase64 = cameraRef.current.getScreenshot();

        if (imageBase64 === null) {
            cancelSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            return;
        }

        showBlink();

        const originalFileName = `receipt_${Date.now()}.png`;
        const originalFile = base64ToFile(imageBase64 ?? '', originalFileName);
        const imageObject: ImageObject = {file: originalFile, filename: originalFile.name, source: URL.createObjectURL(originalFile)};
        // Some browsers center-crop the viewfinder inside the video element (due to object-position: center),
        // while other browsers let the video element overflow and the container crops it from the top.
        // We crop and align the result image the same way.
        const videoHeight = cameraRef.current.video?.getBoundingClientRect?.()?.height ?? NaN;
        const viewFinderHeight = viewfinderLayoutRef.current?.height ?? NaN;
        const shouldAlignTop = videoHeight > viewFinderHeight;
        cropImageToAspectRatio(imageObject, viewfinderLayoutRef.current?.width, viewfinderLayoutRef.current?.height, shouldAlignTop).then(({file, source}) => {
            endSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE);
            onCapture(file, source);
        });
    };

    const capturePhoto = () => {
        capturePhotoWithFlash(getScreenshot);
    };

    const emitPickedFiles = (files: FileObject[]) => {
        for (const file of files) {
            const source = file.uri ?? URL.createObjectURL(file as Blob);
            onCapture(file, source);
        }
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
                            reasonAttributes={
                                {
                                    context: 'CameraCapture',
                                    cameraPermissionState,
                                    isQueriedPermissionState,
                                } satisfies SkeletonSpanReasonAttributes
                            }
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
                                success
                                text={translate('common.continue')}
                                accessibilityLabel={translate('common.continue')}
                                style={[styles.p9, styles.pt5]}
                                onPress={capturePhoto}
                                sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.SCAN_SUBMIT_BUTTON}
                            />
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
                                screenshotFormat="image/png"
                                videoConstraints={videoConstraints}
                                forceScreenshotSourceSize
                                audio={false}
                                disablePictureInPicture={false}
                                imageSmoothing={false}
                                mirrored={false}
                                screenshotQuality={0}
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
                                onPress={() => {
                                    openPicker({
                                        onPicked: (data) => emitPickedFiles(data),
                                    });
                                }}
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
        </View>
    );
}

CameraCapture.displayName = 'CameraCapture';

export default CameraCapture;
