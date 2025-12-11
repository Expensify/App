import {useFocusEffect} from '@react-navigation/core';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, AppState, StyleSheet, View} from 'react-native';
import type {LayoutRectangle} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import type {OnyxEntry} from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming} from 'react-native-reanimated';
import type {Camera, PhotoFile, Point} from 'react-native-vision-camera';
import {useCameraDevice} from 'react-native-vision-camera';
import {scheduleOnRN} from 'react-native-worklets';
import ActivityIndicator from '@components/ActivityIndicator';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
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
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import {setMoneyRequestOdometerImage} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import CameraPermission from '../IOURequestStepScan/CameraPermission';
import {cropImageToAspectRatio} from '../IOURequestStepScan/cropImageToAspectRatio';
import type {ImageObject} from '../IOURequestStepScan/cropImageToAspectRatio';
import NavigationAwareCamera from '../IOURequestStepScan/NavigationAwareCamera/Camera';

type IOURequestStepOdometerImageProps = {
    route: {
        params: {
            transactionID: string;
            readingType: 'start' | 'end';
            backTo?: Route;
        };
    };
    transaction: OnyxEntry<Transaction>;
};

function IOURequestStepOdometerImage({
    route: {
        params: {transactionID, readingType, backTo},
    },
}: IOURequestStepOdometerImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'boltSlash']);
    const lazyIllustrationsOnly = useMemoizedLazyIllustrations(['Hand', 'Shutter']);
    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<typeof RESULTS.GRANTED | typeof RESULTS.DENIED | typeof RESULTS.BLOCKED | null>(null);
    const [flash, setFlash] = useState(false);
    const [hasFlash, setHasFlash] = useState(false);
    const [didCapturePhoto, setDidCapturePhoto] = useState(false);
    const camera = useRef<Camera>(null);
    const viewfinderLayout = useRef<LayoutRectangle>(null);
    const isTransactionDraft = shouldUseTransactionDraft(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.REQUEST);

    const device = useCameraDevice('back');
    const platform: Platform = getPlatform();

    const isPlatformMuted = platform === CONST.PLATFORM.IOS;

    const title = readingType === 'start' ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    const message = readingType === 'start' ? translate('distance.odometer.startMessage') : translate('distance.odometer.endMessage');

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const askForPermissions = useCallback(() => {
        showCameraPermissionsAlert();
    }, []);

    const blinkOpacity = useSharedValue(0);
    const focusIndicatorOpacity = useSharedValue(0);
    const focusIndicatorScale = useSharedValue(1);
    const focusIndicatorPosition = useSharedValue({x: 0, y: 0});

    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const showBlink = useCallback(() => {
        blinkOpacity.set(withSequence(withTiming(1, {duration: 0}), withDelay(50, withTiming(0, {duration: 100}))));
    }, [blinkOpacity]);

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

    useFocusEffect(
        useCallback(() => {
            setDidCapturePhoto(false);
            const refreshCameraPermissionStatus = () => {
                CameraPermission?.getCameraPermissionStatus?.()
                    .then(setCameraPermissionStatus)
                    .catch(() => setCameraPermissionStatus(RESULTS.UNAVAILABLE));
            };

            refreshCameraPermissionStatus();

            // Refresh permission status when app gain focus
            const subscription = AppState.addEventListener('change', (appState) => {
                if (appState !== 'active') {
                    return;
                }

                refreshCameraPermissionStatus();
            });

            return () => {
                subscription.remove();
            };
        }, []),
    );

    useEffect(() => {
        if (!device) {
            return;
        }

        const setupCameraCapabilities = async () => {
            const capabilities = await device.getCapabilities();
            if ('torch' in capabilities && !!capabilities.torch) {
                setHasFlash(true);
            }
        };

        setupCameraCapabilities();
    }, [device]);

    const handleImageSelected = useCallback(
        (file: FileObject, source: string) => {
            // On native, we need to save the URI string, not the File object
            const imageUri = typeof file === 'string' ? file : ((file as {uri?: string}).uri ?? source);
            setMoneyRequestOdometerImage(transactionID, readingType, imageUri, isTransactionDraft);
            navigateBack();
        },
        [transactionID, readingType, isTransactionDraft, navigateBack],
    );

    const {validateFiles, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }
        const file = files.at(0);
        if (!file) {
            return;
        }
        // For gallery selection, source is the file URI
        const source = typeof file === 'string' ? file : URL.createObjectURL(file as Blob);
        handleImageSelected(file, source);
    });

    const capturePhoto = useCallback(() => {
        if (!camera.current && (cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED)) {
            askForPermissions();
            return;
        }

        const showCameraAlert = () => {
            Alert.alert(translate('receipt.cameraErrorTitle'), translate('receipt.cameraErrorMessage'));
        };

        if (!camera.current) {
            showCameraAlert();
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
                        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height, undefined, photo.orientation).then(({source}) => {
                            // Store odometer image - on native, save the URI string (source), not the File object
                            setMoneyRequestOdometerImage(transactionID, readingType, source, isTransactionDraft);
                            navigateBack();
                        });
                    })
                    .catch((error: unknown) => {
                        setDidCapturePhoto(false);
                        showCameraAlert();
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        Log.warn('Error taking photo', errorMessage);
                    });
            });
    }, [cameraPermissionStatus, didCapturePhoto, translate, flash, hasFlash, isPlatformMuted, transactionID, readingType, isTransactionDraft, navigateBack, askForPermissions]);

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
                        {cameraPermissionStatus === RESULTS.DENIED || cameraPermissionStatus === RESULTS.BLOCKED ? (
                            <Text style={[styles.subTextFileUpload]}>{translate('receipt.deniedCameraAccess')}</Text>
                        ) : (
                            <Text style={[styles.subTextFileUpload]}>{message}</Text>
                        )}
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
                                />
                                <View style={[styles.flashButtonContainer, styles.primaryMediumIcon, flash && styles.bgGreenSuccess, !hasFlash && styles.opacity0]}>
                                    <PressableWithFeedback
                                        role={CONST.ROLE.BUTTON}
                                        accessibilityLabel={translate('receipt.flash')}
                                        disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                                        onPress={() => setFlash((prevFlash) => !prevFlash)}
                                    >
                                        <Icon
                                            height={16}
                                            width={16}
                                            src={lazyIcons.Bolt}
                                            fill={flash ? theme.white : theme.icon}
                                        />
                                    </PressableWithFeedback>
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
                        onOpenPicker={() => {}}
                        fileLimit={1}
                        shouldValidateImage={false}
                    >
                        {({openPicker}) => (
                            <PressableWithFeedback
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('receipt.gallery')}
                                style={[styles.alignItemsStart]}
                                onPress={() => {
                                    openPicker({
                                        onPicked: (data) => validateFiles(data),
                                        onCanceled: () => {},
                                        onClosed: () => {},
                                    });
                                }}
                            >
                                <Icon
                                    height={32}
                                    width={32}
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
                    >
                        <ImageSVG
                            contentFit="contain"
                            src={lazyIllustrationsOnly.Shutter}
                            width={CONST.RECEIPT.SHUTTER_SIZE}
                            height={CONST.RECEIPT.SHUTTER_SIZE}
                        />
                    </PressableWithFeedback>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.flash')}
                        style={[styles.alignItemsEnd, !hasFlash && styles.opacity0]}
                        onPress={() => setFlash((prevFlash) => !prevFlash)}
                        disabled={!hasFlash}
                    >
                        <Icon
                            height={32}
                            width={32}
                            src={flash ? lazyIcons.Bolt : lazyIcons.boltSlash}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>
                </View>
                {ErrorModal}
            </View>
        </StepScreenWrapper>
    );
}

IOURequestStepOdometerImage.displayName = 'IOURequestStepOdometerImage';

const IOURequestStepOdometerImageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepOdometerImage);

export default IOURequestStepOdometerImageWithFullTransactionOrNotFound;
