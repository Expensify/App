import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, AppState, Modal, View} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import type {Camera, PhotoFile} from 'react-native-vision-camera';
import {useCameraDevice, useCameraFormat, Camera as VisionCamera} from 'react-native-vision-camera';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {showCameraPermissionsAlert} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import Log from '@libs/Log';
import CameraPermission from '@pages/iou/request/step/IOURequestStepScan/CameraPermission';
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

    /** Callback when the camera is closed without capturing */
    onClose: () => void;
};

function AttachmentCamera({isVisible, onCapture, onClose}: AttachmentCameraProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const insets = useSafeAreaInsets();

    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'boltSlash', 'CameraFlip']);
    const lazyIllustrations = useMemoizedLazyIllustrations(['Shutter', 'Hand']);

    const camera = useRef<Camera>(null);
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const isCapturing = useRef(false);
    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');

    const device = useCameraDevice(cameraPosition, {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });
    const format = useCameraFormat(device, [{photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO}, {photoResolution: 'max'}]);
    const cameraAspectRatio = format ? format.photoHeight / format.photoWidth : undefined;
    const hasFlash = !!device?.hasFlash;

    // Check camera permissions when modal opens and refresh when app returns to foreground
    useEffect(() => {
        if (!isVisible) {
            return;
        }

        const refreshCameraPermissionStatus = () => {
            CameraPermission.getCameraPermissionStatus?.()
                .then(setCameraPermissionStatus)
                .catch(() => setCameraPermissionStatus(RESULTS.UNAVAILABLE));
        };

        // Initial permission check — request if not yet asked
        CameraPermission.getCameraPermissionStatus?.()
            .then((status) => {
                if (status === RESULTS.DENIED) {
                    return CameraPermission.requestCameraPermission?.().then(setCameraPermissionStatus);
                }
                setCameraPermissionStatus(status);
            })
            .catch(() => setCameraPermissionStatus(RESULTS.UNAVAILABLE));

        // Refresh permission when the app returns to foreground (e.g. after granting in OS Settings)
        const subscription = AppState.addEventListener('change', (appState) => {
            if (appState !== 'active') {
                return;
            }
            refreshCameraPermissionStatus();
        });

        return () => {
            subscription.remove();
        };
    }, [isVisible]);

    const [flash, setFlash] = useState(false);

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
            .catch(() => setCameraPermissionStatus(RESULTS.UNAVAILABLE));
    }, [translate]);

    const capturePhoto = useCallback(() => {
        // Check permissions first — camera ref will be null when permission is not granted
        // because the VisionCamera component is not rendered
        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            askForPermissions();
            return;
        }

        if (!camera.current || isCapturing.current) {
            return;
        }

        isCapturing.current = true;

        camera.current
            .takePhoto({
                flash: flash && hasFlash ? 'on' : 'off',
            })
            .then((photo: PhotoFile) => {
                const uri = getPhotoSource(photo.path);
                const fileName = photo.path.split('/').pop() ?? `photo_${Date.now()}.jpg`;

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
            .catch((error: unknown) => {
                Log.warn('AttachmentCamera: Error taking photo', {error});
                Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
            })
            .finally(() => {
                isCapturing.current = false;
            });
    }, [cameraPermissionStatus, flash, hasFlash, onCapture, translate, askForPermissions]);

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="fullScreen"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(theme.appBG), {paddingTop: insets.top}]}>
                <HeaderWithBackButton onBackButtonPress={onClose} />
                {/* Camera viewfinder area */}
                <View style={styles.flex1}>
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
                        <View style={styles.cameraView}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                style={styles.flex1}
                                color={theme.textSupporting}
                                reasonAttributes={{context: 'AttachmentCamera.deviceLoading'}}
                            />
                        </View>
                    )}
                    {cameraPermissionStatus === RESULTS.GRANTED && device != null && (
                        <View style={[styles.cameraView, styles.alignItemsCenter]}>
                            <View style={StyleUtils.getCameraViewfinderStyle(cameraAspectRatio)}>
                                <VisionCamera
                                    ref={camera}
                                    device={device}
                                    format={format}
                                    style={styles.flex1}
                                    zoom={device.neutralZoom}
                                    photo
                                    isActive={isVisible}
                                    photoQualityBalance="speed"
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Bottom controls */}
                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3, {paddingBottom: insets.bottom + 12}]}>
                    {/* Flash toggle */}
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flash')}
                        style={[styles.alignItemsEnd, !hasFlash && styles.opacity0]}
                        disabled={!hasFlash}
                        onPress={() => setFlash((prev) => !prev)}
                        sentryLabel="AttachmentCamera-FlashToggle"
                    >
                        <Icon
                            height={32}
                            width={32}
                            src={flash ? lazyIcons.Bolt : lazyIcons.boltSlash}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>

                    {/* Shutter button */}
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.shutter')}
                        style={styles.alignItemsCenter}
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

                    {/* Camera flip button */}
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flipCamera')}
                        style={styles.alignItemsEnd}
                        onPress={() => setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'))}
                        sentryLabel="AttachmentCamera-FlipCamera"
                    >
                        <Icon
                            height={32}
                            width={32}
                            src={lazyIcons.CameraFlip}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>
                </View>
            </View>
        </Modal>
    );
}

AttachmentCamera.displayName = 'AttachmentCamera';

export default AttachmentCamera;
export type {CapturedPhoto};
