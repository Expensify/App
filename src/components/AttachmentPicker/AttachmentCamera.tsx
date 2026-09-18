/**
 * In-app VisionCamera modal used by the native AttachmentPicker.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import Modal from '@components/Modal';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import useIsPlatformMuted from '@hooks/useIsPlatformMuted';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {requestCameraPermission, useTapToFocusGesture} from '@hooks/useNativeCamera';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getFileName} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getVideoResolutionFormatFilter from '@libs/getVideoResolutionFormatFilter';
import isInLandscapeMode from '@libs/isInLandscapeMode';
import {logCameraCaptureFailed, logCameraRuntimeError} from '@libs/telemetry/ReceiptObservability';

import CameraPermission from '@pages/iou/request/step/IOURequestStepScan/CameraPermission';
import getCameraAspectRatio from '@pages/iou/request/step/IOURequestStepScan/getCameraAspectRatio';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {Camera, CameraRuntimeError, PhotoFile} from 'react-native-vision-camera';

import React, {useEffect, useRef, useState} from 'react';
import {Alert, AppState, View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated from 'react-native-reanimated';
import {useCameraDevice, useCameraDevices, useCameraFormat, Camera as VisionCamera} from 'react-native-vision-camera';

type CapturedPhoto = {
    uri: string;
    fileName: string;
    type: string;
    width: number;
    height: number;
};

type AttachmentCameraProps = {
    /** Whether the camera modal is visible */
    isVisible: boolean;

    /** Callback when a photo is captured */
    onCapture: (photos: CapturedPhoto[]) => void;

    /** Callback when the camera is closed */
    onClose: () => void;

    /** Callback fired once the modal has finished its hide animation */
    onModalHide: () => void;
};

