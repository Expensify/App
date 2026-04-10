import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, Modal, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import type {Camera, PhotoFile, Point} from 'react-native-vision-camera';
import {useCameraDevice, useCameraFormat, Camera as VisionCamera} from 'react-native-vision-camera';
import {scheduleOnRN} from 'react-native-worklets';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();
    const insets = useSafeAreaInsets();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'boltSlash', 'CameraFlip', 'Close']);
    const lazyIllustrations = useMemoizedLazyIllustrations(['Shutter', 'Hand']);

    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
    const [flash, setFlash] = useState(false);
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const isCapturing = useRef(false);
    const camera = useRef<Camera>(null);

    const device = useCameraDevice(cameraPosition, {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });

    const format = useCameraFormat(device, [
        {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
        {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
        {videoResolution: {width: windowHeight, height: windowWidth}},
    ]);
    const cameraAspectRatio = format ? format.photoHeight / format.photoWidth : undefined;
    const hasFlash = !!device?.hasFlash;

    // Focus indicator animations (same pattern as useNativeCamera)
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

    // Permission management
    const refreshCameraPermissionStatus = useCallback(() => {
        CameraPermission?.getCameraPermissionStatus?.()
            .then(setCameraPermissionStatus)
            .catch(() => setCameraPermissionStatus(RESULTS.UNAVAILABLE));
    }, []);

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

    // Refresh permissions when modal becomes visible and when app returns to foreground
    useEffect(() => {
        if (!isVisible) {
            return;
        }

        refreshCameraPermissionStatus();

        const subscription = AppState.addEventListener('change', (appState) => {
            if (appState !== 'active') {
                return;
            }
            refreshCameraPermissionStatus();
        });

        return () => {
            subscription.remove();
        };
    }, [isVisible, refreshCameraPermissionStatus]);

    // Auto-request permission if denied when modal first opens
    useEffect(() => {
        if (!isVisible || cameraPermissionStatus === null) {
            return;
        }
        if (cameraPermissionStatus === RESULTS.DENIED) {
            askForPermissions();
        }
    }, [isVisible, cameraPermissionStatus, askForPermissions]);

    const capturePhoto = useCallback(() => {
        if (cameraPermissionStatus !== RESULTS.GRANTED) {
            askForPermissions();
            return;
        }

        if (!camera.current || isCapturing.current) {
            return;
        }

        isCapturing.current = true;

        const path = getReceiptsUploadFolderPath();

        camera.current
            .takePhoto({
                flash: flash && hasFlash ? 'on' : 'off',
                path,
            })
            .then((photo: PhotoFile) => {
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
            supportedOrientations={['portrait', 'landscape']}
            statusBarTranslucent
        >
            <View style={[styles.flex1, {backgroundColor: theme.appBG, paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right}]}>
                {/* Close button */}
                <View style={[styles.flexRow, styles.justifyContentEnd, styles.ph3, styles.pv2]}>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                        onPress={handleClose}
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
                                    onPress={askForPermissions}
                                />
                            </View>
                        </ScrollView>
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
                                <View style={StyleUtils.getCameraViewfinderStyle(cameraAspectRatio)}>
                                    <VisionCamera
                                        ref={camera}
                                        device={device}
                                        format={format ?? undefined}
                                        style={StyleSheet.absoluteFill}
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
