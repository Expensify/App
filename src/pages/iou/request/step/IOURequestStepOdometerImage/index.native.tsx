import ActivityIndicator from '@components/ActivityIndicator';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useFilesValidation from '@hooks/useFilesValidation';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNativeCamera from '@hooks/useNativeCamera';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setMoneyRequestOdometerImage} from '@libs/actions/OdometerTransactionUtils';
import {getMimeTypeFromUri} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getOdometerImageUri} from '@libs/OdometerUtils';
import ReceiptStorage from '@libs/ReceiptStorage';
import {cancelSpan, endSpan, startSpan} from '@libs/telemetry/activeSpans';
import {logReceiptAdoptFailed} from '@libs/telemetry/ReceiptObservability';

import CameraPermissionPrompt from '@pages/iou/request/step/IOURequestStepScan/components/CameraPermissionPrompt';
import CameraViewport from '@pages/iou/request/step/IOURequestStepScan/components/CameraViewport';
import ScannerControlsBar from '@pages/iou/request/step/IOURequestStepScan/components/ScannerControlsBar';
import {cropImageToAspectRatio} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import type {ImageObject} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';
import getCameraAspectRatio from '@pages/iou/request/step/IOURequestStepScan/getCameraAspectRatio';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';

import type {LayoutRectangle} from 'react-native';
import type {PhotoFile} from 'react-native-vision-camera';

import React, {useRef} from 'react';
import {Alert, View} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {RESULTS} from 'react-native-permissions';
import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {useCameraFormat} from 'react-native-vision-camera';

type IOURequestStepOdometerImageProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.ODOMETER_IMAGE>;

