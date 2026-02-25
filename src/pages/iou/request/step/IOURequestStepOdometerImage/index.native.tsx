import {useFocusEffect} from '@react-navigation/core';
import React, {useRef, useState} from 'react';
import {Alert, AppState, StyleSheet, View} from 'react-native';
import type {LayoutRectangle} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import type {Camera, PhotoFile, Point} from 'react-native-vision-camera';
import {useCameraDevice} from 'react-native-vision-camera';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import {useFullScreenLoaderActions, useFullScreenLoaderState} from '@components/FullScreenLoaderContext';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {showCameraPermissionsAlert} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import CameraPermission from '@pages/iou/request/step/IOURequestStepScan/CameraPermission';
import {cropImageToAspectRatio} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import type {ImageObject} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/NavigationAwareCamera/Camera';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import variables from '@styles/variables';
import {setMoneyRequestOdometerImage} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type IOURequestStepOdometerImageProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ODOMETER_IMAGE>;

function focusCamera(cameraRef: React.RefObject<Camera | null>, point: Point) {
    if (!cameraRef.current) {
        return;
    }

    cameraRef.current.focus(point).catch((error: Record<string, unknown>) => {
        if (error.message === '[unknown/unknown] Cancelled by another startFocusAndMetering()') {
            return;
        }
        Log.warn('Error focusing camera', error);
    });
}