function AttachmentCamera({isVisible, onCapture, onClose, onModalHide}: AttachmentCameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const insets = useSafeAreaInsets();
    const StyleUtils = useStyleUtils();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const isLandscape = isInLandscapeMode(windowWidth, windowHeight);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'boltSlash', 'CameraFlip', 'Close']);
    const lazyIllustrations = useMemoizedLazyIllustrations(['Shutter', 'Hand']);
    const isPlatformMuted = useIsPlatformMuted();

    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
    const [flash, setFlash] = useState(false);
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const isCapturing = useRef(false);
    const isActiveRef = useRef(false);
    const cameraRef = useRef<Camera>(null);

    const device = useCameraDevice(cameraPosition, {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });

    const cameraDevices = useCameraDevices();
    const canFlipCamera = cameraDevices.some((d) => d.position === 'front') && cameraDevices.some((d) => d.position === 'back');

    const format = useCameraFormat(device, [
        {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
        {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
        getVideoResolutionFormatFilter(windowWidth, windowHeight),
    ]);
    const hasFlash = !!device?.hasFlash;
    const cameraAspectRatio = getCameraAspectRatio(format, isLandscape);

    const {tapGesture, cameraFocusIndicatorAnimatedStyle} = useTapToFocusGesture(cameraRef, device?.supportsFocus ?? false);

    const askForPermissions = () => requestCameraPermission(translate, setCameraPermissionStatus);

    useEffect(() => {
        isActiveRef.current = isVisible;
    }, [isVisible]);

    // Refresh permissions when modal becomes visible or when returning from app settings
    useEffect(() => {
        if (!isVisible) {
            return;
        }

        let ignore = false;
        const refreshCameraPermissionStatus = (autoRequest = false) => {
            CameraPermission?.getCameraPermissionStatus?.()
                .then((status: string) => {
                    if (ignore) {
                        return;
                    }
                    setCameraPermissionStatus(status);
                    if (autoRequest && status === RESULTS.DENIED) {
                        requestCameraPermission(translate, setCameraPermissionStatus);
                    }
                })
                .catch(() => {
                    if (ignore) {
                        return;
                    }
                    setCameraPermissionStatus(RESULTS.UNAVAILABLE);
                });
        };

        refreshCameraPermissionStatus(true);

        const subscription = AppState.addEventListener('change', (appState) => {
            if (appState !== 'active') {
                return;
            }
            refreshCameraPermissionStatus();
        });

        return () => {
            ignore = true;
            subscription.remove();
        };
    }, [isVisible, translate]);

    const capturePhoto = () => {
        if (cameraPermissionStatus !== RESULTS.GRANTED) {
            askForPermissions();
            return;
        }

        if (!cameraRef.current || isCapturing.current) {
            return;
        }

        isCapturing.current = true;

        cameraRef.current
            .takePhoto({
                flash: flash && hasFlash ? 'on' : 'off',
                enableShutterSound: !isPlatformMuted,
            })
            .then((photo: PhotoFile) => {
                // Discard capture if the camera was closed while takePhoto was in-flight
                if (!isActiveRef.current) {
                    return;
                }
                const uri = getPhotoSource(photo.path);
                const fileName = getFileName(photo.path) || `photo_${Date.now()}.jpg`;

                onCapture([
                    {
                        uri,
                        fileName,
                        type: 'image/jpeg',
                        width: photo.width,
                        height: photo.height,
                    },
                ]);
            })
            .catch((error: Error) => {
                Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
                logCameraCaptureFailed(error);
            })
            .finally(() => {
                isCapturing.current = false;
            });
    };

    const handleCameraError = (error: CameraRuntimeError) => {
        Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        logCameraRuntimeError({code: error.code, message: error.message});
    };

    const handleClose = () => {
        isCapturing.current = false;
        setFlash(false);
        setCameraPosition('back');
        onClose();
    };

    return (
        <Modal
            isVisible={isVisible}
            onClose={handleClose}
            onModalHide={onModalHide}
            type={CONST.MODAL.MODAL_TYPE.FULLSCREEN}
            style={styles.appBG}
            innerContainerStyle={styles.flex1}
        >
            <View style={[styles.flex1, styles.appBG, StyleUtils.getPlatformSafeAreaPadding(insets)]}>
                <View style={[styles.flexRow, styles.justifyContentEnd, styles.ph3, styles.pv2]}>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                        onPress={handleClose}
                        sentryLabel="AttachmentCamera-Close"
                    >
                        <Icon
                            height={variables.iconSizeNormal}
                            width={variables.iconSizeNormal}
                            src={lazyIcons.Close}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                </View>

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
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                accessibilityLabel={translate('common.continue')}
                                style={[styles.p9, styles.pt5]}
                                onPress={askForPermissions}
                            >
                                <Button.Text>{translate('common.continue')}</Button.Text>
                            </Button>
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device == null && (
                        <View style={[styles.cameraView, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                style={[styles.flex1]}
                                color={theme.textSupporting}
                            />
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device != null && (
                        <View style={[styles.cameraView, styles.alignItemsCenter]}>
                            <GestureDetector gesture={tapGesture}>
                                <View style={StyleUtils.getCameraViewfinderStyle(cameraAspectRatio, isLandscape)}>
                                    <VisionCamera
                                        ref={cameraRef}
                                        device={device}
                                        format={format ?? undefined}
                                        style={styles.flex1}
                                        zoom={device.neutralZoom}
                                        photo
                                        isActive={isVisible}
                                        photoQualityBalance="quality"
                                        onError={handleCameraError}
                                    />
                                    <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                                </View>
                            </GestureDetector>
                        </View>
                    )}
                </View>

                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flash')}
                        style={[styles.alignItemsStart, !hasFlash && styles.opacity0]}
                        disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                        onPress={() => setFlash((prevFlash) => !prevFlash)}
                        sentryLabel="AttachmentCamera-Flash"
                    >
                        <Icon
                            height={variables.iconSizeMenuItem}
                            width={variables.iconSizeMenuItem}
                            src={flash ? lazyIcons.Bolt : lazyIcons.boltSlash}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>

                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.shutter')}
                        style={[styles.alignItemsCenter]}
                        onPress={capturePhoto}
                        sentryLabel="AttachmentCamera-Shutter"
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
                        accessibilityLabel={translate('receipt.flipCamera')}
                        style={[styles.alignItemsEnd, !canFlipCamera && styles.opacity0]}
                        disabled={cameraPermissionStatus !== RESULTS.GRANTED || !canFlipCamera}
                        onPress={() => setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'))}
                        sentryLabel="AttachmentCamera-FlipCamera"
                    >
                        <Icon
                            height={variables.iconSizeMenuItem}
                            width={variables.iconSizeMenuItem}
                            src={lazyIcons.CameraFlip}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>
                </View>
            </View>
        </Modal>
    );
}

export default AttachmentCamera;
export type {CapturedPhoto};