function IOURequestStepOdometerImage({
    route: {
        params: {action, iouType, transactionID, reportID, backToReport, imageType, isEditingConfirmation},
    },
    transaction,
}: IOURequestStepOdometerImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const lazyIcons = useMemoizedLazyExpensifyIcons(['OdometerStart', 'OdometerEnd']);

    const viewfinderLayout = useRef<LayoutRectangle>(null);
    const isTransactionDraft = shouldUseTransactionDraft(action ?? CONST.IOU.ACTION.CREATE, iouType ?? CONST.IOU.TYPE.REQUEST);

    const isInLandscapeMode = useIsInLandscapeMode();

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
    } = useNativeCamera({
        onFocusCleanup: () => {
            cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE);
        },
    });
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const title = imageType === 'start' ? translate('distance.odometer.startTitle') : translate('distance.odometer.endTitle');
    const snapPhotoText = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? translate('distance.odometer.snapPhotoStart') : translate('distance.odometer.snapPhotoEnd');
    const icon = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? lazyIcons.OdometerStart : lazyIcons.OdometerEnd;

    const goBackRoute =
        isEditingConfirmation === 'true'
            ? ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(action, iouType, transactionID, reportID)
            : ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.getRoute(action, iouType, transactionID, reportID, backToReport);

    const navigateBack = () => {
        Navigation.goBack(goBackRoute);
    };

    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    const handleImageSelected = (files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }

        const file = files.at(0);
        if (!file) {
            return;
        }

        const sourceUri = getOdometerImageUri(file);
        const filename = file.name ?? `odometer-${imageType}.jpg`;

        if (!sourceUri) {
            navigateBack();
            return;
        }

        ReceiptStorage.adopt(sourceUri, filename)
            .then((durableName) => ReceiptStorage.toLocalUri(durableName))
            .catch((error: unknown) => {
                logReceiptAdoptFailed({error, captureSource: 'gallery'});
                return sourceUri;
            })
            .then((uri) => {
                setMoneyRequestOdometerImage(
                    transaction,
                    imageType,
                    {
                        uri,
                        name: filename,
                        type: file.type ?? getMimeTypeFromUri(uri) ?? 'image/jpeg',
                        size: file.size,
                    },
                    isTransactionDraft,
                    false,
                );
            })
            .finally(() => {
                navigateBack();
            });
    };

    const {validateFiles} = useFilesValidation(handleImageSelected);

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

        startSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE, {
            name: CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE,
            op: CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_ODOMETER_IMAGE_TYPE]: imageType,
                [CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: 'native',
            },
        });

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
                        cropImageToAspectRatio(imageObject, viewfinderLayout.current?.width, viewfinderLayout.current?.height)
                            .then(({file, filename, source}) =>
                                ReceiptStorage.adopt(source, filename).then((durableName) => ({file, filename, source: ReceiptStorage.toLocalUri(durableName)})),
                            )
                            .then(({file, filename, source}) => {
                                setMoneyRequestOdometerImage(
                                    transaction,
                                    imageType,
                                    {
                                        uri: source,
                                        name: filename,
                                        type: (file as FileObject | undefined)?.type ?? getMimeTypeFromUri(source) ?? 'image/jpeg',
                                        size: (file as FileObject | undefined)?.size,
                                    },
                                    isTransactionDraft,
                                    false,
                                );
                                endSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE);
                                navigateBack();
                            })
                            .catch((error: unknown) => {
                                cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE);
                                setDidCapturePhoto(false);
                                showCameraAlert();
                                Log.warn('Error cropping photo', error instanceof Error ? error.message : String(error));
                            });
                    })
                    .catch((error: unknown) => {
                        cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_CAPTURE);
                        setDidCapturePhoto(false);
                        showCameraAlert();
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        Log.warn('Error taking photo', errorMessage);
                    });
            });
    };

    const format = useCameraFormat(device, [
        {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
        {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
    ]);

    const cameraAspectRatio = getCameraAspectRatio(format, isInLandscapeMode);

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
            <View style={[styles.flex1, isInLandscapeMode && styles.flexRow]}>
                <View style={[styles.flex1]}>
                    {cameraPermissionStatus !== RESULTS.GRANTED && (
                        <CameraPermissionPrompt
                            isInLandscapeMode={isInLandscapeMode}
                            onPress={capturePhoto}
                            subtitle={translate('distance.odometer.cameraAccessRequired')}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.CONTINUE_BUTTON}
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
                            format={format}
                            cameraAspectRatio={cameraAspectRatio}
                            isInLandscapeMode={isInLandscapeMode}
                            shouldFillPortraitViewport={false}
                            tapGesture={tapGesture}
                            cameraFocusIndicatorAnimatedStyle={cameraFocusIndicatorAnimatedStyle}
                            blinkStyle={blinkStyle}
                            isAttachmentPickerActive={isAttachmentPickerActive}
                            onLayout={(e) => (viewfinderLayout.current = e.nativeEvent.layout)}
                            shouldShowFlashButton
                            flashSentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.FLASH}
                            cameraPermissionStatus={cameraPermissionStatus}
                            flash={flash}
                            hasFlash={hasFlash}
                            setFlash={setFlash}
                            didCapturePhoto={didCapturePhoto}
                        >
                            <View style={[styles.odometerPhotoInformationContainer, isInLandscapeMode && styles.w40]}>
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
                        </CameraViewport>
                    )}
                </View>

                <ScannerControlsBar
                    isInLandscapeMode={isInLandscapeMode}
                    cameraPermissionStatus={cameraPermissionStatus}
                    setIsAttachmentPickerActive={setIsAttachmentPickerActive}
                    onAttachmentPickerStatusChange={setIsLoaderVisible}
                    onPicked={(files) => validateFiles(files)}
                    capturePhoto={capturePhoto}
                    gallerySentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.GALLERY}
                    shutterSentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.ODOMETER_IMAGE.SHUTTER}
                />
            </View>
        </StepScreenWrapper>
    );
}

IOURequestStepOdometerImage.displayName = 'IOURequestStepOdometerImage';

const IOURequestStepOdometerImageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepOdometerImage);

export default IOURequestStepOdometerImageWithFullTransactionOrNotFound;
