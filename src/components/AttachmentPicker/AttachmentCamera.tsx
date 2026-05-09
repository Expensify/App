import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Modal, View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated from 'react-native-reanimated';
import type {Camera, PhotoFile} from 'react-native-vision-camera';
import {useCameraDevice, useCameraFormat, Camera as VisionCamera} from 'react-native-vision-camera';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useTapToFocusGesture} from '@hooks/useNativeCamera';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {showCameraPermissionsAlert} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import CameraPermission from '@pages/iou/request/step/IOURequestStepScan/CameraPermission';
import variables from '@styles/variables';
import CONST from '@src/CONST';

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
};

function AttachmentCamera({isVisible, onCapture, onClose}: AttachmentCameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const insets = useSafeAreaInsets();
    const StyleUtils = useStyleUtils();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'boltSlash', 'CameraFlip', 'Close']);
    const lazyIllustrations = useMemoizedLazyIllustrations(['Shutter', 'Hand']);

    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
    const [flash, setFlash] = useState(false);
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const isCapturing = useRef(false);
    const isActiveRef = useRef(false);
    const cameraRef = useRef<Camera>(null);

    const device = useCameraDevice(cameraPosition, {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });

    const format = useCameraFormat(device, [
        {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
        {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
    ]);
    const hasFlash = !!device?.hasFlash;
    // Format dimensions are in landscape orientation, so height/width gives portrait aspect ratio
    const cameraAspectRatio = useMemo(() => (format ? format.photoHeight / format.photoWidth : undefined), [format]);

    const {tapGesture, cameraFocusIndicatorAnimatedStyle} = useTapToFocusGesture(cameraRef, device?.supportsFocus ?? false);

    // Permission management
    const askForPermissions = useCallback(() => {
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

    // Track visibility in a ref so async takePhoto callbacks can detect stale sessions
    useEffect(() => {
        isActiveRef.current = isVisible;
    }, [isVisible]);

    // Refresh permissions when modal becomes visible and auto-request if denied
    useEffect(() => {
        if (!isVisible) {
            return;
        }

        let ignore = false;
        CameraPermission?.getCameraPermissionStatus?.()
            .then((status: string) => {
                if (ignore) {
                    return;
                }
                setCameraPermissionStatus(status);
                if (status === RESULTS.DENIED) {
                    askForPermissions();
                }
            })
            .catch(() => {
                if (ignore) {
                    return;
                }
                setCameraPermissionStatus(RESULTS.UNAVAILABLE);
            });
        return () => {
            ignore = true;
        };
    }, [isVisible, askForPermissions]);

    const capturePhoto = useCallback(() => {
        if (cameraPermissionStatus !== RESULTS.GRANTED) {
            askForPermissions();
            return;
        }

        if (!cameraRef.current || isCapturing.current) {
            return;
        }

        isCapturing.current = true;

        const path = getReceiptsUploadFolderPath();

        cameraRef.current
            .takePhoto({
                flash: flash && hasFlash ? 'on' : 'off',
                path,
            })
            .then((photo: PhotoFile) => {
                // Discard capture if the camera was closed while takePhoto was in-flight
                if (!isActiveRef.current) {
                    return;
                }
                const uri = getPhotoSource(photo.path);
                const fileName = photo.path.substring(photo.path.lastIndexOf('/') + 1) || `photo_${Date.now()}.jpg`;

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
                Log.warn('Error capturing photo', {error: error.message});
            })
            .finally(() => {
                isCapturing.current = false;
            });
    }, [askForPermissions, cameraPermissionStatus, flash, hasFlash, onCapture]);

    const handleClose = useCallback(() => {
        isCapturing.current = false;
        setFlash(false);
        setCameraPosition('back');
        onClose();
    }, [onClose]);

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
            supportedOrientations={['portrait']}
            statusBarTranslucent
        >
            <View style={[styles.flex1, {backgroundColor: theme.appBG}, StyleUtils.getPlatformSafeAreaPadding(insets)]}>
                {/* Close button */}
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

                {/* Camera area */}
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
                                onPress={askForPermissions}
                            />
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device == null && (
                        <View style={[styles.cameraView, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                style={[styles.flex1]}
                                color={theme.textSupporting}
                                reasonAttributes={{context: 'AttachmentCamera', deviceAvailable: false}}
                            />
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device != null && (
                        <View style={[styles.cameraView, styles.alignItemsCenter]}>
                            <GestureDetector gesture={tapGesture}>
                                <View style={StyleUtils.getCameraViewfinderStyle(cameraAspectRatio, false)}>
                                    <VisionCamera
                                        ref={cameraRef}
                                        device={device}
                                        format={format ?? undefined}
                                        style={styles.flex1}
                                        zoom={device.neutralZoom}
                                        photo
                                        isActive={isVisible}
                                        photoQualityBalance="quality"
                                    />
                                    <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                                </View>
                            </GestureDetector>
                        </View>
                    )}
                </View>

                {/* Bottom controls */}
                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                    {/* Flash toggle */}
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

                    {/* Shutter button */}
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

                    {/* Camera flip */}
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flipCamera')}
                        style={[styles.alignItemsEnd]}
                        disabled={cameraPermissionStatus !== RESULTS.GRANTED}
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