function IOURequestStepOdometerImage({
    route: {
        params: {action, iouType, transactionID, imageType},
    },
}: IOURequestStepOdometerImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'boltSlash', 'OdometerStart', 'OdometerEnd']);
    const lazyIllustrationsOnly = useMemoizedLazyIllustrations(['Hand', 'Shutter']);

    const {isLoaderVisible} = useFullScreenLoaderState();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();
    const [isAttachmentPickerActive, setIsAttachmentPickerActive] = useState(false);

    const device = useCameraDevice('back', {
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
    });
    const platform = getPlatform(true);
    const [mutedPlatforms = getEmptyObject<Partial<Record<Platform, true>>>()] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS);
    const isPlatformMuted = mutedPlatforms[platform];

    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<string | null>(null);
    const hasFlash = !!device?.hasFlash;
    const [flash, setFlash] = useState(false);
    const [didCapturePhoto, setDidCapturePhoto] = useState(false);
    const camera = useRef<Camera>(null);
    const viewfinderLayout = useRef<LayoutRectangle>(null);
    const isTransactionDraft = shouldUseTransactionDraft(action ?? CONST.IOU.ACTION.CREATE, iouType ?? CONST.IOU.TYPE.REQUEST);

    const title = imageType === 'start' ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    const snapPhotoText = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.snapPhotoStart') : translate('distance.odometer.snapPhotoEnd');
    const icon = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? lazyIcons.OdometerStart : lazyIcons.OdometerEnd;

    const navigateBack = () => {
        Navigation.goBack();
    };

    const askForPermissions = () => {
        // There's no way we can check for the BLOCKED status without requesting the permission first
        // https://github.com/zoontek/react-native-permissions/blob/a836e114ce3a180b2b23916292c79841a267d828/README.md?plain=1#L670
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

    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const focusIndicatorOpacity = useSharedValue(0);
    const focusIndicatorScale = useSharedValue(1);
    const focusIndicatorPosition = useSharedValue({x: 0, y: 0});
    const cameraFocusIndicatorAnimatedStyle = useAnimatedStyle(() => ({
        opacity: focusIndicatorOpacity.get(),
        transform: [{translateX: focusIndicatorPosition.get().x}, {translateY: focusIndicatorPosition.get().y}, {scale: focusIndicatorScale.get()}],
    }));

    const tapGesture = Gesture.Tap()
        .enabled(device?.supportsFocus ?? false)
        .runOnJS(true)
        .onStart((ev: {x: number; y: number}) => {
            const point = {x: ev.x, y: ev.y};

            focusIndicatorOpacity.set(withSequence(withTiming(0.8, {duration: 250}), withDelay(1000, withTiming(0, {duration: 250}))));
            focusIndicatorScale.set(2);
            focusIndicatorScale.set(withSpring(1, {damping: 10, stiffness: 200}));
            focusIndicatorPosition.set(point);

            focusCamera(camera, point);
        });

    useFocusEffect(() => {
        setDidCapturePhoto(false);
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

            if (isLoaderVisible) {
                setIsLoaderVisible(false);
            }
        };
    });

    const handleImageSelected = (files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }

        const file = files.at(0);
        const imageUri = (file as {uri?: string}).uri ?? '';
        setMoneyRequestOdometerImage(transactionID, imageType, imageUri, isTransactionDraft);
        navigateBack();
    };

    const {validateFiles, ErrorModal} = useFilesValidation(handleImageSelected);

    const capturePhoto = () => {
        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            showCameraAlert();
            return;
        }

        if (didCapturePhoto) {
            return;
        }

        setDidCapturePhoto(true);

        const path = getReceiptsUploadFolderPath();

        ReactNativeBlobUtil.fs
            .isDir(path)
            .then((isDir) => {
                if (isDir) {
                    return;
                }

                ReactNativeBlobUtil.fs.mkdir(path).catch((error: string) => {
                    Log.warn('Error creating the directory', error);
                });
            })
            .catch((error: string) => {
                Log.warn('Error checking if the directory exists', error);
            })
            .then(() => {
                camera?.current
                    ?.takePhoto({
                        flash: flash && hasFlash ? 'on' : 'off',
                        enableShutterSound: !isPlatformMuted,
                        path,
                    })
                    .then((photo: PhotoFile) => {
                        const imageObject: ImageObject = {file: photo, filename: photo.path, source: getPhotoSource(photo.path)};
                        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height, undefined, photo.orientation)
                            .then(({source}) => {
                                setMoneyRequestOdometerImage(transactionID, imageType, source, isTransactionDraft);
                                navigateBack();
                            })
                            .catch((error: unknown) => {
                                setDidCapturePhoto(false);
                                showCameraAlert();
                                Log.warn('Error cropping photo', error instanceof Error ? error.message : String(error));
                            });
                    })
                    .catch((error: unknown) => {
                        setDidCapturePhoto(false);
                        showCameraAlert();
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        Log.warn('Error taking photo', errorMessage);
                    });
            });
    };

    // Wait for camera permission status to render
    if (cameraPermissionStatus == null) {
        return null;
    }

    return (
        <StepScreenWrapper
            includeSafeAreaPaddingBottom
            headerTitle={title}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepOdometerImage"
        >
            <View style={styles.flex1}>
                {cameraPermissionStatus !== RESULTS.GRANTED && (
                    <View style={[styles.cameraView, styles.permissionView, styles.userSelectNone]}>
                        <ImageSVG
                            contentFit="contain"
                            src={lazyIllustrationsOnly.Hand}
                            width={CONST.RECEIPT.HAND_ICON_WIDTH}
                            height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                            style={styles.pb5}
                        />

                        <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                        <Text style={[styles.subTextFileUpload]}>{translate('distance.odometer.cameraAccessRequired')}</Text>
                        <Button
                            success
                            text={translate('common.continue')}
                            accessibilityLabel={translate('common.continue')}
                            style={[styles.p9, styles.pt5]}
                            onPress={capturePhoto}
                        />
                    </View>
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
                    <View style={[styles.cameraView]}>
                        <GestureDetector gesture={tapGesture}>
                            <View style={styles.flex1}>
                                <NavigationAwareCamera
                                    ref={camera}
                                    device={device}
                                    style={styles.flex1}
                                    zoom={device.neutralZoom}
                                    photo
                                    cameraTabIndex={1}
                                    onLayout={(e) => (viewfinderLayout.current = e.nativeEvent.layout)}
                                    forceInactive={isAttachmentPickerActive}
                                />
                                <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                                    <PressableWithFeedback
                                        role={CONST.ROLE.BUTTON}
                                        accessibilityLabel={translate('receipt.flash')}
                                        disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                                        onPress={() => setFlash((prevFlash) => !prevFlash)}
                                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.FLASH}
                                    >
                                        <Icon
                                            height={variables.iconSizeSmall}
                                            width={variables.iconSizeSmall}
                                            src={lazyIcons.Bolt}
                                            fill={flash ? theme.white : theme.icon}
                                        />
                                    </PressableWithFeedback>
                                </View>
                                <View style={[styles.odometerPhotoInformationContainer]}>
                                    <Icon
                                        height={variables.menuIconSize}
                                        width={variables.menuIconSize}
                                        src={icon}
                                    />
                                    <View style={[styles.flex1, styles.flexColumn]}>
                                        <Text style={[styles.labelStrong, styles.mb1]}>{title}</Text>
                                        <RenderHTML html={snapPhotoText} />
                                    </View>
                                </View>
                                <Animated.View
                                    pointerEvents="none"
                                    style={[StyleSheet.absoluteFillObject, styles.backgroundWhite, blinkStyle, styles.zIndex10]}
                                />
                                <Animated.View style={[styles.cameraFocusIndicator, cameraFocusIndicatorAnimatedStyle]} />
                            </View>
                        </GestureDetector>
                    </View>
                )}
                <View style={[styles.flexRow, styles.justifyContentAround, styles.alignItemsCenter, styles.pv3]}>
                    <AttachmentPicker
                        onOpenPicker={() => {
                            setIsAttachmentPickerActive(true);
                            setIsLoaderVisible(true);
                        }}
                        fileLimit={1}
                        shouldValidateImage={false}
                    >
                        {({openPicker}) => (
                            <PressableWithFeedback
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('receipt.gallery')}
                                style={[styles.alignItemsStart]}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.GALLERY}
                                onPress={() => {
                                    openPicker({
                                        onPicked: (data) => validateFiles(data),
                                        onCanceled: () => setIsLoaderVisible(false),
                                        // makes sure the loader is not visible anymore e.g. when there is an error while uploading a file
                                        onClosed: () => {
                                            setIsAttachmentPickerActive(false);
                                            setIsLoaderVisible(false);
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
                        style={[styles.alignItemsCenter]}
                        onPress={capturePhoto}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.SHUTTER}
                    >
                        <ImageSVG
                            contentFit="contain"
                            src={lazyIllustrationsOnly.Shutter}
                            width={CONST.RECEIPT.SHUTTER_SIZE}
                            height={CONST.RECEIPT.SHUTTER_SIZE}
                        />
                    </PressableWithFeedback>
                    {/* Empty View matching gallery size so justifyContentAround keeps the shutter exactly centered - it's the simplest solution */}
                    <View style={{width: variables.iconSizeMenuItem, height: variables.iconSizeMenuItem}} />
                </View>
                {ErrorModal}
            </View>
        </StepScreenWrapper>
    );
}

IOURequestStepOdometerImage.displayName = 'IOURequestStepOdometerImage';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepOdometerImageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepOdometerImage);

export default IOURequestStepOdometerImageWithFullTransactionOrNotFound;
